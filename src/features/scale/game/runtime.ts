import {
  advanceEvent,
  campaignAwaiting,
  campaignOutage,
  campaignReady,
  startEvent,
  reviewEvent,
  CAMPAIGN_EVENTS,
} from './campaign';
import { pendingJobs, serviceHealthy } from './health';
import { cacheHitRate } from './topology';
import { projectHours, prerequisite } from './toolkit';
import { challengeStopped, diagnosis, monthlyProfit, targetUsers } from './challenge';
import { Engine } from '../vendor/breakscale/engine';
import type { SimSnapshot } from '../vendor/breakscale/types';
import {
  available,
  companyProfile,
  cost,
  DECISIONS,
  engineeringCost,
  freshCompany,
  log,
  revenue,
  topology,
  traffic,
  upgrade,
  WORKLOADS,
} from './model';
import type { Architecture, Company, Upgrade, Workload } from './model';

export type Command =
  | { type: 'init'; company: Company | null; scenario?: Workload }
  | { type: 'event-start'; approach: 'steady' | 'bold' }
  | { type: 'event-review' }
  | { type: 'event-mitigate' }
  | { type: 'pause' }
  | { type: 'continue' }
  | { type: 'speed'; value: number }
  | { type: 'launch' }
  | { type: 'growth' }
  | { type: 'project'; kind: Upgrade }
  | { type: 'sandbox' }
  | { type: 'return' }
  | { type: 'reset-sandbox' }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'experiment'; kind: Upgrade }
  | { type: 'workload'; value: Workload }
  | { type: 'traffic'; value: number }
  | { type: 'reset-company' }
  | { type: 'fault'; node: string; active: boolean }
  | { type: 'hot-key'; value: number };
export interface View {
  company: Company;
  snapshot: SimSnapshot;
  architecture: Architecture;
  rps: number;
  workload: Workload;
  sandbox: boolean;
  speed: number;
  paused: boolean;
  baseline: SimSnapshot['system'] | null;
  canUndo: boolean;
  canRedo: boolean;
  notice: string;
  offline: string;
  hotKey: number;
}
interface Experiment {
  hotKey: number;
  architecture: Architecture;
  rps: number;
  workload: Workload;
}
export class Runtime {
  company = freshCompany();
  engine = new Engine(
    topology(this.company.architecture, traffic(this.company), this.company.workload),
    42
  );
  sandbox: Experiment | null = null;
  history: Experiment[] = [];
  future: Experiment[] = [];
  baseline: SimSnapshot['system'] | null = null;
  speed = 1;
  sandboxPaused = false;
  notice = '';
  offline = '';
  private companyEngine: Engine | null = null;
  private companyAge = 0;
  private lastIncident = -100;
  private simulationAge = 0;
  constructor(company: Company | null = null) {
    if (company) this.company = structuredClone(company);
    this.company.run ??= { stableHours: 0, continued: false };
    if (campaignAwaiting(this.company) || challengeStopped(this.company) || this.company.cash <= 0)
      this.company.paused = true;
    this.rebuild();
    this.warm();
    if (campaignOutage(this.company) || (this.company.outageUntil ?? 0) > this.company.hours)
      this.engine.injectFailure('app', 'crash');
    if (this.company.pendingJobs) {
      this.engine.restorePending(
        this.company.architecture.stream ? 'stream' : 'queue',
        this.company.pendingJobs
      );
      this.company.paused = true;
      this.offline =
        'Unfinished background jobs restored for review. Resume to drain them; request keys and timing are reconstructed.';
    }
    if (company && !this.company.paused) {
      const away = Math.max(0, Date.now() - company.savedAt);
      if (away > 15000) {
        const cap = Math.min(24, away / 1000);
        let progressed = 0;
        while (progressed < cap) {
          const s = this.engine.snapshot();
          if (this.company.paused || !serviceHealthy(s) || this.company.cash <= 0) break;
          this.step(100);
          progressed += 0.1;
        }
        this.offline = `While you were away, ${progressed.toFixed(1)} company hours passed. ${progressed < cap ? 'Progress stopped at an incident or the end of your challenge.' : 'Offline progress is capped at one company day.'} Your company is paused for review.`;
        this.company.paused = true;
      }
    }
    this.company.pendingJobs = pendingJobs(this.engine.snapshot());
  }
  private warm() {
    for (let i = 0; i < 160; i++) this.engine.advance(50);
    this.simulationAge = 8;
  }
  private rebuild() {
    const a = this.sandbox?.architecture ?? this.company.architecture;
    this.engine = new Engine(
      topology(
        a,
        this.sandbox?.rps ?? traffic(this.company),
        this.sandbox?.workload ?? this.company.workload,
        this.sandbox ? 1 : Math.min(1, this.company.cacheAge / 8)
      ),
      42
    );
    if (this.sandbox)
      this.engine.updateNodeConfig('shards', { hotKeyFraction: this.sandbox.hotKey });
    this.simulationAge = 0;
  }
  step(ms: number) {
    if (this.sandbox ? this.sandboxPaused : this.company.paused || challengeStopped(this.company))
      return;
    const count = this.speed;
    for (let i = 0; i < count; i++) {
      this.engine.advance(ms);
      this.simulationAge += ms / 1000;
      if (this.sandbox) continue;
      const c = this.company;
      const hours = ms / 1000;
      const s = this.engine.snapshot();
      const healthy = serviceHealthy(s);
      const previousHour = c.hours;
      c.hours += hours;
      if (
        (!c.campaign || c.run?.continued) &&
        c.launched &&
        Math.floor(c.hours / 168) > Math.floor(previousHour / 168)
      ) {
        c.outageUntil = c.hours + 12;
        this.engine.injectFailure('app', 'crash');
        log(
          c,
          'Primary application region unavailable',
          'A 12-hour application outage began. A standby region can take over after its routing delay; shared data dependencies remain unprotected.',
          'warn'
        );
      }
      if (c.outageUntil && c.hours >= c.outageUntil) {
        this.engine.clearFailure('app');
        c.outageUntil = 0;
        log(
          c,
          'Primary application region restored',
          'The primary app tier is reachable again. Check whether backlog and errors have recovered.',
          'good'
        );
      }
      if (c.campaign && c.launched && !healthy) {
        const floor = companyProfile(c).users;
        const lost = Math.max(
          0,
          c.users -
            Math.max(floor, c.users * Math.exp(-0.005 * Math.max(0.2, s.system.errorRate) * hours))
        );
        c.users -= lost;
        c.campaign.lostUsers += lost;
      }
      const wasOutage = campaignOutage(c);
      if (advanceEvent(c, healthy, hours)) {
        const p = c.campaign!;
        log(
          c,
          p.passed ? 'Event cleared' : 'Event needs another attempt',
          `${CAMPAIGN_EVENTS[p.stage].title}: ${p.healthyHours.toFixed(1)} healthy hours out of 24. Reward $${p.reward}. ${p.passed ? 'Review the result and choose the next move.' : 'Keep your architecture, improve it, and retry. No reward was paid.'}`,
          p.passed ? 'good' : 'warn'
        );
      }
      if (wasOutage && !campaignOutage(c)) this.engine.clearFailure('app');
      if (c.growth && healthy)
        c.users = Math.min(
          14000,
          c.users * Math.exp((Math.log(1 + companyProfile(c).growth) * hours) / 24)
        );
      c.cash +=
        ((revenue(c) * (1 - Math.min(1, s.system.errorRate)) -
          cost(c.architecture) -
          engineeringCost(c)) *
          hours) /
        720;
      if (c.architecture.cache) c.cacheAge += hours;
      if (c.project) {
        c.project.remaining -= hours;
        if (c.project.remaining <= 0) {
          const d = DECISIONS.find((d) => d.id === c.project?.kind)!;
          const carry = d.id === 'stream' ? pendingJobs(s) : 0;
          c.architecture = upgrade(c.architecture, d.id);
          c.project = null;
          log(
            c,
            `${d.title}: deployed`,
            d.id === 'cache'
              ? 'Redis is warming. Watch cache hits grow over the next 8 company hours.'
              : 'The change is live. Compare throughput, waiting requests and tail latency.',
            'good'
          );
          this.engine.setTopology(
            topology(c.architecture, traffic(c), c.workload, Math.min(1, c.cacheAge / 8))
          );
          if (carry) this.engine.restorePending('stream', carry);
        }
      }
      this.engine.updateNodeConfig('users', { rps: traffic(c) });
      if (c.architecture.cache)
        this.engine.updateNodeConfig('cache', {
          hitRate: cacheHitRate(c.architecture, WORKLOADS[c.workload], Math.min(1, c.cacheAge / 8)),
        });
      if (!healthy && c.hours - this.lastIncident > 12 && this.simulationAge > 5) {
        const bottleneck = Object.entries(s.nodes)
          .filter(([id]) => id !== 'users')
          .sort((a, b) => b[1].queued - a[1].queued || b[1].utilization - a[1].utilization)[0];
        if (bottleneck) {
          const name =
            bottleneck[0] === 'db'
              ? 'MySQL'
              : bottleneck[0] === 'app'
                ? 'App server'
                : bottleneck[0];
          log(
            c,
            s.activeFailures.length
              ? 'Service interrupted by a component outage'
              : `${name} is under pressure`,
            `${bottleneck[1].queued} requests waiting; ${Math.round(bottleneck[1].utilization * 100)}% concurrency utilization. System p99 ${Math.round(s.system.p99)}ms, ${(s.system.errorRate * 100).toFixed(1)}% errors. Organic growth pauses while the service target is missed. ${diagnosis(c, s)}`,
            'warn'
          );
          this.lastIncident = c.hours;
        }
      }
      c.pendingJobs = pendingJobs(this.engine.snapshot());
      const run = (c.run ??= { stableHours: 0, continued: false });
      if (run.completedAt === undefined) {
        run.stableHours =
          campaignReady(c) &&
          c.launched &&
          c.users >= targetUsers(c) &&
          healthy &&
          monthlyProfit(c, s.system) > 0 &&
          this.simulationAge >= 5
            ? Math.min(24, run.stableHours + hours)
            : 0;
        if (run.stableHours >= 24 && c.cash > 0) {
          run.completedAt = c.hours;
          c.paused = true;
          log(
            c,
            'Challenge completed',
            'Launched, grew to 5× the starting audience, and held profitable service below 500ms p99 and 2% errors for 24 continuous company hours.',
            'good'
          );
          break;
        }
      }
      if (c.cash <= 0) {
        c.cash = 0;
        c.paused = true;
        log(
          c,
          'Runway exhausted',
          'The company is paused. Explore alternatives in Sandbox, or start a new company from the guide.',
          'warn'
        );
        break;
      }
      if (c.paused) break;
    }
  }
  command(command: Exclude<Command, { type: 'init' }>) {
    this.notice = '';
    const c = this.company;
    if (
      !this.sandbox &&
      (challengeStopped(c) || c.cash <= 0) &&
      ['launch', 'growth', 'project'].includes(command.type)
    ) {
      this.notice =
        'This run is paused for review. Continue a completed challenge or start a new company.';
      return;
    }
    switch (command.type) {
      case 'event-start':
        if (
          !this.sandbox &&
          c.cash > 0 &&
          ['steady', 'bold'].includes(command.approach) &&
          startEvent(c, command.approach)
        ) {
          if (campaignOutage(c)) this.engine.injectFailure('app', 'crash');
          this.engine.updateNodeConfig('users', { rps: traffic(c) });
          log(
            c,
            CAMPAIGN_EVENTS[c.campaign!.stage].title,
            `${command.approach === 'bold' ? 'Ambitious' : 'Cautious'} approach selected. Serve 14 healthy hours in the next 24. You can mitigate at a quarter of the reward.`
          );
        }
        break;
      case 'event-review':
        if (!this.sandbox && c.cash > 0) reviewEvent(c);
        break;
      case 'event-mitigate':
        if (!this.sandbox && c.campaign?.phase === 'active' && !c.campaign.mitigated) {
          const outage = campaignOutage(c);
          c.campaign.mitigated = true;
          if (outage) this.engine.clearFailure('app');
          this.engine.updateNodeConfig('users', { rps: traffic(c) });
          log(
            c,
            'Safer operating mode',
            'Extra traffic was curtailed or maintenance was rolled back. Maximum event reward reduced to a quarter; ordinary engineering and recovery remain available.',
            'warn'
          );
        }
        break;
      case 'fault':
        if (
          this.sandbox &&
          command.node !== 'users' &&
          this.engine.snapshot().nodes[command.node]
        ) {
          if (command.active) this.engine.injectFailure(command.node, 'crash');
          else this.engine.clearFailure(command.node);
        }
        break;
      case 'hot-key':
        if (this.sandbox && Number.isFinite(command.value)) {
          this.record();
          this.sandbox.hotKey = Math.max(0, Math.min(0.95, command.value));
          this.rebuild();
          this.warm();
        }
        break;
      case 'continue':
        if (!this.sandbox && c.run?.completedAt !== undefined && c.cash > 0) {
          c.run.continued = true;
          c.paused = false;
        }
        break;
      case 'pause':
        if (this.sandbox) this.sandboxPaused = !this.sandboxPaused;
        else if (c.cash > 0 && !challengeStopped(c)) c.paused = !c.paused;
        break;
      case 'speed':
        this.speed = [1, 4].includes(command.value) ? command.value : 1;
        break;
      case 'growth':
        if (!this.sandbox) c.growth = !c.growth;
        break;
      case 'launch':
        if (!this.sandbox && !c.launched && c.cash >= 100) {
          c.cash -= 100;
          c.users *= 3;
          c.launched = true;
          if (c.campaign?.phase === 'waiting') {
            c.campaign.phase = 'offer';
            c.paused = true;
          }
          log(
            c,
            'Your launch found its audience',
            'Traffic grew 3×. Marketing cost $100. Follow the request path to see where the pressure lands.',
            'warn'
          );
          this.engine.updateNodeConfig('users', { rps: traffic(c) });
        }
        break;
      case 'project': {
        const d = DECISIONS.find((d) => d.id === command.kind);
        if (this.sandbox || !d || c.project || !available(c.architecture, d.id)) {
          this.notice =
            prerequisite(c.architecture, command.kind) ??
            'Finish the current project or choose an available upgrade.';
          break;
        }
        if (c.cash < d.upfront) {
          this.notice = 'There is not enough cash to start this project.';
          break;
        }
        c.cash -= d.upfront;
        const hours = projectHours(c.architecture, d);
        c.project = { kind: d.id, remaining: hours, total: hours };
        log(
          c,
          `${d.title}: started`,
          `${hours} company hours to deploy. $${d.upfront} setup cost; engineering burns $600/mo while active.`
        );
        break;
      }
      case 'sandbox':
        if (!this.sandbox) {
          this.companyEngine = this.engine;
          this.companyAge = this.simulationAge;
          this.baseline = structuredClone(this.engine.snapshot().system);
          this.sandbox = {
            hotKey: 0,
            architecture: { ...c.architecture },
            rps: traffic(c),
            workload: c.workload,
          };
          this.history = [];
          this.future = [];
          this.sandboxPaused = false;
          this.rebuild();
          this.warm();
        }
        break;
      case 'return':
        if (this.sandbox && this.companyEngine) {
          this.sandbox = null;
          this.history = [];
          this.future = [];
          this.engine = this.companyEngine;
          this.simulationAge = this.companyAge;
          this.companyEngine = null;
        }
        break;
      case 'reset-sandbox':
        if (this.sandbox) {
          this.record();
          this.sandbox = {
            hotKey: 0,
            architecture: { ...c.architecture },
            rps: traffic(c),
            workload: c.workload,
          };
          this.rebuild();
          this.warm();
        }
        break;
      case 'undo':
        if (this.sandbox && this.history.length) {
          this.future.push(structuredClone(this.sandbox));
          this.sandbox = this.history.pop()!;
          this.rebuild();
          this.warm();
        }
        break;
      case 'redo':
        if (this.sandbox && this.future.length) {
          this.history.push(structuredClone(this.sandbox));
          this.sandbox = this.future.pop()!;
          this.rebuild();
          this.warm();
        }
        break;
      case 'experiment':
        if (this.sandbox && available(this.sandbox.architecture, command.kind)) {
          this.record();
          this.sandbox.architecture = upgrade(this.sandbox.architecture, command.kind);
          this.rebuild();
          this.warm();
        }
        break;
      case 'traffic':
        if (this.sandbox && Number.isFinite(command.value)) {
          this.record();
          this.sandbox.rps = Math.max(10, Math.min(5000, command.value));
          this.rebuild();
          this.warm();
        }
        break;
      case 'workload':
        if (this.sandbox && command.value in WORKLOADS) {
          this.record();
          this.sandbox.workload = command.value;
          this.rebuild();
          this.warm();
        }
        break;
      case 'reset-company':
        this.company = freshCompany(c.scenario ?? 'saas');
        this.companyEngine = null;
        this.sandbox = null;
        this.baseline = null;
        this.history = [];
        this.future = [];
        this.offline = '';
        this.lastIncident = -100;
        this.rebuild();
        this.warm();
        break;
    }
  }
  private record() {
    if (this.sandbox) {
      this.history.push(structuredClone(this.sandbox));
      this.history = this.history.slice(-30);
      this.future = [];
    }
  }
  view(): View {
    this.company.pendingJobs = pendingJobs((this.companyEngine ?? this.engine).snapshot());
    return {
      company: structuredClone(this.company),
      snapshot: this.engine.snapshot(),
      architecture: this.sandbox?.architecture ?? this.company.architecture,
      rps: this.sandbox?.rps ?? traffic(this.company),
      workload: this.sandbox?.workload ?? this.company.workload,
      sandbox: !!this.sandbox,
      speed: this.speed,
      paused: this.sandbox ? this.sandboxPaused : this.company.paused,
      baseline: this.baseline,
      canUndo: !!this.history.length,
      canRedo: !!this.future.length,
      notice: this.notice,
      offline: this.offline,
      hotKey: this.sandbox?.hotKey ?? 0,
    };
  }
}
