// Test file for Google Apps Script IntelliSense
// Open this file and test the following:

// 1. Type "SpreadsheetApp." and see autocomplete
function testSpreadsheetIntelliSense() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  sheet.getRange('A1').setValue('Testing IntelliSense');
}

// 2. Type "GmailApp." and see autocomplete
function testGmailIntelliSense() {
  const threads = GmailApp.search('is:unread');
  Logger.log(threads.length);
}

// 3. Type "DriveApp." and see autocomplete
function testDriveIntelliSense() {
  const files = DriveApp.getFilesByName('test.txt');
}

// 4. Test snippets - type the following prefixes and press Tab:
// - onOpen
// - onEdit
// - doGet
// - getActiveSheet
// - sendEmail

// 5. Hover over any method to see documentation

// 6. Press Ctrl+Click on any GAS class/method to go to definition
