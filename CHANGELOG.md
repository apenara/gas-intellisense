# Changelog

All notable changes to the "gas-intellisense" extension will be documented in this file.

## [1.1.0] - 2025-10-30

### Fixed
- **[Critical]** Bundled type definitions directly into extension to fix marketplace installation
  - Previously required manual `npm install` which defeated zero-config promise
  - Extension now works immediately after installation from VS Code marketplace
  - Type definitions are now in `typedefs/` folder (~2.2MB added to extension)
  - No external dependencies needed at runtime

### Changed
- **[Breaking]** Workspace setup is now opt-in - extension will prompt for permission before creating files
- Users can now choose when to set up their workspace for enhanced IntelliSense
- Window reload is now optional after setup (user can choose "Reload Now" or "Later")
- Improved error handling and user feedback during workspace setup

### Added
- New command: "GAS: Setup Workspace" for manual workspace configuration
- 40+ additional hover documentation entries covering all major GAS services:
  - Additional Spreadsheet methods (getSheetByName, deleteRow, insertRows, setFormula, etc.)
  - Gmail methods (createLabel, getInboxThreads, getDrafts, markRead, moveToTrash)
  - Drive methods (getFiles, createFile, makeCopy, setSharing)
  - Calendar methods (getEvents, createAllDayEvent, getCalendarById)
  - Document methods (getBody, appendParagraph, appendTable)
  - Forms methods (addMultipleChoiceItem, addTextItem, getResponses)
  - Slides methods (appendSlide, getSlides, insertShape)
  - Utilities methods (formatDate, sleep, base64Encode, computeDigest, parseCsv)
  - UrlFetchApp methods (fetch, fetchAll, getContentText)
  - PropertiesService methods (getScriptProperties, getUserProperties)
  - CacheService methods (getScriptCache, getUserCache, put, get)
  - ScriptApp methods (newTrigger, getProjectTriggers, deleteTrigger)
  - Session methods (getActiveUser, getEffectiveUser, getTimeZone)
  - LockService methods for concurrency control
  - Blob utilities (newBlob, zip)
- Comprehensive test suite:
  - Integration tests for extension activation, commands, and hover provider
  - Snippet validation tests ensuring all 28 snippets are properly formatted
- Workspace state management to remember user's setup preference per workspace

### Improved
- Better user experience with non-intrusive permission-based setup
- Enhanced troubleshooting documentation in README
- More detailed "How It Works" section explaining the setup process

### Technical
- Added test dependencies: mocha, @vscode/test-electron, glob
- Created test infrastructure in `src/test/` directory
- Improved TypeScript types and error handling throughout codebase

## [1.0.0] - 2025-10-30

### Added
- Initial release of GAS IntelliSense extension
- Zero-config IntelliSense for all Google Apps Script APIs
- Support for `.gs` file extension with JavaScript language features
- 5 essential code snippets:
  - `onOpen` - Custom menu trigger
  - `onEdit` - Sheet edit trigger
  - `doGet` - Web app GET handler
  - `getActiveSheet` - Get active sheet
  - `sendEmail` - Send email via MailApp
- Bundled `@types/google-apps-script` v2.0.7 for comprehensive type definitions
- Hover documentation support
- Signature help for function parameters
- Go-to-definition functionality
- Complete documentation in README

### Features
- Covers 40+ Google Apps Script services including:
  - Core services (SpreadsheetApp, GmailApp, DriveApp, etc.)
  - Utility services (Logger, UrlFetchApp, PropertiesService, etc.)
  - Advanced services (AdminDirectory, Classroom, Analytics, etc.)
- Works completely offline
- No configuration required
- No external dependencies needed (no clasp, no npm in user projects)

### Technical
- Built with TypeScript and webpack
- Extension size: ~1.5 KB (minified)
- Activation time: <500ms
- Compatible with VS Code 1.80.0+
