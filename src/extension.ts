import * as vscode from "vscode"

export function activate(context: vscode.ExtensionContext) {
  const provider = vscode.languages.registerColorProvider("go", {
    provideDocumentColors(document) {
      const text = document.getText()
      const results: vscode.ColorInformation[] = []

      // RGBA con campos nombrados o posicionales
      const rgbaRegex =
        /color\.RGBA\s*\{\s*(?:(?:R\s*:\s*(\d+))\s*,\s*G\s*:\s*(\d+)\s*,\s*B\s*:\s*(\d+)\s*,\s*A\s*:\s*(\d+)|(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+))\s*\}/g

      let match
      while ((match = rgbaRegex.exec(text)) !== null) {
        let r, g, b, a

        if (match[1]) {
          r = parseInt(match[1])
          g = parseInt(match[2])
          b = parseInt(match[3])
          a = parseInt(match[4])
        } else {
          r = parseInt(match[5])
          g = parseInt(match[6])
          b = parseInt(match[7])
          a = parseInt(match[8])
        }

        const start = document.positionAt(match.index!)
        const end = document.positionAt(match.index! + match[0].length)

        results.push(
          new vscode.ColorInformation(
            new vscode.Range(start, end),
            new vscode.Color(r / 255, g / 255, b / 255, a / 255)
          )
        )
      }

      // HEX (0xaarrggbb)
      const hexRegex = /0x([0-9a-fA-F]{8})/g

      while ((match = hexRegex.exec(text)) !== null) {
        const hex = match[1]
        const a = parseInt(hex.slice(0, 2), 16)
        const r = parseInt(hex.slice(2, 4), 16)
        const g = parseInt(hex.slice(4, 6), 16)
        const b = parseInt(hex.slice(6, 8), 16)

        const start = document.positionAt(match.index!)
        const end = document.positionAt(match.index! + match[0].length)

        results.push(
          new vscode.ColorInformation(
            new vscode.Range(start, end),
            new vscode.Color(r / 255, g / 255, b / 255, a / 255)
          )
        )
      }

      return results
    },

    provideColorPresentations(color, context) {
      const r = Math.round(color.red * 255)
      const g = Math.round(color.green * 255)
      const b = Math.round(color.blue * 255)
      const a = Math.round(color.alpha * 255)

      const rgbaNamed = `color.RGBA{R: ${r}, G: ${g}, B: ${b}, A: ${a}}`
      const rgbaPositional = `color.RGBA{${r}, ${g}, ${b}, ${a}}`
      const hexValue = `0x${toHex(a)}${toHex(r)}${toHex(g)}${toHex(b)}`

      return [
        new vscode.ColorPresentation(rgbaNamed),
        new vscode.ColorPresentation(rgbaPositional),
        new vscode.ColorPresentation(hexValue),
      ]
    },
  })

  context.subscriptions.push(provider)
}

function toHex(value: number): string {
  return value.toString(16).padStart(2, "0")
}

export function deactivate() {}
