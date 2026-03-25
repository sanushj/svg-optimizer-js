# SVG Optimizer

Minify and clean SVG files by removing comments, metadata, editor artifacts, and collapsing whitespace.

**Live Demo:** https://file-converter-free.com/en/image-tools/svg-optimizer

## How It Works

The tool processes SVG files as plain text using a series of regular expression substitutions. It strips the XML declaration, HTML/XML comments (preserving conditional IE comments), `<metadata>`, `<title>`, and `<desc>` elements. Sodipodi and Inkscape namespace elements and attributes are removed as editor-specific artifacts. Generated numeric IDs that match common editor patterns are deleted. Empty attributes (e.g., `style=""`, `class=""`) are stripped. Finally, all whitespace sequences are collapsed to a single space and leading/trailing whitespace is trimmed. Before and after file sizes are computed using `new Blob([text]).size` to report bytes saved and percentage reduction.

## Features

- Removes XML declaration, comments, metadata, title, and description elements
- Strips Inkscape/Sodipodi editor-specific namespaced elements and attributes
- Removes auto-generated numeric IDs
- Removes empty attributes
- Reports original size, optimized size, bytes saved, and percentage reduction

## Browser APIs Used

- FileReader API (`readAsText`)
- Blob for size measurement
- Clipboard API

## Code Structure

| File | Description |
|------|-------------|
| `svg-optimizer.js` | IIFE — regex-based SVG cleaning pipeline with size stats reporting |

## Usage

| Element ID | Purpose |
|------------|---------|
| `dropZone` | Drag-and-drop target for SVG file |
| `fileInput` | File picker input |
| `svgInput` | Textarea showing raw SVG input |
| `svgOutput` | Textarea showing optimized SVG |
| `statsEl` | Size reduction statistics |
| `copyBtn` | Copy optimized SVG to clipboard |
| `downloadBtn` | Download optimized SVG |

## License

MIT
