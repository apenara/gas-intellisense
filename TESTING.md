# Testing the GAS IntelliSense Extension

This guide explains how to test the extension in VS Code's Extension Development Host.

## Quick Start

### 1. Open the Project in VS Code

```bash
cd /mnt/c/gas/gas-intellisense
code .
```

### 2. Launch Extension Development Host

**Method 1: Keyboard Shortcut**
- Press `F5` in VS Code

**Method 2: Debug Panel**
1. Open the Run and Debug panel (Ctrl+Shift+D)
2. Select "Run Extension" from the dropdown
3. Click the green play button

**Method 3: Command Palette**
1. Press Ctrl+Shift+P
2. Type "Debug: Start Debugging"
3. Press Enter

### 3. Wait for Compilation

The extension will automatically compile with webpack. You'll see output in the terminal like:
```
> gas-intellisense@1.0.0 watch
> webpack --watch
```

Wait for the message: `webpack compiled successfully`

### 4. Test in the New VS Code Window

A new VS Code window will open with the title **"[Extension Development Host]"**

## Test Scenarios

### Test 1: Basic IntelliSense

1. In the Extension Development Host window, open `test.gs`
2. Inside any function, type: `SpreadsheetApp.`
3. **Expected:** Autocomplete menu appears with methods like:
   - `getActiveSpreadsheet()`
   - `openById()`
   - `create()`
   - etc.

4. Try other services:
   - `GmailApp.`
   - `DriveApp.`
   - `CalendarApp.`
   - `Logger.`

### Test 2: Code Snippets

1. Create a new line in the file
2. Type: `onOpen`
3. Press Tab or Enter
4. **Expected:** Full onOpen function is inserted with placeholders

Try all snippets:
- `onOpen` → Custom menu trigger
- `onEdit` → Edit event handler
- `doGet` → Web app handler
- `getActiveSheet` → Get active sheet
- `sendEmail` → Send email template

### Test 3: Hover Documentation

1. Hover your mouse over any GAS method (e.g., `getActiveSpreadsheet`)
2. **Expected:** Tooltip appears showing:
   - Method signature
   - Return type
   - Description (if available)

### Test 4: Signature Help

1. Type: `SpreadsheetApp.openById(`
2. **Expected:** Parameter hints appear showing:
   - Required parameter: `id: string`
   - Return type information

### Test 5: Go to Definition

1. Right-click on any GAS class or method (e.g., `SpreadsheetApp`)
2. Select "Go to Definition" (or press F12)
3. **Expected:** Opens the type definition file from `@types/google-apps-script`

### Test 6: File Extension Recognition

1. Create a new file named `mycode.gs`
2. **Expected:** File is recognized as JavaScript
3. Syntax highlighting should work
4. All IntelliSense features should work

## Troubleshooting

### IntelliSense Not Working?

**Solution 1: Reload Window**
```
Ctrl+Shift+P → "Developer: Reload Window"
```

**Solution 2: Check Extension Activation**
1. Open Developer Tools in Extension Development Host:
   - Press Ctrl+Shift+I
2. Check Console for: `"GAS IntelliSense extension is now active!"`

**Solution 3: Verify Compilation**
1. Check the terminal in the original VS Code window
2. Look for `webpack compiled successfully`

### Snippets Not Appearing?

1. Make sure you're in a `.gs` file or JavaScript file
2. Try typing the full prefix (e.g., `onOpen`)
3. Press Tab after typing the prefix

### Extension Won't Load?

**Check for Errors:**
1. In Extension Development Host, press Ctrl+Shift+I
2. Look at Console tab for red errors
3. Check the Problems panel (Ctrl+Shift+M)

**Rebuild Extension:**
```bash
npm run compile
```

## Manual Testing Checklist

- [ ] Extension activates without errors
- [ ] Console shows "GAS IntelliSense extension is now active!"
- [ ] `.gs` files recognized as JavaScript
- [ ] SpreadsheetApp autocomplete works
- [ ] GmailApp autocomplete works
- [ ] DriveApp autocomplete works
- [ ] CalendarApp autocomplete works
- [ ] All 5 snippets work (onOpen, onEdit, doGet, getActiveSheet, sendEmail)
- [ ] Hover shows type information
- [ ] Signature help appears on `(`
- [ ] Go to Definition works (F12)
- [ ] No console errors in Extension Development Host

## Performance Testing

### Extension Size
```bash
# Build production version
npm run package

# Check size
ls -lh dist/extension.js
```

**Target:** <5 KB minified

### Activation Time

1. Open Developer Tools in Extension Development Host
2. Run in Console:
```javascript
performance.measure('extension-activation')
```

**Target:** <500ms

### Memory Usage

1. In Extension Development Host, go to: Help → Process Explorer
2. Find "Extension Host" process
3. Check memory usage

**Target:** <50 MB

## Debugging

### Add Breakpoints

1. Open `src/extension.ts` in the main VS Code window
2. Click in the gutter to add breakpoints
3. Press F5 to start debugging
4. Breakpoints will hit in the Extension Development Host

### View Logs

**Method 1: Developer Console**
- In Extension Development Host: Ctrl+Shift+I
- Go to Console tab

**Method 2: Output Panel**
- In Extension Development Host: Ctrl+Shift+U
- Select "Log (Extension Host)" from dropdown

## Next Steps After Testing

Once all tests pass:

1. **Package Extension**
   ```bash
   vsce package
   ```
   This creates `gas-intellisense-1.0.0.vsix`

2. **Install Locally**
   ```bash
   code --install-extension gas-intellisense-1.0.0.vsix
   ```

3. **Test in Real Environment**
   - Open a real GAS project
   - Verify everything works outside Extension Development Host

4. **Prepare for Publishing**
   - Create screenshots
   - Record demo GIF
   - Set up GitHub repository
   - Get publisher account on VS Code Marketplace

## Common Issues & Solutions

### Issue: Types not showing up
**Solution:** Verify `@types/google-apps-script` is in node_modules:
```bash
ls node_modules/@types/google-apps-script
```

### Issue: Webpack compilation fails
**Solution:** Clean and reinstall:
```bash
rm -rf node_modules dist
npm install
npm run compile
```

### Issue: Extension doesn't activate
**Solution:** Check `activationEvents` in package.json:
```json
"activationEvents": [
  "onLanguage:javascript"
]
```

## Feedback

If you find any issues during testing:
1. Note the steps to reproduce
2. Check Developer Console for errors
3. Create an issue with details

---

**Happy Testing!** 🎉
