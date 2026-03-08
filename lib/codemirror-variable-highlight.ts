import {
  ViewPlugin,
  ViewUpdate,
  Decoration,
  DecorationSet,
  EditorView,
} from "@codemirror/view";
import { Range } from "@codemirror/state";
import { Environment } from "@/types/environment";

function buildDecorations(
  view: EditorView,
  getActiveEnv: () => Environment | undefined
): DecorationSet {
  const decorations: Range<Decoration>[] = [];
  const env = getActiveEnv();

  for (const { from, to } of view.visibleRanges) {
    const text = view.state.doc.sliceString(from, to);
    const regex = /\{\{([^}]+)\}\}/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const key = match[1].trim();
      const start = from + match.index;
      const end = start + match[0].length;

      const isValid = env?.variables.some(
        (v) => v.enabled && v.key === key
      );

      const deco = Decoration.mark({
        class: isValid ? "cm-var-valid" : "cm-var-missing",
      });

      decorations.push(deco.range(start, end));
    }
  }

  return Decoration.set(decorations, true);
}

export function variableHighlight(
  getActiveEnv: () => Environment | undefined
) {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = buildDecorations(view, getActiveEnv);
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = buildDecorations(update.view, getActiveEnv);
        }
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  );
}
