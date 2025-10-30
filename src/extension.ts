import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/**
 * This method is called when your extension is activated
 * Extension is activated when a JavaScript file is opened (including .gs files)
 */
export function activate(context: vscode.ExtensionContext) {
	console.log('GAS IntelliSense extension is now active!');

	// Setup type definitions by creating a proper workspace configuration
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (workspaceFolders && workspaceFolders.length > 0) {
		for (const folder of workspaceFolders) {
			setupTypeDefinitions(folder.uri.fsPath, context.extensionPath);
		}
	}

	// Watch for new workspace folders
	context.subscriptions.push(
		vscode.workspace.onDidChangeWorkspaceFolders(e => {
			for (const folder of e.added) {
				setupTypeDefinitions(folder.uri.fsPath, context.extensionPath);
			}
		})
	);

	// Register hover provider for GAS files
	const hoverProvider = vscode.languages.registerHoverProvider(
		['javascript', 'javascriptreact'],
		new GasHoverProvider()
	);
	context.subscriptions.push(hoverProvider);

	// Register a command (optional - for future use)
	const disposable = vscode.commands.registerCommand('gas-intellisense.helloWorld', () => {
		vscode.window.showInformationMessage('GAS IntelliSense is working!');
	});

	context.subscriptions.push(disposable);
}

/**
 * Sets up type definitions for Google Apps Script in the workspace
 */
function setupTypeDefinitions(workspacePath: string, extensionPath: string) {
	const jsconfigPath = path.join(workspacePath, 'jsconfig.json');
	const tsconfigPath = path.join(workspacePath, 'tsconfig.json');

	// Check if there's already a config file
	if (fs.existsSync(tsconfigPath) || fs.existsSync(jsconfigPath)) {
		console.log('TypeScript/JavaScript config already exists, skipping auto-setup');
		return;
	}

	// Copy type definitions to workspace node_modules
	const workspaceTypesDir = path.join(workspacePath, 'node_modules', '@types', 'google-apps-script');
	const extensionTypesDir = path.join(extensionPath, 'node_modules', '@types', 'google-apps-script');

	if (!fs.existsSync(extensionTypesDir)) {
		console.error('@types/google-apps-script not found in extension');
		return;
	}

	try {
		// Create node_modules/@types directory in workspace
		fs.mkdirSync(path.join(workspacePath, 'node_modules', '@types'), { recursive: true });

		// Copy the type definitions
		copyDirectory(extensionTypesDir, workspaceTypesDir);

		// Create a jsconfig.json that includes the GAS types
		const jsconfig = {
			compilerOptions: {
				target: "ES2015",
				lib: ["ES2015"],
				checkJs: false
			},
			include: ["**/*.js", "**/*.gs"],
			exclude: ["node_modules"],
			typeAcquisition: {
				include: ["google-apps-script"]
			}
		};

		fs.writeFileSync(jsconfigPath, JSON.stringify(jsconfig, null, 2));
		console.log('Created jsconfig.json and copied GAS type definitions');

		// Notify the user
		vscode.window.showInformationMessage(
			'GAS IntelliSense: Workspace configured for Google Apps Script'
		);

		// Reload the window to pick up the new types
		vscode.commands.executeCommand('workbench.action.reloadWindow');
	} catch (error) {
		console.error('Failed to setup GAS types:', error);
	}
}

/**
 * Recursively copy a directory
 */
function copyDirectory(src: string, dest: string) {
	if (!fs.existsSync(dest)) {
		fs.mkdirSync(dest, { recursive: true });
	}

	const entries = fs.readdirSync(src, { withFileTypes: true });

	for (const entry of entries) {
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name);

		if (entry.isDirectory()) {
			copyDirectory(srcPath, destPath);
		} else {
			fs.copyFileSync(srcPath, destPath);
		}
	}
}

/**
 * Hover provider for Google Apps Script APIs
 */
class GasHoverProvider implements vscode.HoverProvider {
	provideHover(
		document: vscode.TextDocument,
		position: vscode.Position,
		token: vscode.CancellationToken
	): vscode.ProviderResult<vscode.Hover> {
		const wordRange = document.getWordRangeAtPosition(position);
		if (!wordRange) {
			return null;
		}

		const word = document.getText(wordRange);
		const docInfo = this.getGasDocumentation(word);

		if (docInfo) {
			const markdown = new vscode.MarkdownString();
			markdown.isTrusted = true;
			markdown.supportHtml = true;

			// Add description
			markdown.appendMarkdown(`**${docInfo.name}**\n\n`);
			markdown.appendMarkdown(`${docInfo.description}\n\n`);

			// Add link to documentation
			if (docInfo.link) {
				markdown.appendMarkdown(`[📚 View Google Documentation](${docInfo.link})\n\n`);
			}

			// Add usage example if available
			if (docInfo.example) {
				markdown.appendCodeblock(docInfo.example, 'javascript');
			}

			return new vscode.Hover(markdown);
		}

		return null;
	}

	/**
	 * Get documentation for GAS APIs
	 */
	private getGasDocumentation(word: string): GasDocInfo | null {
		/* eslint-disable @typescript-eslint/naming-convention */
		const docs: { [key: string]: GasDocInfo } = {
			// Spreadsheet Services
			'SpreadsheetApp': {
				name: 'SpreadsheetApp',
				description: 'Access and modify Google Sheets files. Common methods include getActiveSpreadsheet(), openById(), create().',
				link: 'https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app',
				example: 'const ss = SpreadsheetApp.getActiveSpreadsheet();\nconst sheet = ss.getActiveSheet();'
			},
			'getActiveSpreadsheet': {
				name: 'SpreadsheetApp.getActiveSpreadsheet()',
				description: 'Returns the currently active spreadsheet, or null if there is none.',
				link: 'https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#getactivespreadsheet',
				example: 'const ss = SpreadsheetApp.getActiveSpreadsheet();'
			},
			'getActiveSheet': {
				name: 'Spreadsheet.getActiveSheet()',
				description: 'Gets the active sheet in a spreadsheet.',
				link: 'https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getactivesheet',
				example: 'const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();'
			},
			'getRange': {
				name: 'Sheet.getRange(a1Notation)',
				description: 'Returns a range as specified in A1 notation or R1C1 notation.',
				link: 'https://developers.google.com/apps-script/reference/spreadsheet/sheet#getrangea1notation',
				example: 'const range = sheet.getRange(\'A1:B10\');'
			},
			'getValues': {
				name: 'Range.getValues()',
				description: 'Returns a two-dimensional array of values. Returns a 2D array where each inner array represents a row.',
				link: 'https://developers.google.com/apps-script/reference/spreadsheet/range#getvalues',
				example: 'const values = range.getValues();\n// values = [[\'A1\', \'B1\'], [\'A2\', \'B2\']]'
			},
			'setValue': {
				name: 'Range.setValue(value)',
				description: 'Sets the value of the range. The value can be numeric, string, boolean, or date.',
				link: 'https://developers.google.com/apps-script/reference/spreadsheet/range#setvaluevalue',
				example: 'range.setValue(\'Hello World\');'
			},
			'appendRow': {
				name: 'Sheet.appendRow(rowContents)',
				description: 'Appends a row to the bottom of the current data region in the sheet.',
				link: 'https://developers.google.com/apps-script/reference/spreadsheet/sheet#appendrowrowcontents',
				example: 'sheet.appendRow([\'Name\', \'Email\', \'Date\']);'
			},
			'getDataRange': {
				name: 'Sheet.getDataRange()',
				description: 'Returns a Range corresponding to the dimensions in which data is present.',
				link: 'https://developers.google.com/apps-script/reference/spreadsheet/sheet#getdatarange',
				example: 'const data = sheet.getDataRange().getValues();'
			},

			// Gmail Services
			'GmailApp': {
				name: 'GmailApp',
				description: 'Provides access to Gmail messages, threads, labels, and settings. Use to search, read, send emails.',
				link: 'https://developers.google.com/apps-script/reference/gmail/gmail-app',
				example: 'const threads = GmailApp.search(\'is:unread\');\nthreads.forEach(thread => thread.markRead());'
			},
			'sendEmail': {
				name: 'GmailApp.sendEmail(recipient, subject, body, options)',
				description: 'Sends an email message. Can include HTML body, attachments, cc, bcc.',
				link: 'https://developers.google.com/apps-script/reference/gmail/gmail-app#sendemailrecipient,-subject,-body,-options',
				example: 'GmailApp.sendEmail(\'user@example.com\', \'Subject\', \'Body text\');'
			},
			'search': {
				name: 'GmailApp.search(query)',
				description: 'Search Gmail with the same query you would use in the Gmail UI.',
				link: 'https://developers.google.com/apps-script/reference/gmail/gmail-app#searchquery',
				example: 'const threads = GmailApp.search(\'from:boss is:unread\');'
			},

			// Mail Services
			'MailApp': {
				name: 'MailApp',
				description: 'Sends email. Simpler than GmailApp but with quota limits. Use for basic email sending.',
				link: 'https://developers.google.com/apps-script/reference/mail/mail-app',
				example: 'MailApp.sendEmail(\'user@example.com\', \'Subject\', \'Body\');'
			},

			// Drive Services
			'DriveApp': {
				name: 'DriveApp',
				description: 'Access and modify Google Drive files and folders. Create, find, update, delete files.',
				link: 'https://developers.google.com/apps-script/reference/drive/drive-app',
				example: 'const files = DriveApp.getFilesByName(\'Budget\');\nwhile (files.hasNext()) {\n  const file = files.next();\n}'
			},
			'getFileById': {
				name: 'DriveApp.getFileById(id)',
				description: 'Gets the file with the specified ID.',
				link: 'https://developers.google.com/apps-script/reference/drive/drive-app#getfilebyidid',
				example: 'const file = DriveApp.getFileById(\'abc123xyz\');'
			},
			'getFolderById': {
				name: 'DriveApp.getFolderById(id)',
				description: 'Gets the folder with the specified ID.',
				link: 'https://developers.google.com/apps-script/reference/drive/drive-app#getfolderbyidid',
				example: 'const folder = DriveApp.getFolderById(\'abc123xyz\');'
			},
			'createFolder': {
				name: 'DriveApp.createFolder(name)',
				description: 'Creates a folder in the root of the user\'s Drive.',
				link: 'https://developers.google.com/apps-script/reference/drive/drive-app#createfoldername',
				example: 'const folder = DriveApp.createFolder(\'My Reports\');'
			},

			// Calendar Services
			'CalendarApp': {
				name: 'CalendarApp',
				description: 'Access and modify Google Calendar. Create events, manage calendars, set reminders.',
				link: 'https://developers.google.com/apps-script/reference/calendar/calendar-app',
				example: 'const cal = CalendarApp.getDefaultCalendar();\ncal.createEvent(\'Meeting\', new Date(), new Date());'
			},
			'getDefaultCalendar': {
				name: 'CalendarApp.getDefaultCalendar()',
				description: 'Gets the user\'s default calendar.',
				link: 'https://developers.google.com/apps-script/reference/calendar/calendar-app#getdefaultcalendar',
				example: 'const calendar = CalendarApp.getDefaultCalendar();'
			},
			'createEvent': {
				name: 'Calendar.createEvent(title, startTime, endTime)',
				description: 'Creates a new event in the calendar.',
				link: 'https://developers.google.com/apps-script/reference/calendar/calendar#createeventtitle,-starttime,-endtime',
				example: 'calendar.createEvent(\'Meeting\', new Date(\'March 3, 2024 10:00:00\'), new Date(\'March 3, 2024 11:00:00\'));'
			},

			// Document Services
			'DocumentApp': {
				name: 'DocumentApp',
				description: 'Create and modify Google Docs files. Access document body, paragraphs, tables.',
				link: 'https://developers.google.com/apps-script/reference/document/document-app',
				example: 'const doc = DocumentApp.create(\'New Document\');\nconst body = doc.getBody();\nbody.appendParagraph(\'Hello World\');'
			},

			// Forms Services
			'FormApp': {
				name: 'FormApp',
				description: 'Create and modify Google Forms. Add questions, get responses, set destinations.',
				link: 'https://developers.google.com/apps-script/reference/forms/form-app',
				example: 'const form = FormApp.create(\'Survey\');\nform.addMultipleChoiceItem().setTitle(\'Choose one\');'
			},

			// Slides Services
			'SlidesApp': {
				name: 'SlidesApp',
				description: 'Create and modify Google Slides presentations. Add slides, shapes, images, text.',
				link: 'https://developers.google.com/apps-script/reference/slides/slides-app',
				example: 'const presentation = SlidesApp.create(\'Presentation\');\npresentation.appendSlide();'
			},

			// Utilities
			'Logger': {
				name: 'Logger',
				description: 'Write to the logging console. View logs in Executions page or Apps Script editor.',
				link: 'https://developers.google.com/apps-script/reference/base/logger',
				example: 'Logger.log(\'Debug message\');\nLogger.log(\'Value: %s\', myVariable);'
			},
			'Utilities': {
				name: 'Utilities',
				description: 'Utility methods for formatting dates, parsing JSON, base64 encoding, computing digests, and more.',
				link: 'https://developers.google.com/apps-script/reference/utilities/utilities',
				example: 'const formatted = Utilities.formatDate(new Date(), \'GMT\', \'yyyy-MM-dd\');'
			},
			'UrlFetchApp': {
				name: 'UrlFetchApp',
				description: 'Fetch resources and communicate with other hosts over the Internet.',
				link: 'https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app',
				example: 'const response = UrlFetchApp.fetch(\'https://api.example.com/data\');\nconst data = JSON.parse(response.getContentText());'
			},
			'PropertiesService': {
				name: 'PropertiesService',
				description: 'Store and retrieve data that persists across executions. Choose script, user, or document properties.',
				link: 'https://developers.google.com/apps-script/reference/properties/properties-service',
				example: 'const props = PropertiesService.getScriptProperties();\nprops.setProperty(\'key\', \'value\');'
			},
			'CacheService': {
				name: 'CacheService',
				description: 'Store data temporarily for fast access. Useful for caching API responses.',
				link: 'https://developers.google.com/apps-script/reference/cache/cache-service',
				example: 'const cache = CacheService.getScriptCache();\ncache.put(\'key\', \'value\', 600); // 10 min TTL'
			},
			'HtmlService': {
				name: 'HtmlService',
				description: 'Create and serve HTML pages from scripts. Build web apps and custom dialogs.',
				link: 'https://developers.google.com/apps-script/reference/html/html-service',
				example: 'const html = HtmlService.createHtmlOutput(\'<h1>Hello</h1>\');\nSpreadsheetApp.getUi().showSidebar(html);'
			},
			'ScriptApp': {
				name: 'ScriptApp',
				description: 'Control script execution, triggers, permissions, and deployment info.',
				link: 'https://developers.google.com/apps-script/reference/script/script-app',
				example: 'ScriptApp.newTrigger(\'myFunction\').timeBased().everyHours(1).create();'
			},
			'ContentService': {
				name: 'ContentService',
				description: 'Return text content from a script. Use for creating web service responses.',
				link: 'https://developers.google.com/apps-script/reference/content/content-service',
				example: 'return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);'
			}
		};
		/* eslint-enable @typescript-eslint/naming-convention */

		return docs[word] || null;
	}
}

/**
 * Interface for GAS documentation info
 */
interface GasDocInfo {
	name: string;
	description: string;
	link: string;
	example?: string;
}

/**
 * This method is called when your extension is deactivated
 */
export function deactivate() {
	console.log('GAS IntelliSense extension is now deactivated');
}
