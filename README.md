# Google Apps Script IntelliSense

**Zero-config IntelliSense, autocompletion, and snippets for Google Apps Script development in VS Code.**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Features

### 🎯 **Automatic IntelliSense for GAS APIs**

Get instant autocompletion for all Google Apps Script services without any configuration:

- **Core Services:** SpreadsheetApp, GmailApp, DriveApp, CalendarApp, DocumentApp, SlidesApp, FormApp
- **Utility Services:** ScriptApp, PropertiesService, CacheService, UrlFetchApp, Utilities, HtmlService, Logger
- **Advanced Services:** AdminDirectory, Classroom, Analytics, BigQuery, YouTube, and 30+ more

Simply open a `.gs` file and start typing - IntelliSense appears instantly!

### 📝 **Code Snippets**

Speed up development with ready-to-use code snippets for common GAS patterns:

| Snippet Prefix | Description |
|----------------|-------------|
| `onOpen` | Create an onOpen trigger with custom menu |
| `onEdit` | Create an onEdit trigger with event handling |
| `doGet` | Create a doGet handler for web apps |
| `getActiveSheet` | Get the active spreadsheet and sheet |
| `sendEmail` | Send an email using MailApp |

### ✨ **Enhanced Editing Features**

- **Hover Documentation:** See method descriptions and types on hover
- **Signature Help:** View parameter hints as you type function calls
- **Go to Definition:** Jump to type definitions with Ctrl+Click
- **Syntax Highlighting:** Full JavaScript syntax highlighting for `.gs` files

## Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Google Apps Script IntelliSense"
4. Click Install

**Or install from the command line:**
```bash
code --install-extension apenara.gas-intellisense
```

## Quick Start

### 1. Open a `.gs` file

Create or open any Google Apps Script file (`.gs` extension):

```javascript
// test.gs
function myFunction() {

}
```

### 2. Start typing and see IntelliSense

```javascript
function myFunction() {
  SpreadsheetApp. // ← IntelliSense appears here!
}
```

### 3. Try a snippet

Type `onOpen` and press Tab:

```javascript
function onOpen(e) {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Custom Menu')
    .addItem('Menu Item', 'functionName')
    .addToUi();
}
```

## Usage Examples

### Example 1: Sheets Automation

```javascript
function updateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  // IntelliSense helps you discover methods
  sheet.getRange('A1').setValue('Hello World');

  // Hover over methods to see documentation
  const data = sheet.getDataRange().getValues();
}
```

### Example 2: Gmail Integration

```javascript
function processEmails() {
  // IntelliSense shows all GmailApp methods
  const threads = GmailApp.search('is:unread label:inbox');

  threads.forEach(thread => {
    const messages = thread.getMessages();
    // Full type information available
  });
}
```

### Example 3: Drive Operations

```javascript
function listFiles() {
  const folder = DriveApp.getFolderById('folder-id-here');
  const files = folder.getFiles();

  while (files.hasNext()) {
    const file = files.next();
    Logger.log(file.getName());
  }
}
```

## Available Snippets Reference

### Triggers & Entry Points

**`onOpen`** - Custom menu setup
```javascript
function onOpen(e) {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Custom Menu')
    .addItem('Menu Item', 'functionName')
    .addToUi();
}
```

**`onEdit`** - Sheet edit trigger
```javascript
function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const range = e.range;
  // Your edit handling code
}
```

**`doGet`** - Web app GET handler
```javascript
function doGet(e) {
  return HtmlService.createHtmlOutput('<h1>Hello</h1>')
    .setTitle('Web App');
}
```

### Spreadsheet Operations

**`getActiveSheet`** - Get current sheet
```javascript
const ss = SpreadsheetApp.getActiveSpreadsheet();
const sheet = ss.getActiveSheet();
```

### Email Operations

**`sendEmail`** - Send email via MailApp
```javascript
MailApp.sendEmail({
  to: 'recipient@example.com',
  subject: 'Email Subject',
  body: 'Email body text'
});
```

## Configuration

The extension works out of the box with zero configuration. Optional settings:

```json
{
  "gasIntellisense.enableSnippets": true
}
```

## Requirements

- VS Code 1.80.0 or higher
- No additional dependencies required (no clasp, no npm in your project)

## How It Works

This extension bundles the official `@types/google-apps-script` type definitions and registers `.gs` files with VS Code's JavaScript language server. The TypeScript/JavaScript language server automatically provides IntelliSense using these type definitions.

**No internet connection required** - all type definitions are bundled with the extension.

## Comparison with Other Tools

| Feature | This Extension | labnol/google-apps-script | Manual clasp setup |
|---------|----------------|---------------------------|-------------------|
| Zero-config IntelliSense | ✅ | ❌ | ❌ |
| GAS-specific snippets | ✅ | ❌ | ❌ |
| Works offline | ✅ | ✅ | ✅ |
| Requires npm/clasp | ❌ | ❌ | ✅ |
| Setup time | 0 min | 0 min | 15+ min |

## Limitations

This extension focuses solely on **IntelliSense and code editing**. It does not:

- ❌ Sync code with Google Apps Script (use [clasp](https://github.com/google/clasp) for this)
- ❌ Execute or deploy scripts (use clasp or the web editor)
- ❌ Create new GAS projects (use clasp)

**This is by design** - the extension does one thing well: improve your coding experience.

## Troubleshooting

### IntelliSense not appearing?

1. Make sure the file has a `.gs` extension
2. Try reloading VS Code (Ctrl+Shift+P → "Developer: Reload Window")
3. Check that the extension is activated (look for "GAS IntelliSense" in the status bar)

### Snippets not working?

1. Check that `gasIntellisense.enableSnippets` is set to `true` (default)
2. Make sure you're in a JavaScript context (.gs file)
3. Type the snippet prefix and press Tab or Enter

### Types seem outdated?

The extension uses `@types/google-apps-script` v2.0.7 (latest as of October 2025). Future updates will include newer versions.

## Roadmap

### Phase 2 (Coming Soon)
- [ ] 15+ additional code snippets
- [ ] Custom hover provider with links to Google documentation
- [ ] Enhanced signature help with examples
- [ ] Extension icon and branding

### Phase 3 (Future)
- [ ] Integration with clasp for push/pull
- [ ] Linter rules for common GAS mistakes
- [ ] Project templates and scaffolding
- [ ] AI-powered code generation

## Contributing

Contributions are welcome! Please feel free to:

- Report bugs via [GitHub Issues](https://github.com/apenara/gas-intellisense/issues)
- Submit feature requests
- Contribute code via Pull Requests
- Share your feedback

## Related Resources

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [clasp - Command Line Apps Script Projects](https://github.com/google/clasp)
- [@types/google-apps-script on npm](https://www.npmjs.com/package/@types/google-apps-script)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **Issues:** [GitHub Issues](https://github.com/apenara/gas-intellisense/issues)
- **Discussions:** [GitHub Discussions](https://github.com/apenara/gas-intellisense/discussions)
- **Email:** your-email@example.com

## Acknowledgments

- Built on top of [@types/google-apps-script](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/google-apps-script) by the DefinitelyTyped community
- Inspired by the need for better Google Apps Script development tools

---

**Made with ❤️ for the Google Apps Script community**

If this extension helps you, please consider:
- ⭐ Starring the repository
- 📝 Leaving a review on the marketplace
- 📢 Sharing with other GAS developers
