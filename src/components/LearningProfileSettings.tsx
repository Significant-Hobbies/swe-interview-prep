import { ROADMAPS } from '../data/learning-os';
import { useProfile } from '../hooks/useProfile';
import {
  type ExperienceLevel,
  experienceLabel,
  minutesLabel,
  type ModalityWeights,
} from '../lib/profile';

const MINUTES = [15, 30, 45, 90] as const;
const EXPERIENCE: ExperienceLevel[] = ['student', 'mid', 'senior'];

export function LearningProfileSettings() {
  const { profile, saveProfile } = useProfile();
  const modPct: ModalityWeights = {
    review: Math.round(profile.modalityWeights.review * 100),
    drill: Math.round(profile.modalityWeights.drill * 100),
    build: Math.round(profile.modalityWeights.build * 100),
    learn: Math.round(profile.modalityWeights.learn * 100),
  };

  return (
    <div className="space-y-5">
      <p className="text-xs text-slate-500">
        Shapes Today&apos;s session length and balance. No AI required.
      </p>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">Daily time</label>
        <div className="flex flex-wrap gap-2">
          {MINUTES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => void saveProfile({ minutesPerDay: m })}
              className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
                profile.minutesPerDay === m
                  ? 'bg-sky-500/15 text-sky-300'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {minutesLabel(m)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">Experience</label>
        <div className="flex flex-wrap gap-2">
          {EXPERIENCE.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => void saveProfile({ experience: e })}
              className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
                profile.experience === e
                  ? 'bg-sky-500/15 text-sky-300'
                  : 'bg-slate-900 text-slate-400'
              }`}
            >
              {experienceLabel(e)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">
          Interview horizon (days)
        </label>
        <input
          type="number"
          min={1}
          max={365}
          placeholder="Optional"
          value={profile.interviewHorizonDays ?? ''}
          onChange={(e) => {
            const v = e.target.value ? parseInt(e.target.value, 10) : null;
            void saveProfile({ interviewHorizonDays: Number.isFinite(v) ? v : null });
          }}
          className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500/50 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">Primary roadmap</label>
        <select
          value={Object.entries(profile.roadmapWeights).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''}
          onChange={(e) => void saveProfile({ roadmapWeights: { [e.target.value]: 1 } })}
          className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100"
        >
          {ROADMAPS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">Session mix (%)</label>
        {(['review', 'drill', 'build', 'learn'] as const).map((key) => (
          <div key={key} className="mb-3">
            <div className="flex justify-between text-xs text-slate-500 capitalize">
              <span>{key}</span>
              <span>{modPct[key]}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={60}
              value={modPct[key]}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10) / 100;
                void saveProfile({
                  modalityWeights: { ...profile.modalityWeights, [key]: val },
                });
              }}
              className="mt-1 w-full accent-sky-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
