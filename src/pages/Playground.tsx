import { AlertTriangle, BookOpen, Brain, Check, Clock, Code2, Copy, Eye, FileText, Focus, GripVertical, Loader2, Pencil, PenTool, Play, Share2 } from 'lucide-react';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { useCallback, useEffect,useMemo, useRef, useState } from 'react';
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { useSearchParams } from 'react-router-dom';

import AmbientLibrary from '../components/AmbientLibrary';
import CodeEditor from '../components/CodeEditor';
import CompanionPanel from '../components/CompanionPanel';
import DiagramEditor from '../components/DiagramEditor';
import FeynmanGate from '../components/FeynmanGate';
import MarkdownViewer from '../components/MarkdownViewer';
import { useCodeExecution } from '../hooks/useCodeExecution';
import { CONCEPT_BY_ID } from '../hooks/useConcepts';
import { useIsCompactLayout } from '../hooks/useMediaQuery';
import { useTagger } from '../hooks/useTagger';
import { useFocusMode } from '../hooks/useUserStore';
import type { Language } from '../types';

const STORAGE_KEY = 'playground-code';
const LANG_KEY = 'playground-language';
const PROBLEM_KEY = 'playground-problem';
const PANELS_KEY = 'playground-panels';

type PanelId = 'problem' | 'code' | 'diagram' | 'companion' | 'library';

function loadFromHash(): { code: string; lang: Language } | null {
  const hash = window.location.hash.slice(1);
  if (!hash) return null;
  try {
    const json = decompressFromEncodedURIComponent(hash);
    if (!json) return null;
    const parsed = JSON.parse(json);
    return { code: parsed.c || '', lang: parsed.l || 'typescript' };
  } catch {
    return null;
  }
}

function loadPanels(): Set<PanelId> {
  try {
    const saved = localStorage.getItem(PANELS_KEY);
    if (saved) return new Set(JSON.parse(saved));
  } catch { /* invalid JSON */ }
  return new Set(['code', 'companion']);
}

export default function Playground() {
  const shared = loadFromHash();
  const [searchParams, setSearchParams] = useSearchParams();

  const [language, setLanguage] = useState<Language>(
    () => shared?.lang || (localStorage.getItem(LANG_KEY) as Language) || 'typescript'
  );
  const [code, setCode] = useState(() => shared?.code || localStorage.getItem(STORAGE_KEY) || '');
  const [problem, setProblem] = useState(() => localStorage.getItem(PROBLEM_KEY) || '');
  const [visiblePanels, setVisiblePanels] = useState<Set<PanelId>>(loadPanels);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const problemTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const editorRef = useRef<any>(null);
  const { execute, output, errors, isRunning, execTimeMs, errorLine, goBackend } = useCodeExecution();
  const [copied, setCopied] = useState(false);
  const [shared_, setShared] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [problemPreview, setProblemPreview] = useState(false);
  const [bottomTab, setBottomTab] = useState<'output' | 'problems'>('output');
  const [markers, setMarkers] = useState<any[]>([]);
  const [feynmanOpen, setFeynmanOpen] = useState(false);
  const [taggedConcepts, setTaggedConcepts] = useState<string[]>([]);
  const { enabled: focusMode, setEnabled: setFocusMode, sessionsThisWeek } = useFocusMode();

  // The Playground is a multi-panel desktop layout. Below `lg` (covers phones
  // AND iPad portrait) we render a single panel at a time so Monaco/Excalidraw
  // get full width instead of being squeezed. The toggle row acts as a tab
  // switcher in compact mode.
  const isCompact = useIsCompactLayout();
  const [activePanel, setActivePanel] = useState<PanelId>('code');

  // Focus mode suppresses AI-assist surfaces: Socratic Companion panel and
  // the periodic auto-tagger. Forced-production tools (Feynman Gate) stay on.
  useTagger(code, language, problem, (tags) => {
    setTaggedConcepts(tags.map(t => t.concept_id));
  }, !focusMode);

  // Hydrate from query params (Today / Concepts deep-links)
  useEffect(() => {
    const conceptId = searchParams.get('concept');
    const promptText = searchParams.get('prompt');
    if (!conceptId && !promptText) return;
    const concept = conceptId ? CONCEPT_BY_ID[conceptId] : null;
    const newProblem = [
      promptText || '',
      concept ? `\n\n**Concept:** ${concept.name}\n${concept.description}` : '',
    ].filter(Boolean).join('').trim();
    if (newProblem) {
      setProblem(newProblem);
      localStorage.setItem(PROBLEM_KEY, newProblem);
      setVisiblePanels(prev => {
        const next = new Set(prev);
        next.add('problem');
        localStorage.setItem(PANELS_KEY, JSON.stringify([...next]));
        return next;
      });
    }
    if (conceptId) setTaggedConcepts([conceptId]);
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePanel = (id: PanelId) => {
    // In compact mode the toggle row is a single-select tab switcher.
    if (isCompact) {
      setActivePanel(id);
      setVisiblePanels(prev => (prev.has(id) ? prev : new Set([...prev, id])));
      return;
    }
    setVisiblePanels(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size <= 1) return prev; // keep at least one
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem(PANELS_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const handleCodeChange = useCallback((value: string | undefined) => {
    const v = value || '';
    setCode(v);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => localStorage.setItem(STORAGE_KEY, v), 800);
  }, []);

  const handleProblemChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setProblem(v);
    if (problemTimer.current) clearTimeout(problemTimer.current);
    problemTimer.current = setTimeout(() => localStorage.setItem(PROBLEM_KEY, v), 800);
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem(LANG_KEY, lang);
  };

  const handleRun = useCallback(() => {
    if (isRunning) return;
    setHasRun(true);
    setBottomTab('output');
    execute(code, [], language);
  }, [code, isRunning, execute, language]);

  const handleValidation = useCallback((newMarkers: any[]) => {
    setMarkers(newMarkers.filter((m: any) => m.severity >= 8));
  }, []);

  const handleFormat = () => {
    editorRef.current?.__prettierFormat?.();
  };

  const handleCopy = () => {
    const text = [output, errors].filter(Boolean).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleShare = () => {
    const payload = JSON.stringify({ c: code, l: language });
    const compressed = compressToEncodedURIComponent(payload);
    const url = `${window.location.origin}/playground#${compressed}`;
    navigator.clipboard.writeText(url);
    window.history.replaceState(null, '', `/playground#${compressed}`);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const formatTime = (ms: number) => ms < 1 ? '<1ms' : ms < 1000 ? `${ms.toFixed(1)}ms` : `${(ms / 1000).toFixed(2)}s`;

  const panelBtn = (_id: PanelId, active: boolean) =>
    `relative flex shrink-0 items-center gap-1.5 px-2 py-1.5 text-xs font-medium transition-colors duration-150 after:absolute after:inset-x-1 after:-bottom-px after:h-px after:transition-colors ${
      active
        ? 'text-white after:bg-white'
        : 'text-white/50 hover:text-white/80 after:bg-transparent'
    }`;

  // In compact mode the toggle row is a tab switcher, so "active" = the shown panel.
  const isPanelActive = (id: PanelId) =>
    isCompact ? activePanel === id : visiblePanels.has(id);

  const langBtn = (active: boolean) =>
    `px-2 py-1 rounded text-xs font-medium transition-colors duration-150 ${
      active ? 'bg-white/5 text-white' : 'text-white/50 hover:text-white/80'
    }`;

  // Focus mode evicts the Companion panel from the layout without mutating
  // the user's saved panel preferences — toggling focus off restores it.
  // If focus mode would empty the layout (companion was the only panel),
  // fall back to code so the editor stays visible.
  const allVisiblePanels = useMemo(() => {
    const filtered = (['problem', 'code', 'diagram', 'companion', 'library'] as PanelId[])
      .filter(id => visiblePanels.has(id))
      .filter(id => !(focusMode && id === 'companion'));
    return filtered.length > 0 ? filtered : (['code'] as PanelId[]);
  }, [visiblePanels, focusMode]);
  // In compact mode show a single panel; fall back to the first visible one if
  // the chosen active panel was toggled off.
  const panels: PanelId[] = isCompact
    ? [allVisiblePanels.includes(activePanel) ? activePanel : (allVisiblePanels[0] ?? 'code')]
    : allVisiblePanels;
  const panelSize = Math.floor(100 / panels.length);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] bg-black/95 px-3 py-2 sm:px-4 sm:py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          {/* Panel toggles — underline indicator on active, no chip bg */}
          <div className="flex items-center gap-3 overflow-x-auto border-b border-transparent">
            <button onClick={() => togglePanel('problem')} className={panelBtn('problem', isPanelActive('problem'))}>
              <FileText className="h-3.5 w-3.5" />
              Problem
            </button>
            <button onClick={() => togglePanel('code')} className={panelBtn('code', isPanelActive('code'))}>
              <Code2 className="h-3.5 w-3.5" />
              Code
            </button>
            <button onClick={() => togglePanel('diagram')} className={panelBtn('diagram', isPanelActive('diagram'))}>
              <PenTool className="h-3.5 w-3.5" />
              Draw
            </button>
            {!focusMode && (
              <button onClick={() => togglePanel('companion')} className={panelBtn('companion', isPanelActive('companion'))}>
                <Brain className="h-3.5 w-3.5" />
                Companion
              </button>
            )}
            <button onClick={() => togglePanel('library')} className={panelBtn('library', isPanelActive('library'))}>
              <BookOpen className="h-3.5 w-3.5" />
              Library
            </button>
          </div>

          {visiblePanels.has('code') && (
            <>
              <div className="h-4 w-px bg-white/5" />
              <div className="flex items-center gap-1 rounded-md border border-white/[0.08] p-0.5">
                <button onClick={() => handleLanguageChange('javascript')} className={langBtn(language === 'javascript')}>JS</button>
                <button onClick={() => handleLanguageChange('typescript')} className={langBtn(language === 'typescript')}>TS</button>
                <button onClick={() => handleLanguageChange('go')} className={langBtn(language === 'go')}>Go</button>
              </div>
            </>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            onClick={() => setFocusMode(!focusMode)}
            className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors duration-150 ${
              focusMode
                ? 'text-white hover:text-white'
                : 'text-white/50 hover:bg-white/[0.04] hover:text-white/80'
            }`}
            title={focusMode
              ? 'Focus mode on — Companion + auto-tag suppressed. Click to disable.'
              : 'Focus mode — train without AI assist (Companion + auto-tag off). Click to enable.'}
          >
            <Focus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Focus</span>
            <span className="ml-0.5 text-white/40">·</span>
            <span className="ml-0.5 text-[11px] tabular-nums">{sessionsThisWeek()}/wk</span>
          </button>
          <button
            onClick={() => setFeynmanOpen(true)}
            disabled={code.length < 50}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-white/70 transition-colors duration-150 hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            title="Explain what you built (Feynman gate)"
          >
            <Brain className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Explain</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-white/50 transition-colors duration-150 hover:bg-white/[0.04] hover:text-white/80"
          >
            {shared_ ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{shared_ ? 'Copied' : 'Share'}</span>
          </button>
          {visiblePanels.has('code') && (
            <>
              <button
                onClick={handleFormat}
                className="hidden items-center gap-1.5 rounded-md px-2 py-1 text-xs text-white/50 transition-colors duration-150 hover:bg-white/[0.04] hover:text-white/80 sm:flex"
              >
                <Code2 className="h-3.5 w-3.5" />
                Format <span className="ml-1 text-white/30">⇧⌘F</span>
              </button>
              <button
                onClick={handleRun}
                disabled={isRunning}
                className="flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-black transition-colors duration-150 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRunning ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Play className="h-3.5 w-3.5" />
                )}
                Run <span className="ml-1 hidden text-white/20 sm:inline">⌘↵</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Panels */}
      <PanelGroup orientation="horizontal" className="flex-1" key={panels.join('-')}>
        {panels.map((id, i) => (
          <PanelWrapper key={id} id={id} index={i} total={panels.length} defaultSize={panelSize}>
            {id === 'problem' && (
              <div className="flex flex-col h-full bg-black">
                <div className="flex h-9 items-center justify-between border-b border-white/[0.08] px-4">
                  <span className="text-xs font-medium text-white/50">Problem Statement</span>
                  <button
                    onClick={() => setProblemPreview(!problemPreview)}
                    className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-white/40 transition-colors hover:bg-white/5 hover:text-white/70"
                  >
                    {problemPreview ? <Pencil className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    {problemPreview ? 'Edit' : 'Preview'}
                  </button>
                </div>
                {problemPreview ? (
                  <div className="flex-1 overflow-y-auto p-4">
                    {problem ? (
                      <MarkdownViewer content={problem} />
                    ) : (
                      <div className="flex items-center justify-center h-full text-sm text-white/40">
                        Nothing to preview.
                      </div>
                    )}
                  </div>
                ) : (
                  <textarea
                    value={problem}
                    onChange={handleProblemChange}
                    placeholder="Paste your problem statement here (supports Markdown)..."
                    className="flex-1 resize-none bg-transparent p-4 text-sm text-white/80 placeholder:text-white/30 focus:outline-none font-mono leading-relaxed"
                  />
                )}
              </div>
            )}
            {id === 'code' && (
              <PanelGroup orientation="vertical">
                <Panel defaultSize={hasRun ? 60 : 85} minSize={30}>
                  <CodeEditor
                    code={code}
                    language={language}
                    onChange={handleCodeChange}
                    onMount={(editor) => { editorRef.current = editor; }}
                    onValidate={handleValidation}
                    onRun={handleRun}
                    errorLine={errorLine}
                  />
                </Panel>
                <PanelResizeHandle className="group relative flex h-2 items-center justify-center bg-white/[0.04] hover:bg-white/5 transition-colors">
                  <div className="h-0.5 w-8 rounded-full bg-white/20 group-hover:bg-white/40 transition-colors" />
                </PanelResizeHandle>
                <Panel defaultSize={hasRun ? 40 : 15} minSize={10}>
                  <div className="flex flex-col h-full overflow-y-auto bg-white/[0.04]">
                    <div className="flex h-9 items-center justify-between border-b border-white/[0.08] px-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setBottomTab('output')}
                          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                            bottomTab === 'output' ? 'bg-white/5 text-white/80' : 'text-white/40 hover:text-white/70'
                          }`}
                        >
                          Output
                          {hasRun && execTimeMs > 0 && (
                            <span className="ml-1.5 text-white/40">
                              {formatTime(execTimeMs)}
                            </span>
                          )}
                          {hasRun && language === 'go' && (
                            <span className={`ml-1.5 rounded px-1 text-[10px] font-bold ${
                              goBackend === 'wasm' ? 'bg-green-500/20 text-green-400' :
                              goBackend === 'wasm-loading' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-white/10 text-white'
                            }`}>
                              {goBackend === 'wasm' ? 'LOCAL' : goBackend === 'wasm-loading' ? 'API (loading WASM...)' : 'API'}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => setBottomTab('problems')}
                          className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                            bottomTab === 'problems'
                              ? 'bg-white/5 text-white/80'
                              : markers.length > 0 ? 'text-yellow-400 hover:text-yellow-300' : 'text-white/40 hover:text-white/70'
                          }`}
                        >
                          Problems
                          {markers.length > 0 && (
                            <span className={`rounded-full px-1.5 text-[10px] font-bold ${
                              bottomTab === 'problems' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {markers.length}
                            </span>
                          )}
                        </button>
                      </div>
                      {bottomTab === 'output' && (output || errors) && (
                        <button
                          onClick={handleCopy}
                          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-white/40 transition-colors hover:bg-white/5 hover:text-white/70"
                        >
                          {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                          {copied ? 'Copied' : 'Copy'}
                        </button>
                      )}
                    </div>

                    {bottomTab === 'output' && (
                      <div className="p-4 font-mono text-xs">
                        {output && (
                          <pre className="whitespace-pre-wrap rounded-lg bg-black p-3 text-white/70">
                            {output}
                          </pre>
                        )}
                        {errors && (
                          <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-red-500/10 p-3 text-red-400">
                            {errors}
                          </pre>
                        )}
                        {!output && !errors && (
                          <div className="flex items-center justify-center py-8 text-sm text-white/40">
                            Click "Run" to execute your code.
                          </div>
                        )}
                      </div>
                    )}

                    {bottomTab === 'problems' && (
                      <div className="p-4">
                        {markers.length === 0 ? (
                          <div className="flex items-center justify-center py-8 text-sm text-white/40">
                            No problems detected.
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {markers.map((m: any, i: number) => (
                              <div
                                key={i}
                                className="flex items-start gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-3 py-2 cursor-pointer hover:bg-yellow-500/10 transition-colors"
                                onClick={() => {
                                  editorRef.current?.revealLineInCenter(m.startLineNumber);
                                  editorRef.current?.setPosition({ lineNumber: m.startLineNumber, column: m.startColumn });
                                  editorRef.current?.focus();
                                }}
                              >
                                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-yellow-400 mt-0.5" />
                                <div className="text-xs">
                                  <span className="text-yellow-500 font-mono">Ln {m.startLineNumber}, Col {m.startColumn}</span>
                                  <span className="text-white/50 ml-2">{m.message}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Panel>
              </PanelGroup>
            )}
            {id === 'diagram' && (
              <DiagramEditor problemId="playground" />
            )}
            {id === 'companion' && (
              <CompanionPanel context={{ code, language, problem }} />
            )}
            {id === 'library' && (
              <AmbientLibrary conceptIds={taggedConcepts} />
            )}
          </PanelWrapper>
        ))}
      </PanelGroup>

      <FeynmanGate
        open={feynmanOpen}
        onClose={() => setFeynmanOpen(false)}
        code={code}
        language={language}
        problem={problem}
        conceptIds={taggedConcepts}
        problemId="playground"
      />
    </div>
  );
}

/** Wraps a panel with an optional resize handle before it */
function PanelWrapper({ id, index, total, defaultSize, children }: {
  id: string; index: number; total: number; defaultSize: number; children: React.ReactNode;
}) {
  return (
    <>
      {index > 0 && (
        <PanelResizeHandle className="group flex w-2 items-center justify-center bg-white/[0.04] transition-colors hover:bg-white/10">
          <GripVertical className="h-4 w-4 text-white/30 group-hover:text-white/60" />
        </PanelResizeHandle>
      )}
      <Panel defaultSize={defaultSize} minSize={20}>
        {children}
      </Panel>
    </>
  );
}
