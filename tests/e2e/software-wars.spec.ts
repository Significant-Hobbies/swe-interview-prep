import { expect, test, type BrowserContext, type Page } from '@playwright/test';

const users = {
  ada: { id: 'wars-ada', email: 'ada@example.test', name: 'Ada' },
  grace: { id: 'wars-grace', email: 'grace@example.test', name: 'Grace' },
};

const questions = [
  {
    id: 'blitz-q-1:v1',
    topic: 'apis',
    difficulty: 'medium',
    stem: 'Which property makes retrying an operation safe?',
    options: [
      { id: 'a', label: 'Idempotency' },
      { id: 'b', label: 'Fan-out' },
      { id: 'c', label: 'Compression' },
      { id: 'd', label: 'Polling' },
    ],
  },
  {
    id: 'blitz-q-2:v1',
    topic: 'databases',
    difficulty: 'medium',
    stem: 'What protects a database write from partial commit?',
    options: [
      { id: 'a', label: 'A transaction' },
      { id: 'b', label: 'A CDN' },
      { id: 'c', label: 'A DNS record' },
      { id: 'd', label: 'A cache key' },
    ],
  },
];

function ok(data: unknown) {
  return JSON.stringify({ ok: true, data });
}

async function seedUser(context: BrowserContext, user: (typeof users)[keyof typeof users]) {
  await context.addInitScript((profile) => {
    localStorage.removeItem('dsa-prep-guest');
    localStorage.setItem('dsa-prep-profile', JSON.stringify(profile));
    localStorage.setItem('swe-os:onboarding-v1', JSON.stringify({ done: true }));
  }, user);
}

async function mockAuth(page: Page, user: (typeof users)[keyof typeof users]) {
  await page.route('**/api/auth/verify', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user }) })
  );
}

async function mockRealtime(context: BrowserContext, side: 'side_a' | 'side_b') {
  await context.addInitScript(
    ({ participantSide }) => {
      const buildState = (phase: string, version: number) => ({
        matchId: 'tradeoff-match-1',
        phase,
        phaseStartedAt: Date.now(),
        phaseEndsAt: ['complete', 'adjudicating'].includes(phase) ? null : Date.now() + 60_000,
        stateVersion: version,
        eventCursor: version,
        serverNow: Date.now(),
        prompt:
          phase === 'check_in'
            ? null
            : 'Design a globally distributed webhook delivery platform with tenant isolation.',
        hiddenTwist: ['check_in', 'initial_solution'].includes(phase)
          ? null
          : 'A single tenant now has a fifty-million-event backlog.',
        ready: { side_a: true, side_b: true },
        transcriptConsent: { side_a: false, side_b: false },
        ownVote: null,
        votes: undefined,
        result: phase === 'complete' ? 'side_a' : null,
        noShowClaimAvailableTo: null,
      });

      class FakeWebSocket extends EventTarget {
        static OPEN = 1;
        static CLOSED = 3;
        readyState = 0;

        constructor(_url: string | URL) {
          super();
          (window as any).__warsSocket = this;
          (window as any).__setWarsState = (phase: string, version: number) => {
            this.dispatchEvent(
              new MessageEvent('message', {
                data: JSON.stringify({ type: 'state', state: buildState(phase, version) }),
              })
            );
          };
          window.setTimeout(() => {
            this.readyState = FakeWebSocket.OPEN;
            this.dispatchEvent(new Event('open'));
            this.dispatchEvent(
              new MessageEvent('message', {
                data: JSON.stringify({ type: 'connected', state: buildState('check_in', 1) }),
              })
            );
          }, 0);
        }

        send(raw: string) {
          const command = JSON.parse(raw);
          if (command.type === 'ready') {
            window.setTimeout(() => (window as any).__setWarsState('initial_solution', 2), 0);
          }
          if (command.type === 'vote') {
            window.setTimeout(() => (window as any).__setWarsState('adjudicating', 7), 0);
          }
        }

        close() {
          this.readyState = FakeWebSocket.CLOSED;
          this.dispatchEvent(new CloseEvent('close'));
        }
      }

      Object.defineProperty(window, 'WebSocket', { value: FakeWebSocket, configurable: true });
      (window as any).__warsParticipantSide = participantSide;
    },
    { participantSide: side }
  );
}

test('Blitz ghost battle stays answer-safe and creates an acceptable challenge', async ({
  browser,
  isMobile,
}) => {
  test.skip(Boolean(isMobile), 'Two-context flows run once in the desktop project.');
  const adaContext = await browser.newContext();
  const graceContext = await browser.newContext();
  await seedUser(adaContext, users.ada);
  await seedUser(graceContext, users.grace);
  const ada = await adaContext.newPage();
  const grace = await graceContext.newPage();
  await mockAuth(ada, users.ada);
  await mockAuth(grace, users.grace);

  let answers = 0;
  await ada.route('**/api/wars/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === '/api/wars/blitz/matches' && route.request().method() === 'POST') {
      return route.fulfill({
        contentType: 'application/json',
        body: ok({
          matchId: 'blitz-match-1',
          ranked: true,
          deadlineAt: new Date(Date.now() + 90_000).toISOString(),
          opponent: { displayName: 'Grace', participantType: 'ghost' },
          questions,
        }),
      });
    }
    if (url.pathname === '/api/wars/blitz/matches/blitz-match-1') {
      return route.fulfill({
        contentType: 'application/json',
        body: ok({
          matchId: 'blitz-match-1',
          status: 'active',
          ranked: true,
          deadlineAt: new Date(Date.now() + 90_000).toISOString(),
          opponent: { displayName: 'Grace', participantType: 'ghost' },
          questions,
          answeredQuestionIds: [],
        }),
      });
    }
    if (url.pathname.endsWith('/answers')) {
      answers += 1;
      return route.fulfill({ contentType: 'application/json', body: ok({ accepted: true }) });
    }
    if (url.pathname.endsWith('/finalize')) {
      return route.fulfill({
        contentType: 'application/json',
        body: ok({
          outcome: 'win',
          score: { correct: 2, total: 2, responseMs: 12_000 },
          opponent: { displayName: 'Grace', correct: 1 },
          rating: { before: 1500, after: 1524, delta: 24 },
          mistakes: [],
          weaknesses: [],
        }),
      });
    }
    if (url.pathname === '/api/wars/challenges') {
      return route.fulfill({
        contentType: 'application/json',
        body: ok({ token: 'blitz-challenge-token', expiresAt: '2026-08-20T00:00:00.000Z' }),
      });
    }
    return route.fulfill({ status: 404, contentType: 'application/json', body: ok(null) });
  });

  await ada.goto('/wars/blitz');
  await ada.getByRole('button', { name: /Find opponent/i }).click();
  await expect(ada.getByText('You vs Grace')).toBeVisible();
  await expect(ada.getByText(/Idempotency is the correct answer/i)).toHaveCount(0);
  await ada.keyboard.press('1');
  await expect(ada.getByRole('radio', { name: /1 Idempotency/ })).toBeChecked();
  await ada.keyboard.press('Enter');
  await expect(
    ada.getByRole('heading', { name: 'What protects a database write from partial commit?' })
  ).toBeVisible();
  await ada.keyboard.press('1');
  await expect(ada.getByRole('radio', { name: /1 A transaction/ })).toBeChecked();
  await ada.keyboard.press('Enter');
  await expect(ada.getByRole('heading', { name: '2/2 correct' })).toBeVisible();
  expect(answers).toBe(2);
  await ada.getByRole('button', { name: 'Challenge' }).click();

  await grace.route('**/api/wars/challenges/blitz-challenge-token', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: ok({
        id: 'challenge-1',
        mode: 'blitz',
        status: 'open',
        expiresAt: '2026-08-20T00:00:00.000Z',
        challenger: { displayName: 'Ada' },
        rules: { durationSeconds: 90 },
      }),
    })
  );
  await grace.route('**/api/wars/challenges/blitz-challenge-token/accept', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: ok({ matchId: 'accepted-blitz-match' }),
    })
  );
  await grace.route('**/api/wars/blitz/matches/accepted-blitz-match', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: ok({
        matchId: 'accepted-blitz-match',
        ranked: false,
        deadlineAt: new Date(Date.now() + 90_000).toISOString(),
        opponent: { displayName: 'Ada', participantType: 'ghost' },
        questions,
        answeredQuestionIds: [],
      }),
    })
  );
  await grace.goto('/wars/challenge/blitz-challenge-token');
  await expect(grace.getByRole('heading', { name: 'Ada challenged you.' })).toBeVisible();
  await grace.getByRole('button', { name: /Accept challenge/i }).click();
  await expect(grace).toHaveURL(/\/wars\/blitz\/accepted-blitz-match/);

  await adaContext.close();
  await graceContext.close();
});

test('two Tradeoff clients receive the same twist, reconnect, reveal, vote, and resolve', async ({
  browser,
  isMobile,
}) => {
  test.skip(Boolean(isMobile), 'Two-context flows run once in the desktop project.');
  const adaContext = await browser.newContext();
  const graceContext = await browser.newContext();
  await seedUser(adaContext, users.ada);
  await seedUser(graceContext, users.grace);
  await mockRealtime(adaContext, 'side_a');
  await mockRealtime(graceContext, 'side_b');
  const ada = await adaContext.newPage();
  const grace = await graceContext.newPage();
  await mockAuth(ada, users.ada);
  await mockAuth(grace, users.grace);

  const roomFor = (side: 'side_a' | 'side_b') => ({
    matchId: 'tradeoff-match-1',
    status: 'check_in',
    phase: 'check_in',
    phaseEndsAt: new Date(Date.now() + 60_000).toISOString(),
    stateVersion: 1,
    ranked: true,
    scheduledFor: new Date().toISOString(),
    durationSeconds: 1800,
    participant: { id: `participant-${side}`, side, status: 'ready' },
    opponent: { displayName: side === 'side_a' ? 'Grace' : 'Ada', participantType: 'human' },
    problem: {
      id: 'tradeoff-webhook:v1',
      title: 'Webhook Delivery Platform',
      prompt: null,
      hiddenTwist: null,
      allowedTools: ['documentation', 'ai'],
      allowedArtifacts: ['text', 'code', 'schema', 'pseudocode', 'diagram'],
    },
    media: {
      provider: 'disabled',
      status: 'disabled',
      transcriptConsent: { sideA: false, sideB: false },
    },
    serverNow: new Date().toISOString(),
  });

  async function routes(page: Page, side: 'side_a' | 'side_b') {
    await page.route('**/api/wars/**', async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname.endsWith('/check-in')) {
        return route.fulfill({
          contentType: 'application/json',
          body: ok({
            room: roomFor(side),
            realtime: {
              token: `token-${side}`,
              url: 'https://wars-realtime.example.test/matches/tradeoff-match-1/connect',
              expiresInSeconds: 300,
            },
          }),
        });
      }
      if (url.pathname.endsWith('/media-token')) {
        return route.fulfill({
          contentType: 'application/json',
          body: ok({
            available: false,
            provider: 'disabled',
            reason: 'RealtimeKit disabled in E2E',
          }),
        });
      }
      if (url.pathname.endsWith('/artifacts') && route.request().method() === 'POST') {
        return route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: ok({ id: `artifact-${side}`, version: 1, contentHash: 'hash', sizeBytes: 42 }),
        });
      }
      if (url.pathname.endsWith('/artifacts')) {
        return route.fulfill({
          contentType: 'application/json',
          body: ok({
            revealed: true,
            artifacts: [
              {
                id: 'artifact-a',
                side: 'side_a',
                artifactType: 'text',
                phase: 'revision',
                version: 1,
                status: 'revealed',
                content: 'Partition by tenant and isolate retry queues.',
                contentHash: 'hash-a',
                sizeBytes: 47,
                editable: false,
              },
              {
                id: 'artifact-b',
                side: 'side_b',
                artifactType: 'text',
                phase: 'revision',
                version: 1,
                status: 'revealed',
                content: 'Use fair scheduling across tenant backlogs.',
                contentHash: 'hash-b',
                sizeBytes: 43,
                editable: false,
              },
            ],
          }),
        });
      }
      if (url.pathname.endsWith('/result')) {
        return route.fulfill({
          contentType: 'application/json',
          body: ok({
            matchId: 'tradeoff-match-1',
            status: 'complete',
            phase: 'complete',
            ranked: true,
            result: 'side_a',
            outcome: side === 'side_a' ? 'win' : 'loss',
            opponent: roomFor(side).opponent,
            evaluation: {
              type: 'ai_adjudication',
              status: 'valid',
              winner: 'side_a',
              reasoning: 'Side A defended tenant isolation with stronger failure handling.',
              rubricScores: [],
              lastErrorCode: null,
            },
            rating: {
              before: 1500,
              after: side === 'side_a' ? 1524 : 1476,
              delta: side === 'side_a' ? 24 : -24,
            },
            weaknesses: [],
            artifacts: { revealed: true, artifacts: [] },
            transcript: { status: 'not_requested', retainedUntil: null },
            shareSlug: 'tradeoff-result-slug',
            completedAt: new Date().toISOString(),
          }),
        });
      }
      return route.fulfill({ contentType: 'application/json', body: ok(roomFor(side)) });
    });
  }

  await routes(ada, 'side_a');
  await routes(grace, 'side_b');
  await Promise.all([
    ada.goto('/wars/tradeoff/tradeoff-match-1'),
    grace.goto('/wars/tradeoff/tradeoff-match-1'),
  ]);
  await expect(ada.getByText('Room connected')).toBeVisible();
  await expect(grace.getByText('Room connected')).toBeVisible();
  await Promise.all([
    ada.evaluate(() => (window as any).__setWarsState('initial_solution', 2)),
    grace.evaluate(() => (window as any).__setWarsState('initial_solution', 2)),
  ]);
  await expect(
    ada.getByText('Design a globally distributed webhook delivery platform')
  ).toBeVisible();
  await expect(
    grace.getByText('Design a globally distributed webhook delivery platform')
  ).toBeVisible();
  await ada.getByRole('textbox', { name: 'Text artifact' }).fill('Partition by tenant.');

  await Promise.all([
    ada.evaluate(() => (window as any).__setWarsState('revision', 3)),
    grace.evaluate(() => (window as any).__setWarsState('revision', 3)),
  ]);
  await expect(
    ada.getByText('A single tenant now has a fifty-million-event backlog.')
  ).toBeVisible();
  await expect(
    grace.getByText('A single tenant now has a fifty-million-event backlog.')
  ).toBeVisible();

  await grace.reload();
  await expect(grace.getByText('Room connected')).toBeVisible();
  await grace.evaluate(() => (window as any).__setWarsState('initial_solution', 2));
  await expect(
    grace.getByText('Design a globally distributed webhook delivery platform')
  ).toBeVisible();
  await grace.evaluate(() => (window as any).__setWarsState('revision', 3));
  await expect(
    grace.getByText('A single tenant now has a fifty-million-event backlog.')
  ).toBeVisible();

  await Promise.all([
    ada.evaluate(() => (window as any).__setWarsState('debate', 5)),
    grace.evaluate(() => (window as any).__setWarsState('debate', 5)),
  ]);
  await expect(ada.getByRole('region', { name: 'Revealed artifacts' })).toContainText(
    'fair scheduling'
  );

  await Promise.all([
    ada.evaluate(() => (window as any).__setWarsState('voting', 6)),
    grace.evaluate(() => (window as any).__setWarsState('voting', 6)),
  ]);
  await ada.getByRole('button', { name: 'win', exact: true }).click();
  await grace.getByRole('button', { name: 'loss', exact: true }).click();
  await Promise.all([
    ada.getByRole('button', { name: /Submit private vote/i }).click(),
    grace.getByRole('button', { name: /Submit private vote/i }).click(),
  ]);
  await expect(ada.getByRole('heading', { name: 'Judgment wins.' })).toBeVisible();
  await expect(grace.getByRole('heading', { name: 'Argument lost.' })).toBeVisible();
  await expect(ada.getByText(/stronger failure handling/i)).toBeVisible();

  await adaContext.close();
  await graceContext.close();
});

test('guest and public Wars routes preserve compact accessibility and private data', async ({
  context,
  page,
}) => {
  await context.addInitScript(() => {
    localStorage.setItem('dsa-prep-guest', '1');
    localStorage.setItem('swe-os:onboarding-v1', JSON.stringify({ done: true }));
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/wars/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === '/api/wars/status') {
      return route.fulfill({
        contentType: 'application/json',
        body: ok({
          blitzEnabled: true,
          tradeoffPreviewEnabled: true,
          mediaConfigured: false,
          content: {
            authoredCandidateBlitzQuestions: 1200,
            activeBlitzQuestions: 200,
            activeBlitzQuestionVersions: 200,
            distinctAuthoredBlitzQuestions: 200,
            activeTradeoffProblems: 20,
            blitzLaunchMinimum: 1200,
            tradeoffLaunchMinimum: 20,
          },
        }),
      });
    }
    if (url.pathname === '/api/wars/leaderboard') {
      return route.fulfill({ contentType: 'application/json', body: ok([]) });
    }
    if (url.pathname === '/api/wars/results/public-safe') {
      return route.fulfill({
        contentType: 'application/json',
        body: ok({
          mode: 'blitz',
          ranked: true,
          finalizedAt: '2026-08-13T00:00:00.000Z',
          result: 'side_a',
          questionCount: 7,
          participants: [
            { side: 'side_a', displayName: 'Ada', correct: 6 },
            { side: 'side_b', displayName: 'Grace', correct: 5 },
          ],
        }),
      });
    }
    if (url.pathname === '/api/wars/challenges/public-challenge') {
      return route.fulfill({
        contentType: 'application/json',
        body: ok({
          id: 'challenge-public',
          mode: 'blitz',
          status: 'open',
          expiresAt: '2026-08-20T00:00:00.000Z',
          challenger: { displayName: 'Ada' },
          rules: { durationSeconds: 90 },
        }),
      });
    }
    return route.fulfill({ status: 404, contentType: 'application/json', body: ok(null) });
  });

  await page.goto('/wars');
  await expect(page.getByRole('heading', { name: /Choose your clock./i })).toBeVisible();
  const quickBattle = page.getByRole('link', { name: /Start one-minute battle/i });
  await expect(quickBattle).toBeVisible();
  expect(
    await quickBattle.evaluate((element) => element.getBoundingClientRect().height)
  ).toBeGreaterThanOrEqual(44);
  expect(
    await quickBattle.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).transitionDuration)
    )
  ).toBeLessThanOrEqual(0.001);

  await page.goto('/wars/blitz');
  await expect(page.getByRole('link', { name: 'Exit Blitz' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Primary' })).toHaveCount(0);
  await page.getByRole('button', { name: /Start preview/i }).click();
  const question = page.getByRole('heading', { name: /A client retries a timed-out POST/i });
  await expect(question).toBeFocused();
  const firstAnswer = page.getByRole('radio').first();
  expect(
    await firstAnswer.evaluate((element) => element.getBoundingClientRect().height)
  ).toBeGreaterThanOrEqual(44);
  await expect(page.getByText(/durable idempotency key binds retries/i)).toHaveCount(0);

  await page.goto('/wars/results/public-safe');
  await expect(page.getByRole('heading', { name: 'Blitz complete.' })).toBeVisible();
  await expect(
    page.getByText(/private drafts, and transcripts are intentionally excluded/i)
  ).toBeVisible();
  await expect(page.getByText('PRIVATE_ANSWER_SENTINEL')).toHaveCount(0);

  await page.goto('/wars/challenge/public-challenge');
  await expect(page.getByText(/Sign in from the header before accepting/i)).toBeVisible();
  const practice = page.getByRole('link', { name: /Practice meanwhile/i });
  expect(
    await practice.evaluate((element) => element.getBoundingClientRect().height)
  ).toBeGreaterThanOrEqual(44);
});
