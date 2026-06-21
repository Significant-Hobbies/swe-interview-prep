import { Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card } from './ui';
import { useConceptMastery } from '../hooks/useConcepts';
import { useProfile } from '../hooks/useProfile';
import { useReviewMastery } from '../hooks/useReviewMastery';
import { useDrillStore } from '../hooks/useUserStore';
import { buildHorizonCalendar, type HorizonFocus } from '../lib/horizonCalendar';

const FOCUS_ACCENT: Record<HorizonFocus, string> = {
  review: 'text-cyan-300',
  drill: 'text-amber-200',
  build: 'text-sky-200',
  learn: 'text-white/70',
  mock: 'text-violet-300',
};

const FOCUS_HREF: Record<HorizonFocus, string> = {
  review: '/practice/all?tab=reviews',
  drill: '/practice',
  build: '/playground',
  learn: '/learn',
  mock: '/mock',
};

export function HorizonCalendar() {
  const { profile } = useProfile();
  const { mastery } = useConceptMastery();
  const { mastery: rqMastery } = useReviewMastery();
  const { drills } = useDrillStore();

  const days = buildHorizonCalendar({ profile, mastery, rqMastery, drillState: drills });
  if (!days.length || !profile.interviewHorizonDays) return null;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-violet-400" />
          <div>
            <div className="text-sm font-semibold text-white">
              {profile.interviewHorizonDays}-day countdown
            </div>
            <div className="text-[11px] text-white/40">Heuristic day-by-day plan</div>
          </div>
        </div>
        <Link to="/mock" className="text-xs text-sky-400 hover:text-sky-300">
          Mock tab →
        </Link>
      </div>

      <ol className="mt-4 space-y-2">
        {days.map((day, i) => (
          <li key={day.date}>
            <Link
              to={day.concept ? `/concepts/${day.concept.id}` : FOCUS_HREF[day.focus]}
              className={`group flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                i === 0
                  ? 'border-violet-500/30 bg-violet-500/8'
                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/12'
              }`}
            >
              <div className="w-12 shrink-0 font-mono text-[10px] text-white/40">
                {i === 0 ? 'Today' : `+${day.dayOffset}d`}
              </div>
              <div className="min-w-0 flex-1">
                <div className={`text-sm font-medium ${FOCUS_ACCENT[day.focus]}`}>
                  {day.label}
                </div>
                <div className="text-[11px] text-white/40">{day.note}</div>
              </div>
              <div className="shrink-0 font-mono text-[10px] text-white/30">{day.minutes}m</div>
              <ChevronRight className="h-3.5 w-3.5 text-white/20 group-hover:text-white/50" />
            </Link>
          </li>
        ))}
      </ol>
    </Card>
  );
}