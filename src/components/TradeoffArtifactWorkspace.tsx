import { Braces, Code2, FileText, PenTool } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from 'react-resizable-panels';

import { useIsCompactLayout } from '../hooks/useMediaQuery';
import type { Language } from '../types';
import CodeEditor from './CodeEditor';
import DiagramEditor, { type DiagramDocument } from './DiagramEditor';

export type TradeoffArtifactKind = 'Text' | 'Code' | 'Schema' | 'Pseudocode' | 'Diagram';
export type TradeoffDrafts = Record<TradeoffArtifactKind, string>;

function parseDiagram(value: string): DiagramDocument | null {
  if (!value.trim()) return null;
  try {
    const document = JSON.parse(value) as DiagramDocument;
    return Array.isArray(document.elements) ? document : null;
  } catch {
    return null;
  }
}

const DESIGN_KINDS = ['Text', 'Schema', 'Pseudocode'] as const;
type DesignKind = (typeof DESIGN_KINDS)[number];
type CompactPanel = 'design' | 'code' | 'diagram';

export function TradeoffArtifactWorkspace({
  drafts,
  onChange,
  frozen,
  diagramId,
  savedLabel,
}: {
  drafts: TradeoffDrafts;
  onChange: (kind: TradeoffArtifactKind, value: string) => void;
  frozen: boolean;
  diagramId: string;
  savedLabel: string;
}) {
  const [designKind, setDesignKind] = useState<DesignKind>('Text');
  const [compactPanel, setCompactPanel] = useState<CompactPanel>('design');
  const isCompact = useIsCompactLayout();
  const diagram = useMemo(() => parseDiagram(drafts.Diagram), [drafts.Diagram]);

  const designPlaceholder =
    designKind === 'Schema'
      ? 'Define entities, fields, indexes, ownership, and invariants…'
      : designKind === 'Pseudocode'
        ? 'Sketch the critical request, retry, consistency, or failure path…'
        : 'State requirements, invariants, architecture, failure modes, and tradeoffs…';

  const panelButton = (id: CompactPanel, label: string, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={() => setCompactPanel(id)}
      aria-pressed={compactPanel === id}
      className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 border-b px-3 text-xs font-medium lg:hidden ${compactPanel === id ? 'border-sky-300 text-white' : 'border-transparent text-white/45'}`}
    >
      {icon} {label}
    </button>
  );

  const designPanel = (
    <section
      className="flex min-h-[28rem] flex-col bg-black lg:min-h-[16rem]"
      aria-label="Design artifacts"
    >
      <div className="flex min-h-11 items-center justify-between gap-3 border-b border-white/[0.08] px-3">
        <div className="flex items-center gap-1">
          {DESIGN_KINDS.map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => setDesignKind(kind)}
              aria-pressed={designKind === kind}
              className={`min-h-9 rounded-md px-2.5 text-xs ${designKind === kind ? 'bg-white/[0.08] text-white' : 'text-white/45 hover:text-white/75'}`}
            >
              {kind === 'Text' ? 'Notes' : kind}
            </button>
          ))}
        </div>
        <span className="font-mono text-[10px] text-white/30">Markdown</span>
      </div>
      <label className="flex min-h-0 flex-1 flex-col">
        <span className="sr-only">{designKind} artifact</span>
        <textarea
          aria-label={`${designKind} artifact`}
          value={drafts[designKind]}
          disabled={frozen}
          onChange={(event) => onChange(designKind, event.target.value)}
          placeholder={designPlaceholder}
          className="min-h-[24rem] flex-1 resize-none bg-black/20 p-4 font-mono text-sm leading-6 text-white/75 outline-none placeholder:text-white/20 disabled:cursor-not-allowed disabled:text-white/45 lg:min-h-[12rem]"
        />
      </label>
    </section>
  );

  const codePanel = (
    <section className="flex min-h-[28rem] flex-col bg-black" aria-label="Code artifact">
      <div className="flex min-h-11 items-center justify-between gap-3 border-b border-white/[0.08] px-3">
        <span className="flex items-center gap-2 text-xs font-medium text-white/60">
          <Code2 className="h-3.5 w-3.5" /> Code / pseudocode
        </span>
        <span className="font-mono text-[10px] text-white/30">TypeScript</span>
      </div>
      <div className="h-[24rem] shrink-0">
        <CodeEditor
          code={drafts.Code}
          language={'typescript' satisfies Language}
          onChange={(value) => onChange('Code', value ?? '')}
          readOnly={frozen}
        />
      </div>
    </section>
  );

  const diagramPanel = (
    <section className="flex min-h-[28rem] flex-col bg-black" aria-label="Diagram artifact">
      <div className="flex min-h-11 items-center justify-between gap-3 border-b border-white/[0.08] px-3">
        <span className="flex items-center gap-2 text-xs font-medium text-white/60">
          <PenTool className="h-3.5 w-3.5" /> Architecture diagram
        </span>
        <span className="font-mono text-[10px] text-white/30">Excalidraw</span>
      </div>
      <div className="h-[24rem] shrink-0">
        <DiagramEditor
          key={diagramId}
          problemId={diagramId}
          initialDocument={diagram}
          persist={false}
          readOnly={frozen}
          onDocumentChange={(document) => onChange('Diagram', JSON.stringify(document))}
        />
      </div>
    </section>
  );

  return (
    <div className="overflow-hidden border-t border-white/[0.08]">
      {isCompact ? (
        <>
          <div className="flex border-b border-white/[0.08]" aria-label="Artifact tools">
            {panelButton('design', 'Design', <FileText className="h-3.5 w-3.5" />)}
            {panelButton('code', 'Code', <Braces className="h-3.5 w-3.5" />)}
            {panelButton('diagram', 'Diagram', <PenTool className="h-3.5 w-3.5" />)}
          </div>
          {compactPanel === 'design' && designPanel}
          {compactPanel === 'code' && codePanel}
          {compactPanel === 'diagram' && diagramPanel}
        </>
      ) : (
        <>
          {designPanel}
          <PanelGroup orientation="horizontal" className="h-[28rem] border-t border-white/[0.08]">
            <Panel defaultSize="50%" minSize="30%">
              {codePanel}
            </Panel>
            <PanelResizeHandle className="group relative w-px bg-white/[0.08] transition-colors hover:bg-sky-300/50 focus-visible:bg-sky-300/50 focus-visible:outline-none">
              <span className="absolute left-1/2 top-1/2 h-12 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 group-hover:bg-sky-300/50" />
            </PanelResizeHandle>
            <Panel defaultSize="50%" minSize="30%">
              {diagramPanel}
            </Panel>
          </PanelGroup>
        </>
      )}

      <div className="flex min-h-11 flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] px-4 font-mono text-[10px] text-white/35">
        <span>{frozen ? 'Composite artifact frozen' : savedLabel}</span>
        <span>Notes + code + diagram</span>
      </div>
    </div>
  );
}
