import { execSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, rmSync, existsSync } from 'fs';
import { join, relative, posix } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = JSON.parse(readFileSync(join(__dirname, 'library.config.json'), 'utf-8'));
const OUTPUT_DIR = join(__dirname, '..', 'src', 'data', 'library');
const TEMP_DIR = join(__dirname, '..', '.tmp-library');

// ---- File filtering ---------------------------------------------------------

// Files whose names signal non-content (PR guidelines, licenses, translations).
// Match on the bare filename; case-insensitive.
const NOISE_FILE_RE = /^(contributing|code[_-]?of[_-]?conduct|license|licence|changelog|security|funding|backers|sponsors|governance|maintainers|codeowners|support|pull_request_template|issue_template|acknowledgements|authors)(\.md|\.rst|\.txt)?$/i;

// Translation suffixes on README/overview files — keep only the canonical one.
const TRANSLATED_README_RE = /^readme[-_][a-z]{2}([-_][a-z]{2})?\.(md|rst)$/i;

// Directories to skip entirely.
const NOISE_DIR_RE = /^(\.|node_modules|\.github|translations?|i18n|locales?|\.vscode|\.idea|test|tests|__tests__|spec|specs|dist|build|out|target|coverage|\.cache)$/i;

function getAllFiles(dir, base = dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    let stat;
    try { stat = statSync(fullPath); } catch { continue; }

    if (stat.isDirectory()) {
      if (NOISE_DIR_RE.test(entry)) continue;
      results.push(...getAllFiles(fullPath, base));
    } else if (/\.(md|rst|txt)$/i.test(entry)) {
      if (NOISE_FILE_RE.test(entry)) continue;
      if (TRANSLATED_README_RE.test(entry)) continue;
      try {
        results.push({
          path: relative(base, fullPath).split(/[\\/]/).join('/'),
          content: readFileSync(fullPath, 'utf-8'),
        });
      } catch {
        // Skip files that can't be read
      }
    }
  }
  return results;
}

// ---- Title humanization -----------------------------------------------------

const SMALL_WORDS = new Set(['a','an','and','as','at','but','by','for','in','of','on','or','the','to','vs','via','with']);
const ACRONYMS = new Set(['api','css','html','js','ts','sql','cpp','oop','ui','ux','io','http','https','jwt','cdn','dns','tcp','udp','ip','ssl','tls','aws','gcp','url','uri','json','xml','yaml','rest','graphql','lld','hld','ci','cd','orm','mvc','mvvm','ssr','csr','crud','cli','sdk','dsa','uml','faq']);

function titleCaseWord(word, isFirst) {
  const lower = word.toLowerCase();
  if (ACRONYMS.has(lower)) return lower.toUpperCase();
  if (!isFirst && SMALL_WORDS.has(lower)) return lower;
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function humanizeTitle(raw) {
  if (!raw) return '';
  // Preserve original if it already contains uppercase (likely a meaningful name)
  const trimmed = String(raw).trim();
  // Split on separators, camelCase boundaries, and digit/letter boundaries
  const tokens = trimmed
    .replace(/\.(md|rst|txt)$/i, '')
    .replace(/[_\-/]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    .replace(/(\d)([a-zA-Z])/g, '$1 $2')
    .split(/\s+/)
    .filter(Boolean);

  if (tokens.length === 0) return trimmed;
  return tokens.map((t, i) => titleCaseWord(t, i === 0)).join(' ');
}

function slugify(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ---- Image URL rewriting ----------------------------------------------------

function parseGithubRepo(sourceUrl) {
  const m = sourceUrl.match(/github\.com[/:]([^/]+)\/([^/.]+?)(?:\.git)?\/?$/);
  if (!m) return null;
  return { owner: m[1], repo: m[2] };
}

function resolveRelativeUrl(url, filePath, rawBase) {
  if (!url) return url;
  // Already absolute, data URI, or anchor — leave alone
  if (/^(https?:|data:|mailto:|#)/i.test(url)) return url;
  // Strip leading ./
  let rel = url.replace(/^\.\//, '');
  const fileDir = filePath.includes('/') ? posix.dirname(filePath) : '';
  const joined = rel.startsWith('/')
    ? posix.normalize(rel.slice(1))
    : posix.normalize(fileDir ? `${fileDir}/${rel}` : rel);
  return `${rawBase}/${joined}`;
}

function rewriteRelativeUrls(content, filePath, rawBase) {
  if (!content) return content;
  let out = content;
  // Markdown images ![alt](path)
  out = out.replace(/(!\[[^\]]*\]\()([^)\s]+)(\s+"[^"]*")?(\))/g, (_, open, url, title, close) => {
    return `${open}${resolveRelativeUrl(url, filePath, rawBase)}${title || ''}${close}`;
  });
  // Markdown links [text](path) — only rewrite obvious image paths and local docs
  out = out.replace(/(\[[^\]]+\]\()([^)\s]+)(\s+"[^"]*")?(\))/g, (full, open, url, title, close) => {
    if (/^(!|https?:|data:|mailto:|#)/i.test(url)) return full;
    // Only rewrite if it's an image or a non-.md asset reference
    if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(url)) {
      return `${open}${resolveRelativeUrl(url, filePath, rawBase)}${title || ''}${close}`;
    }
    return full;
  });
  // HTML <img src="...">
  out = out.replace(/<img\b([^>]*?)\bsrc=["']([^"']+)["']([^>]*)>/gi, (full, pre, src, post) => {
    if (/^(https?:|data:)/i.test(src)) return full;
    const resolved = resolveRelativeUrl(src, filePath, rawBase);
    return `<img${pre}src="${resolved}"${post}>`;
  });
  return out;
}

// ---- Tree shaping -----------------------------------------------------------

/** Split large markdown content into sub-sections by # and ## headings */
function splitByHeadings(content, parentId) {
  const h1Parts = content.split(/^(?=# [^#])/m);

  if (h1Parts.length > 2) {
    const children = [];
    let introContent = '';

    for (const h1Part of h1Parts) {
      const trimmed = h1Part.trim();
      if (!trimmed) continue;

      const h1Match = trimmed.match(/^# (.+)/);
      if (!h1Match) {
        introContent = trimmed;
        continue;
      }

      const h1Title = h1Match[1].trim();
      const h1Id = `${parentId}-${slugify(h1Title)}`;

      const h2Parts = trimmed.split(/^(?=## [^#])/m);
      if (h2Parts.length > 1) {
        const h2Children = [];
        let h1Content = '';
        for (const h2Part of h2Parts) {
          const h2Trimmed = h2Part.trim();
          if (!h2Trimmed) continue;
          const h2Match = h2Trimmed.match(/^## (.+)/);
          if (h2Match) {
            h2Children.push({
              id: `${h1Id}-${slugify(h2Match[1].trim())}`,
              title: humanizeTitle(h2Match[1].trim()),
              content: h2Trimmed,
            });
          } else {
            h1Content = h2Trimmed;
          }
        }
        children.push({
          id: h1Id,
          title: humanizeTitle(h1Title),
          content: h1Content,
          children: h2Children.length > 0 ? h2Children : undefined,
        });
      } else {
        children.push({
          id: h1Id,
          title: humanizeTitle(h1Title),
          content: trimmed,
        });
      }
    }

    if (children.length >= 2) return { introContent, children };
  }

  const h2Parts = content.split(/^(?=## [^#])/m);
  if (h2Parts.length <= 1) return null;

  const children = [];
  let introContent = '';

  for (const part of h2Parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const headingMatch = trimmed.match(/^## (.+)/);
    if (headingMatch) {
      children.push({
        id: `${parentId}-${slugify(headingMatch[1].trim())}`,
        title: humanizeTitle(headingMatch[1].trim()),
        content: trimmed,
      });
    } else {
      introContent = trimmed;
    }
  }

  if (children.length < 2) return null;
  return { introContent, children };
}

const LARGE_FILE_THRESHOLD = 20000; // 20KB

function buildSectionTree(files, rawBase) {
  const mdFiles = files
    .filter(f => f.path.endsWith('.md') || f.path.endsWith('.rst'))
    .sort((a, b) => a.path.localeCompare(b.path));

  const root = [];
  const dirMap = new Map();

  for (const file of mdFiles) {
    const parts = file.path.split('/');
    const fileName = parts[parts.length - 1];
    const baseName = fileName.replace(/\.(md|rst)$/, '');
    const sectionId = slugify(file.path);
    const sectionTitle = /^readme$/i.test(baseName)
      ? (parts.length > 1 ? humanizeTitle(parts[parts.length - 2]) : 'Overview')
      : humanizeTitle(baseName);

    const rewrittenContent = rewriteRelativeUrls(file.content, file.path, rawBase);

    let section;
    if (rewrittenContent.length > LARGE_FILE_THRESHOLD) {
      const split = splitByHeadings(rewrittenContent, sectionId);
      if (split) {
        section = {
          id: sectionId,
          title: sectionTitle,
          content: split.introContent,
          children: split.children,
        };
      }
    }
    if (!section) {
      section = {
        id: sectionId,
        title: sectionTitle,
        content: rewrittenContent,
      };
    }

    if (parts.length === 1) {
      root.push(section);
    } else {
      const dirPath = parts.slice(0, -1).join('/');
      let parent = dirMap.get(dirPath);
      if (!parent) {
        parent = {
          id: slugify(dirPath),
          title: humanizeTitle(parts[parts.length - 2]),
          content: '',
          children: [],
        };
        dirMap.set(dirPath, parent);
        const grandparentPath = parts.slice(0, -2).join('/');
        const grandparent = dirMap.get(grandparentPath);
        if (grandparent) {
          grandparent.children = grandparent.children || [];
          grandparent.children.push(parent);
        } else {
          root.push(parent);
        }
      }
      parent.children = parent.children || [];
      parent.children.push(section);
    }
  }

  return root;
}

// Collapse nodes that have a single child and no own content — promote the child
// up one level with a combined title (so navigation still makes sense).
function collapseSingletons(sections) {
  return sections.map(section => {
    let current = { ...section };
    if (current.children && current.children.length > 0) {
      current.children = collapseSingletons(current.children);
    }
    while (
      !current.content?.trim() &&
      current.children?.length === 1 &&
      current.children[0].content
    ) {
      const only = current.children[0];
      current = {
        id: only.id,
        // Prefer the child title if it's informative; else keep parent title
        title: only.title && only.title.length > 2 ? only.title : current.title,
        content: only.content,
        children: only.children,
      };
    }
    return current;
  });
}

// Reorder sections: Overview first, noise-y ones (if any slipped through) last.
const TRAILING_TITLE_RE = /^(appendix|glossary|references?|further reading|credits|authors|backers|sponsors|changelog|license)/i;

function orderSections(sections) {
  const overviewIdx = sections.findIndex(
    s => /^(overview|readme|introduction|getting started)$/i.test(s.title.trim())
  );
  const overview = overviewIdx >= 0 ? sections[overviewIdx] : null;
  const rest = overview ? sections.filter((_, i) => i !== overviewIdx) : sections.slice();

  const leading = [];
  const trailing = [];
  for (const s of rest) {
    if (TRAILING_TITLE_RE.test(s.title.trim())) trailing.push(s);
    else leading.push(s);
  }

  // Recurse into children
  const mapped = [
    ...(overview ? [{ ...overview, children: overview.children ? orderSections(overview.children) : undefined }] : []),
    ...leading.map(s => ({ ...s, children: s.children ? orderSections(s.children) : undefined })),
    ...trailing.map(s => ({ ...s, children: s.children ? orderSections(s.children) : undefined })),
  ];
  return mapped;
}

// Count only leaf sections with non-trivial content.
const MEANINGFUL_CONTENT_THRESHOLD = 200;

function countMeaningfulLeaves(sections) {
  let count = 0;
  for (const s of sections) {
    if (s.children && s.children.length > 0) {
      count += countMeaningfulLeaves(s.children);
    } else if ((s.content || '').trim().length >= MEANINGFUL_CONTENT_THRESHOLD) {
      count++;
    }
  }
  return count;
}

// Synthesize an "Overview" landing section with a TOC if none exists.
function ensureOverview(sections, repoMeta) {
  const hasOverview = sections.some(s => /^overview$/i.test(s.title.trim()));
  if (hasOverview) return sections;

  const toc = sections
    .slice(0, 20)
    .map(s => `- **${s.title}**${s.content ? '' : (s.children?.length ? ` — ${s.children.length} topics` : '')}`)
    .join('\n');

  const intro = `# ${repoMeta.name}\n\n${repoMeta.description}\n\n## What's inside\n\n${toc}\n\n_Source: [${repoMeta.source}](${repoMeta.source})_`;

  return [
    { id: 'synthetic-overview', title: 'Overview', content: intro },
    ...sections,
  ];
}

// Classify repo content format for UI badging.
function classifyFormat(parsed, files) {
  const exerciseCount = parsed.exercises?.length || 0;
  const sectionContent = (parsed.sections || []).map(s => s.content || '').join('\n');

  if (exerciseCount >= 50) return 'qa';

  // Ratio of image refs to text length
  const imgMatches = (sectionContent.match(/!\[[^\]]*\]\(/g) || []).length;
  const textLen = sectionContent.length || 1;
  const imgRatio = (imgMatches * 1000) / textLen; // imgs per 1000 chars
  if (imgRatio > 0.6 && imgMatches >= 15) return 'visual';

  // Ratio of fenced code blocks
  const codeFences = (sectionContent.match(/```/g) || []).length / 2;
  if (codeFences >= 40 || (files?.some(f => /\.(java|py|cpp|go|rs|ts|js)$/i.test(f.path)))) {
    return 'code-heavy';
  }

  return 'long-form';
}

// ---- Adapters (preserved) ---------------------------------------------------

function parseSudheerQA(content, tag) {
  const sections = [];
  const exercises = [];
  const questionRegex = /^\d+\.\s+###\s+(.+)$/gm;
  const matches = [...content.matchAll(questionRegex)];

  for (let i = 0; i < matches.length; i++) {
    const questionTitle = matches[i][1].trim();
    const startIdx = matches[i].index + matches[i][0].length;
    const endIdx = i + 1 < matches.length ? matches[i + 1].index : content.length;
    const answerContent = content.slice(startIdx, endIdx)
      .replace(/\*\*\[.*?Back to Top.*?\]\(.*?\)\*\*/g, '')
      .trim();

    const id = `q-${i + 1}`;
    sections.push({
      id,
      title: `${i + 1}. ${questionTitle}`,
      content: `### ${questionTitle}\n\n${answerContent}`,
    });

    const firstParagraph = answerContent.split('\n\n')[0]?.replace(/^[\s-]+/, '').trim() || answerContent;
    exercises.push({
      id,
      type: 'qa',
      question: questionTitle,
      answer: firstParagraph.length > 500 ? firstParagraph.slice(0, 500) + '...' : firstParagraph,
      tags: [tag],
    });
  }

  return { sections, exercises, totalItems: sections.length + exercises.length };
}

function parseDevopsExercises(files, rawBase) {
  const sections = [];
  const exercises = [];
  const topicFiles = files.filter(f => f.path.startsWith('topics/') && f.path.endsWith('.md'));

  for (const file of topicFiles) {
    const parts = file.path.split('/');
    const topicName = parts[1] || 'general';
    const rewritten = rewriteRelativeUrls(file.content, file.path, rawBase);

    const detailsRegex = /<details>\s*<summary>([\s\S]*?)<\/summary>[\s\S]*?<b>\s*([\s\S]*?)\s*<\/b>\s*<\/details>/gi;
    const matches = [...rewritten.matchAll(detailsRegex)];

    if (matches.length > 0) {
      sections.push({
        id: `devops-${topicName}`,
        title: humanizeTitle(topicName),
        content: rewritten,
      });

      for (let i = 0; i < matches.length; i++) {
        const question = matches[i][1].replace(/<[^>]*>/g, '').trim();
        const answer = matches[i][2].replace(/<[^>]*>/g, '').trim();
        if (question && answer) {
          exercises.push({
            id: `devops-${topicName}-${i}`,
            type: 'qa',
            question,
            answer: answer.length > 500 ? answer.slice(0, 500) + '...' : answer,
            tags: ['devops', topicName],
          });
        }
      }
    }
  }

  const otherFiles = files.filter(f => !f.path.startsWith('topics/') && (f.path.endsWith('.md') || f.path.endsWith('.rst')));
  for (const file of otherFiles) {
    const title = file.path.replace(/\.(md|rst)$/, '').split('/').pop() || 'Overview';
    sections.unshift({
      id: slugify(file.path),
      title: /^readme$/i.test(title) ? 'Overview' : humanizeTitle(title),
      content: rewriteRelativeUrls(file.content, file.path, rawBase),
    });
  }

  return { sections, exercises, totalItems: sections.length + exercises.length };
}

// ---- Main -------------------------------------------------------------------

async function main() {
  console.log(`Fetching ${config.repos.length} repos...\n`);

  if (existsSync(TEMP_DIR)) rmSync(TEMP_DIR, { recursive: true });
  mkdirSync(TEMP_DIR, { recursive: true });
  mkdirSync(OUTPUT_DIR, { recursive: true });

  // Previous manifest entries, keyed by repo id. A failed fetch must not drop
  // a repo from the manifest (the manifest is bundled into the app, so a
  // dropped entry removes the repo from the library UI even though its
  // content.json is still on disk). On failure we carry the old entry forward.
  const previousRepos = new Map();
  try {
    const prev = JSON.parse(readFileSync(join(OUTPUT_DIR, 'manifest.json'), 'utf-8'));
    for (const r of prev.repos || []) previousRepos.set(r.id, r);
  } catch {
    // No previous manifest (first run) — nothing to carry forward.
  }

  const manifest = { repos: [], generatedAt: new Date().toISOString() };

  for (const repo of config.repos) {
    const repoDir = join(TEMP_DIR, repo.id);
    console.log(`Cloning ${repo.source}...`);

    try {
      execSync(`git clone --depth=1 "${repo.source}" "${repoDir}"`, {
        stdio: 'pipe',
        timeout: 180000,
      });

      const ghInfo = parseGithubRepo(repo.source);
      const rawBase = ghInfo
        ? `https://raw.githubusercontent.com/${ghInfo.owner}/${ghInfo.repo}/HEAD`
        : repo.source.replace(/\/$/, '');

      const files = getAllFiles(repoDir);
      console.log(`  Found ${files.length} content files`);

      let parsed;
      if (repo.adapter === 'javascript-questions' || repo.adapter === 'react-questions') {
        const readme = files.find(f => f.path === 'README.md');
        const tag = repo.adapter === 'javascript-questions' ? 'javascript' : 'react';
        parsed = readme
          ? parseSudheerQA(rewriteRelativeUrls(readme.content, readme.path, rawBase), tag)
          : { sections: [], exercises: [], totalItems: 0 };
      } else if (repo.adapter === 'devops-exercises') {
        parsed = parseDevopsExercises(files, rawBase);
      } else {
        const sections = buildSectionTree(files, rawBase);
        const collapsed = collapseSingletons(sections);
        const ordered = orderSections(collapsed);
        const withOverview = ensureOverview(ordered, repo);
        parsed = { sections: withOverview, exercises: [], totalItems: countMeaningfulLeaves(withOverview) };
      }

      // Walk all files from the original clone to detect code-heavy repos
      const allSourceFiles = [];
      (function walk(dir) {
        for (const entry of readdirSync(dir)) {
          const full = join(dir, entry);
          let s;
          try { s = statSync(full); } catch { continue; }
          if (s.isDirectory()) {
            if (NOISE_DIR_RE.test(entry)) continue;
            walk(full);
          } else {
            allSourceFiles.push({ path: full });
          }
        }
      })(repoDir);

      // An upstream restructure (or a clone that silently fetched nothing)
      // can parse to zero content. Refuse to overwrite good content.json with
      // an empty shell — treat it like a fetch failure instead.
      if ((parsed.sections?.length || 0) === 0 && (parsed.exercises?.length || 0) === 0) {
        throw new Error('parsed zero sections/exercises — keeping existing content');
      }

      const format = classifyFormat(parsed, allSourceFiles);
      const meaningfulCount = repo.adapter === 'javascript-questions' || repo.adapter === 'react-questions' || repo.adapter === 'devops-exercises'
        ? parsed.sections.length
        : countMeaningfulLeaves(parsed.sections);

      const repoOutputDir = join(OUTPUT_DIR, repo.id);
      mkdirSync(repoOutputDir, { recursive: true });
      writeFileSync(join(repoOutputDir, 'content.json'), JSON.stringify(parsed));

      manifest.repos.push({
        id: repo.id,
        name: repo.name,
        source: repo.source,
        sourceBaseUrl: rawBase,
        description: repo.description,
        tags: repo.tags,
        icon: repo.icon,
        format,
        sectionCount: meaningfulCount,
        exerciseCount: parsed.exercises.length,
        lastFetched: new Date().toISOString(),
      });

      console.log(`  -> ${meaningfulCount} sections, ${parsed.exercises.length} exercises, format=${format}\n`);
    } catch (err) {
      console.error(`  ERROR fetching ${repo.id}: ${err.message}`);
      const prev = previousRepos.get(repo.id);
      if (prev) {
        manifest.repos.push(prev);
        console.error(`  -> kept previous manifest entry (lastFetched ${prev.lastFetched})\n`);
      } else {
        console.error(`  -> no previous entry to carry forward; repo omitted\n`);
      }
    }
  }

  writeFileSync(join(OUTPUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`\nManifest written with ${manifest.repos.length} repos.`);

  rmSync(TEMP_DIR, { recursive: true });
  console.log('Temp directory cleaned up.');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
