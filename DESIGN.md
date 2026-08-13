---
name: SWE Learning OS
description: A rigorous, evidence-first engineering workbench.
colors:
  workbench-black: "#000000"
  paper-white: "#ededed"
  surface-rest: "rgba(255, 255, 255, 0.02)"
  surface-hover: "rgba(255, 255, 255, 0.04)"
  structural-border: "rgba(255, 255, 255, 0.08)"
  strong-border: "rgba(255, 255, 255, 0.15)"
  muted-text: "rgba(255, 255, 255, 0.60)"
  sky-signal: "#0ea5e9"
  emerald-success: "#10b981"
  amber-warning: "#f59e0b"
  rose-danger: "#f43f5e"
typography:
  display:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Geist Mono, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "0.08em"
  detail:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.4
  micro:
    fontFamily: "Geist Mono, monospace"
    fontSize: "0.625rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "0.12em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  6: "24px"
  8: "32px"
  10: "40px"
  12: "48px"
components:
  button-primary:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.workbench-black}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.surface-rest}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
    height: "44px"
  card:
    backgroundColor: "{colors.surface-rest}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.xl}"
    padding: "24px"
---

# Design System: SWE Learning OS

## Overview

**Creative North Star: "The Engineering Workbench"**

The interface feels like a dark, precise place for active technical work:
quiet enough for sustained concentration, but explicit about state, evidence,
and the next useful action. Content and tools carry the hierarchy. Decorative
effects stay subordinate to legibility and causal reasoning.

The visual language is restrained rather than austere. Near-black surfaces,
fine translucent borders, compact monospace labels, and a single sky accent
create the feeling of an instrument panel without imitating a terminal. Status
colors communicate semantics and always travel with text or iconography.

**Key Characteristics:**

- Dark, low-glare canvas with tonal surface layering.
- Strong typographic hierarchy and compact engineering labels.
- Borders and spacing establish structure; shadows are exceptional.
- Dense on desktop, intentionally stacked and touch-safe on compact screens.
- Evidence, current state, and next actions remain visually distinct.

## Colors

The palette is neutral and deliberately sparse, with sky reserved for active
learning and semantic colors reserved for real system state.

### Primary

- **Sky Signal** (`#0ea5e9`): Active navigation, selected learning state,
  explanatory links, and focused system signals.

### Neutral

- **Workbench Black** (`#000000`): The application canvas.
- **Paper White** (`#ededed`): Primary text and the highest-emphasis controls.
- **Resting Surface** (`rgba(255, 255, 255, 0.02)`): Cards and tool regions at
  rest.
- **Structural Border** (`rgba(255, 255, 255, 0.08)`): Default dividers and
  card outlines.
- **Muted Text** (`rgba(255, 255, 255, 0.60)`): Supporting explanations and
  metadata.

### Semantic

- **Emerald Success** (`#10b981`): Verified success or completed evidence.
- **Amber Warning** (`#f59e0b`): Waiting, partial, or attention-required state.
- **Rose Danger** (`#f43f5e`): Failure, destructive consequence, or invalid
  state.

**The Signal Scarcity Rule.** Sky and semantic colors identify meaningful
state; they do not decorate entire screens.

## Typography

**Display Font:** Geist (with Arial and sans-serif fallbacks)  
**Body Font:** Geist (with Arial and sans-serif fallbacks)  
**Label/Mono Font:** Geist Mono (with monospace fallback)

**Character:** Geist keeps the product contemporary and quiet. Geist Mono
makes evidence, state, code, identifiers, and short labels feel precise
without turning ordinary prose into a developer console.

### Hierarchy

- **Display** (600, `clamp(2rem, 5vw, 3rem)`, 1): Route-level statements only.
- **Headline** (600, `1.5rem`, 1.25): Major sections and focused tasks.
- **Title** (600, `1rem`, 1.4): Cards, panels, and actor names.
- **Body** (400, `0.875rem`, 1.625): Explanations, instructions, and evidence
  descriptions; keep long-form text near 70 characters per line.
- **Label** (500, `0.75rem`, 0.08em tracking): Metadata, state names, and
  compact control labels, usually uppercase.
- **Detail** (400, `0.6875rem`, 1.4): Dense supporting metadata inside
  established workbench rows.
- **Micro** (500, `0.625rem`, 0.12em tracking): Uppercase signal labels and
  truth-plane identifiers; never body copy.

**The Prose/Signal Rule.** Use proportional type to teach and monospace type
to identify, measure, or report state.

## Layout

Pages use the existing centered shell, normally capped at `64rem` or `80rem`,
with `24px` compact gutters and `48–64px` vertical page spacing. Major
regions follow a 4px-based rhythm, with 16–24px as the normal component gap.
Wide workspaces may use adjacent panels, but the reading order must remain
obvious when they stack.

At compact widths, multi-column workspaces become one ordered column and
controls wrap rather than shrink below a comfortable target. The persistent
application navigation remains the only primary navigation, limited to
Dashboard, Learn, Practice, and Wars. Dashboard resumes work, Learn is the
searchable high-level learning surface, Practice is the Playground with a
complete problem selector, and Wars begins with the duration choice. Secondary
destinations live contextually within those routes or the grouped Browse
disclosure. Active workspaces suppress unrelated global chrome.

**The Complete Inventory Rule.** Simpler entry surfaces must not hide, delete,
or strand canonical content. Complete concept, roadmap, and practice catalogues
remain explicitly browsable through stable routes and portable generated data;
search is an accelerator, never the only way to discover content.

## Elevation & Depth

The system is flat by default. Tonal background shifts, fine borders, and
overlap establish depth. Shadows are not a general card treatment and should
appear only when a browser-native overlay or focused floating surface needs
separation from the workbench.

**The Flat-by-Default Rule.** A resting surface earns hierarchy through
content, border contrast, and spacing—not a drop shadow.

## Shapes

Controls use restrained 4–8px corners; larger cards and tool regions use 12px
corners. Borders are one physical pixel and low contrast at rest. Pills are
reserved for truly compact status, filters, or categorical metadata; they are
not the default container shape.

## Components

### Buttons

- **Shape:** Compact rounded rectangle (`6px`) with a minimum `44px` target.
- **Primary:** Near-white surface with black text; reserved for the next
  committed action.
- **Hover / Focus:** Small tonal change and a visible high-contrast focus ring.
- **Secondary / Ghost:** Translucent neutral surface or transparent canvas
  with a structural border.

### Chips

- **Style:** Small monospace or compact sans-serif label with a subtle border.
- **State:** Selected chips gain a semantic tint and explicit text, not color
  alone.

### Cards / Containers

- **Corner Style:** `12px`.
- **Background:** Resting Surface over Workbench Black.
- **Shadow Strategy:** None at rest.
- **Border:** Structural Border; Strong Border on hover or explicit selection.
- **Internal Padding:** Usually `16px` on compact screens and `24px` on wide
  screens.

### Inputs / Fields

- **Style:** Black or translucent surface, structural border, `6–8px` corners,
  and near-white text.
- **Focus:** Visible sky or near-white ring without shifting layout.
- **Error / Disabled:** Error copy accompanies rose state; disabled controls
  remain legible and explain why when the reason is not apparent.

### Navigation

Primary navigation uses the existing application shell, quiet default labels,
and a clear active treatment. New learning tools enter through contextual
links rather than new top-level tabs. Mobile navigation preserves route
identity and touch targets.

### Evidence Panel

Evidence is grouped by the actor that produced it and labeled with its truth
plane and virtual time. Decisive evidence is visually marked, but every
record remains inspectable so the learner can distinguish projection from
ground truth.

## Do's and Don'ts

### Do:

- **Do** preserve the existing black canvas, near-white hierarchy, and sparse
  sky accent.
- **Do** keep state understandable without color by pairing it with text,
  icons, or both.
- **Do** prioritize the learner's prediction, system evidence, and causal
  explanation over completion chrome.
- **Do** make compact layouts fully operable, not merely viewable.

### Don't:

- **Don't** introduce gradients, decorative glow, glassmorphism, or a competing
  visual identity.
- **Don't** collapse independent system states into one green or red summary.
- **Don't** add a top-level navigation item for every learning tool.
- **Don't** reward clicks or guessed outcomes with positive mastery.
