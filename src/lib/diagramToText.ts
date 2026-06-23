/**
 * Extracts a structured text description from Excalidraw elements
 * so the AI can reason about a user's architecture diagram.
 */
export function extractDiagramText(elements: any[]): string {
  if (!elements || elements.length === 0) return '';

  const visible = elements.filter((e) => !e.isDeleted);
  if (visible.length === 0) return '';

  const byId = new Map<string, any>();
  for (const el of visible) {
    byId.set(el.id, el);
  }

  // Resolve the text label for a shape (bound text element or the shape's own text)
  const shapeLabel = (el: any): string => {
    // Check for bound text elements
    if (el.boundElements) {
      const boundText = el.boundElements.find((b: any) => b.type === 'text');
      if (boundText) {
        const textEl = byId.get(boundText.id);
        if (textEl?.text) return textEl.text.trim();
      }
    }
    // Shape might be a text element itself
    if (el.text) return el.text.trim();
    return '';
  };

  const shapeTypes = new Set(['rectangle', 'ellipse', 'diamond', 'image']);
  const shapes: { id: string; label: string; type: string }[] = [];
  const connections: string[] = [];
  const annotations: string[] = [];

  for (const el of visible) {
    if (shapeTypes.has(el.type)) {
      const label = shapeLabel(el);
      if (label) {
        shapes.push({ id: el.id, label, type: el.type });
      }
    } else if (el.type === 'arrow' || el.type === 'line') {
      const startId = el.startBinding?.elementId;
      const endId = el.endBinding?.elementId;
      if (startId && endId) {
        const startEl = byId.get(startId);
        const endEl = byId.get(endId);
        const startLabel = startEl ? shapeLabel(startEl) : '?';
        const endLabel = endEl ? shapeLabel(endEl) : '?';
        if (startLabel && endLabel) {
          // Check if the arrow itself has a label
          const arrowLabel = shapeLabel(el);
          connections.push(
            arrowLabel
              ? `${startLabel} --[${arrowLabel}]--> ${endLabel}`
              : `${startLabel} --> ${endLabel}`
          );
        }
      }
    } else if (el.type === 'text' && !el.containerId) {
      // Free-standing text (not bound to a shape)
      if (el.text?.trim()) {
        annotations.push(el.text.trim());
      }
    }
  }

  if (shapes.length === 0 && connections.length === 0 && annotations.length === 0) {
    return '';
  }

  const parts: string[] = ["## User's Architecture Diagram"];

  if (shapes.length > 0) {
    parts.push('Components:');
    for (const s of shapes) {
      parts.push(`- ${s.label}`);
    }
  }

  if (connections.length > 0) {
    parts.push('');
    parts.push('Connections:');
    for (const c of connections) {
      parts.push(`- ${c}`);
    }
  }

  if (annotations.length > 0) {
    parts.push('');
    parts.push('Annotations:');
    for (const a of annotations) {
      parts.push(`- ${a}`);
    }
  }

  return parts.join('\n');
}
