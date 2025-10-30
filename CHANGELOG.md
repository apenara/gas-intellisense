# Changelog

All notable changes to the "gas-intellisense" extension will be documented in this file.

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
