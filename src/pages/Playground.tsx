import { AlertTriangle, BookOpen,Brain, Check, Clock, Code2, Copy, Eye, FileText, Focus, GripVertical, Loader2, Pencil, PenTool, Play, Share2, Sparkles } from 'lucide-react';
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
import { useIsMobile } from '../hooks/useMediaQuery';
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

  // The Playground is a multi-panel desktop layout. Below `md` we render a
  // single panel at a time (the toggle row acts as a tab switcher) so each
  // panel gets the full width instead of being squeezed to ~80px.
  const isMobile = useIsMobile();
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
    // On mobile the toggle row is a single-select tab switcher.
    if (isMobile) {
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
    `flex shrink-0 items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
      active ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
    }`;

  // On mobile the toggle row is a tab switcher, so "active" = the shown panel.
  const isPanelActive = (id: PanelId) =>
    isMobile ? activePanel === id : visiblePanels.has(id);

  const langBtn = (active: boolean) =>
    `px-2 py-1 rounded text-xs font-medium transition-colors ${
      active ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'
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
  // On mobile show a single panel; fall back to the first visible one if the
  // chosen active panel was toggled off.
  const panels: PanelId[] = isMobile
    ? [allVisiblePanels.includes(activePanel) ? activePanel : (allVisiblePanels[0] ?? 'code')]
    : allVisiblePanels;
  const panelSize = Math.floor(100 / panels.length);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 border-b border-gray-800 bg-gray-950 px-2 py-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          {/* Panel toggles — scroll horizontally if they overflow on mobile */}
          <div className="flex items-center gap-1 overflow-x-auto rounded-lg bg-gray-800 p-0.5">
            <button onClick={() => togglePanel('problem')} className={panelBtn('problem', isPanelActive('problem'))}>
              <FileText className="h-3 w-3" />
              Problem
            </button>
            <button onClick={() => togglePanel('code')} className={panelBtn('code', isPanelActive('code'))}>
              <Code2 className="h-3 w-3" />
              Code
            </button>
            <button onClick={() => togglePanel('diagram')} className={panelBtn('diagram', isPanelActive('diagram'))}>
              <PenTool className="h-3 w-3" />
              Draw
            </button>
            {!focusMode && (
              <button onClick={() => togglePanel('companion')} className={panelBtn('companion', isPanelActive('companion'))}>
                <Sparkles className="h-3 w-3" />
                Companion
              </button>
            )}
            <button onClick={() => togglePanel('library')} className={panelBtn('library', isPanelActive('library'))}>
              <BookOpen className="h-3 w-3" />
              Library
            </button>
          </div>

          {visiblePanels.has('code') && (
            <>
              <div className="mx-1 h-4 w-px bg-gray-800" />
              <div className="flex items-center gap-1 rounded-lg bg-gray-800 p-0.5">
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
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${
              focusMode
                ? 'bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
            title={focusMode
              ? 'Focus mode on — Companion + auto-tag suppressed. Click to disable.'
              : 'Focus mode — train without AI assist (Companion + auto-tag off). Click to enable.'}
          >
            <Focus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Focus</span>
            <span className={`ml-0.5 rounded px-1 text-[10px] font-semibold ${
              focusMode ? 'bg-cyan-500/20 text-cyan-200' : 'bg-gray-800 text-gray-500'
            }`}>{sessionsThisWeek()}/wk</span>
          </button>
          <button
            onClick={() => setFeynmanOpen(true)}
            disabled={code.length < 50}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-purple-400 transition-colors hover:bg-purple-900/20 hover:text-purple-300 disabled:opacity-30"
            title="Explain what you built (Feynman gate)"
          >
            <Brain className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Explain</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200"
          >
            {shared_ ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Share2 className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{shared_ ? 'Copied!' : 'Share'}</span>
          </button>
          {visiblePanels.has('code') && (
            <>
              <button
                onClick={handleFormat}
                className="hidden items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200 sm:flex"
              >
                <Code2 className="h-3.5 w-3.5" />
                Format <span className="ml-1 text-gray-500">&#x21E7;&#x2318;F</span>
              </button>
              <button
                onClick={handleRun}
                disabled={isRunning}
                className="flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                {isRunning ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Play className="h-3.5 w-3.5" />
                )}
                Run <span className="ml-1 hidden opacity-70 sm:inline">&#x2318;&#x23CE;</span>
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
              <div className="flex flex-col h-full bg-gray-950">
                <div className="flex h-9 items-center justify-between border-b border-gray-800 px-4">
                  <span className="text-xs font-medium text-gray-400">Problem Statement</span>
                  <button
                    onClick={() => setProblemPreview(!problemPreview)}
                    className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300"
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
                      <div className="flex items-center justify-center h-full text-sm text-gray-600">
                        Nothing to preview.
                      </div>
                    )}
                  </div>
                ) : (
                  <textarea
                    value={problem}
                    onChange={handleProblemChange}
                    placeholder="Paste your problem statement here (supports Markdown)..."
                    className="flex-1 resize-none bg-transparent p-4 text-sm text-gray-200 placeholder-gray-600 focus:outline-none font-mono leading-relaxed"
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
                <PanelResizeHandle className="group relative flex h-2 items-center justify-center bg-gray-900 hover:bg-gray-800 transition-colors">
                  <div className="h-0.5 w-8 rounded-full bg-gray-700 group-hover:bg-gray-500 transition-colors" />
                </PanelResizeHandle>
                <Panel defaultSize={hasRun ? 40 : 15} minSize={10}>
                  <div className="flex flex-col h-full overflow-y-auto bg-gray-900">
                    <div className="flex h-9 items-center justify-between border-b border-gray-800 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setBottomTab('output')}
                          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                            bottomTab === 'output' ? 'bg-gray-800 text-gray-200' : 'text-gray-500 hover:text-gray-300'
                          }`}
                        >
                          Output
                          {hasRun && execTimeMs > 0 && (
                            <span className="ml-1.5 text-gray-500">
                              {formatTime(execTimeMs)}
                            </span>
                          )}
                          {hasRun && language === 'go' && (
                            <span className={`ml-1.5 rounded px-1 text-[10px] font-bold ${
                              goBackend === 'wasm' ? 'bg-green-500/20 text-green-400' :
                              goBackend === 'wasm-loading' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-gray-700 text-gray-400'
                            }`}>
                              {goBackend === 'wasm' ? 'LOCAL' : goBackend === 'wasm-loading' ? 'API (loading WASM...)' : 'API'}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => setBottomTab('problems')}
                          className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                            bottomTab === 'problems'
                              ? 'bg-gray-800 text-gray-200'
                              : markers.length > 0 ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-500 hover:text-gray-300'
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
                          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300"
                        >
                          {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                          {copied ? 'Copied' : 'Copy'}
                        </button>
                      )}
                    </div>

                    {bottomTab === 'output' && (
                      <div className="p-4 font-mono text-xs">
                        {output && (
                          <pre className="whitespace-pre-wrap rounded-lg bg-gray-950 p-3 text-gray-300">
                            {output}
                          </pre>
                        )}
                        {errors && (
                          <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-red-500/10 p-3 text-red-400">
                            {errors}
                          </pre>
                        )}
                        {!output && !errors && (
                          <div className="flex items-center justify-center py-8 text-sm text-gray-600">
                            Click "Run" to execute your code.
                          </div>
                        )}
                      </div>
                    )}

                    {bottomTab === 'problems' && (
                      <div className="p-4">
                        {markers.length === 0 ? (
                          <div className="flex items-center justify-center py-8 text-sm text-gray-600">
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
                                  <span className="text-gray-400 ml-2">{m.message}</span>
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
        <PanelResizeHandle className="group flex w-2 items-center justify-center bg-gray-900 transition-colors hover:bg-gray-700">
          <GripVertical className="h-4 w-4 text-gray-600 group-hover:text-gray-400" />
        </PanelResizeHandle>
      )}
      <Panel defaultSize={defaultSize} minSize={15}>
        {children}
      </Panel>
    </>
  );
}
