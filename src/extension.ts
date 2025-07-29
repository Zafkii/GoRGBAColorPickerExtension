import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const provider = vscode.languages.registerColorProvider('go', {
    provideDocumentColors(document) {
      const text = document.getText();
      const colorMatches = [...text.matchAll(/color\.RGBA\{(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\}/g)];
      const results: vscode.ColorInformation[] = [];

      for (const match of colorMatches) {
        const [r, g, b, a] = match.slice(1, 5).map(Number);
        const start = document.positionAt(match.index!);
        const end = document.positionAt(match.index! + match[0].length);

        results.push(
          new vscode.ColorInformation(
            new vscode.Range(start, end),
            new vscode.Color(r / 255, g / 255, b / 255, a / 255)
          )
        );
      }

      return results;
    },

    provideColorPresentations(color, context) {
      const r = Math.round(color.red * 255);
      const g = Math.round(color.green * 255);
      const b = Math.round(color.blue * 255);
      const a = Math.round(color.alpha * 255);

      const label = `color.RGBA{${r}, ${g}, ${b}, ${a}}`;
      return [new vscode.ColorPresentation(label)];
    }
  });

  context.subscriptions.push(provider);
}

export function deactivate() {}
