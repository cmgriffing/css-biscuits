import vscode, { Range, TextDocument as RawTextDocument } from "vscode";
import { createActivate } from "biscuits-base";

import * as cssCore from "vscode-css-languageservice";
import { FoldingRange } from "vscode-css-languageservice";

// Needs to be genericized
const CONFIG_PREFIX_KEY = "css-biscuits.annotationPrefix";
const CONFIG_COLOR_KEY = "css-biscuits.annotationColor";
const CONFIG_DISTANCE_KEY = "css-biscuits.annotationMinDistance";
const CONFIG_MAX_LENGTH = "css-biscuits.annotationMaxLength";

export const activate = createActivate(
  CONFIG_COLOR_KEY,
  CONFIG_DISTANCE_KEY,
  CONFIG_PREFIX_KEY,
  {
    createDecorations(
      text: string,
      activeEditor: vscode.TextEditor,
      prefix: string,
      minDistance: number
    ) {
      const rawTextDocument = { ...activeEditor.document } as any;
      rawTextDocument.uri = rawTextDocument.uri.toString();
      const textDocument = rawTextDocument as cssCore.TextDocument;

      let css = cssCore.getSCSSLanguageService();
      if (activeEditor.document.languageId === "less") {
        css = cssCore.getLESSLanguageService();
      }

      const ranges = css.getFoldingRanges(textDocument);

      const decorations: any[] = [];

      ranges.forEach((range: FoldingRange) => {
        const endLine = range.endLine + 1;
        const startLine = range.startLine;

        let contentText = activeEditor.document.lineAt(startLine).text.trim();

        if (contentText.charAt(0) === "{") {
          contentText = activeEditor.document.lineAt(startLine - 1).text.trim();
        }

        if (contentText.charAt(contentText.length - 1) === "{") {
          contentText = contentText.slice(0, contentText.length - 2);
        }

        const endOfLine = activeEditor.document.lineAt(endLine).range.end;

        if (endLine - startLine >= minDistance) {
          decorations.push({
            range: new vscode.Range(
              activeEditor.document.positionAt(endLine),
              endOfLine
            ),
            renderOptions: {
              after: {
                contentText: `${prefix} ${contentText}`,
              },
            },
          });
        }
      });

      return decorations;
    },
  }
);
