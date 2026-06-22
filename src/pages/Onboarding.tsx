import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ROADMAPS } from '../data/learning-os';
import { useProfile } from '../hooks/useProfile';
import {
  DEFAULT_ONBOARDING_PATH_ID,
  ONBOARDING_PATH_GROUPS,
} from '../lib/onboardingPaths';
import {
  type ExperienceLevel,
  experienceLabel,
  minutesLabel,
  type ModalityWeights,
} from '../lib/profile';
import { saveActiveRoadmapId } from '../lib/recommend';
import { STORE_KEYS, saveLocal } from '../lib/userStore';

const MINUTES = [15, 30, 45, 90] as const;
const EXPERIENCE: ExperienceLevel[] = ['student', 'mid', 'senior'];

const MODALITY_LABELS: { key: keyof ModalityWeights; label: string; hint: string }[] = [
  { key: 'review', label: 'Reviews', hint: 'Spaced recall' },
  { key: 'drill', label: 'Drills', hint: 'Verified reps' },
  { key: 'build', label: 'Build', hint: 'Artifacts' },
  { key: 'learn', label: 'Learn', hint: 'Concept reading' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { saveProfile } = useProfile();
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string>(DEFAULT_ONBOARDING_PATH_ID);
  const [minutes, setMinutes] = useState<15 | 30 | 45 | 90>(45);
  const [experience, setExperience] = useState<ExperienceLevel>('mid');
  const [horizon, setHorizon] = useState<string>('');
  const [modalities, setModalities] = useState<ModalityWeights>({
    review: 22, drill: 42, build: 24, learn: 12,
  });

  function setModality(key: keyof ModalityWeights, val: number) {
    setModalities(prev => ({ ...prev, [key]: val }));
  }

  async function finish() {
    const exists = ROADMAPS.some(r => r.id === picked);
    const roadmapId = exists ? picked : DEFAULT_ONBOARDING_PATH_ID;
    saveActiveRoadmapId(roadmapId);
    const horizonDays = horizon ? parseInt(horizon, 10) : null;
    await saveProfile({
      minutesPerDay: minutes,
      experience,
      interviewHorizonDays: Number.isFinite(horizonDays) ? horizonDays : null,
      roadmapWeights: { [roadmapId]: 1 },
      modalityWeights: {
        review: modalities.review / 100,
        drill: modalities.drill / 100,
        build: modalities.build / 100,
        learn: modalities.learn / 100,
      },
    });
    saveLocal(STORE_KEYS.onboarding, { done: true, roadmapId, at: new Date().toISOString() });
    navigate('/today', { replace: true });
  }

  return (
    <div className={`mx-auto w-full px-6 py-16 ${step === 0 ? 'max-w-4xl' : 'max-w-3xl'} ${step === 0 ? '' : 'flex min-h-[70vh] flex-col justify-center'}`}>
      <div className="mb-8 flex items-center gap-2">
        {[0, 1, 2].map(s => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              s <= step ? 'bg-white' : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      {step === 0 && (
        <>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">Step 1 · Path</p>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Pick your primary path.</h1>
          <p className="mt-3 max-w-prose text-sm text-white/50">
            Optional — sizes Today&apos;s session to your schedule and picks a default roadmap. The full catalog stays open at Explore without finishing this.
          </p>

          <div className="mt-10 space-y-10">
            {ONBOARDING_PATH_GROUPS.map(group => (
              <section key={group.id}>
                <h2 className="text-base font-semibold tracking-tight text-white">{group.title}</h2>
                <p className="mt-1 max-w-prose text-xs text-white/45">{group.subtitle}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {group.paths.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPicked(p.id)}
                      className={`rounded-xl border p-4 text-left transition-all duration-150 ${
                        picked === p.id
                          ? 'border-white/30 bg-white/[0.06] ring-1 ring-white/10'
                          : 'border-white/[0.08] bg-black hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-lg">{p.emoji}</span>
                        <span className="font-mono text-[10px] tabular-nums text-white/35">{p.horizon}</span>
                      </div>
                      <div className="mt-2 text-sm font-semibold text-white">{p.title}</div>
                      <div className="mt-1 line-clamp-2 text-xs leading-snug text-white/50">{p.subtitle}</div>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full rounded-full bg-white py-3 text-sm font-semibold text-black hover:bg-white/90 sm:w-auto sm:px-12"
            >
              Continue
            </button>
            <button
              type="button"
              onClick={() => navigate('/explore', { replace: true })}
              className="w-full rounded-full border border-white/15 py-3 text-sm text-white/65 transition-colors hover:border-white/30 hover:text-white sm:w-auto sm:px-8"
            >
              Skip — explore the catalog
            </button>
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">Step 2 · Schedule</p>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">How do you study?</h1>
          <p className="mt-3 text-sm text-white/50">Sessions are packed to fit your day — no infinite queues.</p>

          <div className="mt-8">
            <div className="text-xs font-medium text-white/40">Daily time budget</div>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {MINUTES.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMinutes(m)}
                  className={`rounded-lg border px-3 py-3 text-left text-sm transition-colors ${
                    minutes === m ? 'border-white/30 bg-white/[0.06] text-white' : 'border-white/[0.08] text-white/60 hover:border-white/15'
                  }`}
                >
                  <div className="font-semibold">{m}m</div>
                  <div className="mt-0.5 text-[10px] text-white/40">{minutesLabel(m).split('·')[1]?.trim()}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <div className="text-xs font-medium text-white/40">Experience</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {EXPERIENCE.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setExperience(e)}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    experience === e ? 'border-white/30 bg-white/[0.06] text-white' : 'border-white/[0.08] text-white/60'
                  }`}
                >
                  {experienceLabel(e)}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <label className="text-xs font-medium text-white/40">Interview horizon (optional, days)</label>
            <input
              type="number"
              min={1}
              max={365}
              placeholder="e.g. 21"
              value={horizon}
              onChange={e => setHorizon(e.target.value)}
              className="mt-2 w-full max-w-xs rounded-lg border border-white/[0.08] bg-black px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/25 focus:outline-none"
            />
          </div>

          <div className="mt-8 flex gap-3">
            <button type="button" onClick={() => setStep(0)} className="rounded-full border border-white/15 px-6 py-3 text-sm text-white/70 hover:text-white">
              Back
            </button>
            <button type="button" onClick={() => setStep(2)} className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-black hover:bg-white/90">
              Continue
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">Step 3 · Mix</p>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Session balance.</h1>
          <p className="mt-3 text-sm text-white/50">Rough split for a typical {minutes}-minute day. Adjust anytime in Settings.</p>

          <div className="mt-10 space-y-6">
            {MODALITY_LABELS.map(({ key, label, hint }) => (
              <div key={key}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-white">{label}</span>
                  <span className="font-mono text-xs text-white/50">{modalities[key]}%</span>
                </div>
                <div className="mt-1 text-[10px] text-white/35">{hint}</div>
                <input
                  type="range"
                  min={5}
                  max={60}
                  value={modalities[key]}
                  onChange={e => setModality(key, parseInt(e.target.value, 10))}
                  className="mt-2 w-full accent-white"
                />
              </div>
            ))}
          </div>

          <div className="mt-10 flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="rounded-full border border-white/15 px-6 py-3 text-sm text-white/70 hover:text-white">
              Back
            </button>
            <button
              type="button"
              onClick={() => void finish()}
              className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-black hover:bg-white/90"
            >
              Start today&apos;s plan
            </button>
          </div>
        </>
      )}
    </div>
  );
}