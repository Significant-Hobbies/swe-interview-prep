import { Link } from 'react-router-dom';

import { CONCEPT_BY_ID, type Roadmap } from '../data/learning-os';
import type { MasteryEntry } from '../hooks/useConcepts';
import { deriveConceptStatus } from '../lib/conceptState';
import { color } from './ui';

interface RoadmapGraphProps {
  roadmap: Roadmap;
  mastery: Record<string, MasteryEntry>;
}

const NODE_W = 148;
const NODE_H = 44;
const GAP_X = 24;
const GAP_Y = 56;

/** roadmap.sh-style node graph — milestones as columns, concepts as checkable nodes. */
export function RoadmapGraph({ roadmap, mastery }: RoadmapGraphProps) {
  const columns = roadmap.milestones.map((m, col) =>
    m.concepts.map((cid, row) => ({ cid, col, row, milestone: m.title })),
  ).flat();

  const maxRows = Math.max(...roadmap.milestones.map(m => m.concepts.length), 1);
  const width = roadmap.milestones.length * (NODE_W + GAP_X) + GAP_X;
  const height = maxRows * (NODE_H + GAP_Y) + GAP_Y + 32;

  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-black/40 p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[640px] w-full" role="img" aria-label={`${roadmap.title} roadmap graph`}>
        {roadmap.milestones.map((m, col) => {
          const x = GAP_X + col * (NODE_W + GAP_X) + NODE_W / 2;
          return (
            <text key={m.title} x={x} y={18} textAnchor="middle" className="fill-white/40 text-[10px] font-medium">
              {m.title.length > 22 ? `${m.title.slice(0, 20)}…` : m.title}
            </text>
          );
        })}

        {columns.flatMap(({ cid, col, row }) => {
          if (col === 0) return [];
          const prevCol = columns.filter(n => n.col === col - 1);
          const target = prevCol[Math.min(row, prevCol.length - 1)];
          if (!target) return [];
          const x1 = GAP_X + (col - 1) * (NODE_W + GAP_X) + NODE_W;
          const y1 = 36 + target.row * (NODE_H + GAP_Y) + NODE_H / 2;
          const x2 = GAP_X + col * (NODE_W + GAP_X);
          const y2 = 36 + row * (NODE_H + GAP_Y) + NODE_H / 2;
          return [
            <line key={`edge-${cid}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} />,
          ];
        })}

        {columns.map(({ cid, col, row }) => {
          const c = CONCEPT_BY_ID[cid];
          if (!c) return null;
          const status = deriveConceptStatus(mastery[cid]);
          const x = GAP_X + col * (NODE_W + GAP_X);
          const y = 36 + row * (NODE_H + GAP_Y);
          const done = status === 'mastered';
          const active = status !== 'not-started' && !done;
          const fill = done ? 'rgba(16,185,129,0.15)' : active ? 'rgba(56,189,248,0.1)' : 'rgba(255,255,255,0.03)';
          const stroke = done ? 'rgba(16,185,129,0.5)' : active ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.1)';

          return (
            <g key={cid}>
              <rect x={x} y={y} width={NODE_W} height={NODE_H} rx={8} fill={fill} stroke={stroke} strokeWidth={1} />
              <foreignObject x={x} y={y} width={NODE_W} height={NODE_H}>
                <Link
                  to={`/concepts/${cid}`}
                  className="flex h-full items-center gap-2 px-2.5 text-[11px] font-medium leading-tight text-white/90 hover:text-white"
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[9px] ${
                      done
                        ? `${color('emerald').border} ${color('emerald').text}`
                        : active
                          ? `${color('sky').border} ${color('sky').text}`
                          : 'border-white/20 text-white/30'
                    }`}
                  >
                    {done ? '✓' : active ? '·' : ''}
                  </span>
                  <span className="line-clamp-2">{c.name}</span>
                </Link>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </div>
  );
}