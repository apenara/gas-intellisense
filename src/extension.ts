import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/**
 * This method is called when your extension is activated
 * Extension is activated when a JavaScript file is opened (including .gs files)
 */
export function activate(context: vscode.ExtensionContext) {
	console.log('GAS IntelliSense extension is now active!');

	// Check if we should prompt for workspace setup when .gs files are opened
	context.subscriptions.push(
		vscode.workspace.onDidOpenTextDocument(async (document) => {
			if (document.fileName.endsWith('.gs')) {
				await promptForWorkspaceSetup(context);
			}
		})
	);

	// Check currently open documents for .gs files
	vscode.workspace.textDocuments.forEach(async (document) => {
		if (document.fileName.endsWith('.gs')) {
			await promptForWorkspaceSetup(context);
		}
	});

	// Watch for new workspace folders
	context.subscriptions.push(
		vscode.workspace.onDidChangeWorkspaceFolders(async (e) => {
			for (const folder of e.added) {
				await promptForWorkspaceSetup(context);
			}
		})
	);

	// Register hover provider for GAS files
	const hoverProvider = vscode.languages.registerHoverProvider(
		['javascript', 'javascriptreact'],
		new GasHoverProvider()
	);
	context.subscriptions.push(hoverProvider);

	// Register manual setup command
	const setupCommand = vscode.commands.registerCommand('gas-intellisense.setupWorkspace', async () => {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (workspaceFolders && workspaceFolders.length > 0) {
			for (const folder of workspaceFolders) {
				await setupTypeDefinitions(folder.uri.fsPath, context.extensionPath, context);
			}
		} else {
			vscode.window.showWarningMessage('No workspace folder open. Please open a folder first.');
		}
	});
	context.subscriptions.push(setupCommand);

	// Register hello world command (for testing)
	const disposable = vscode.commands.registerCommand('gas-intellisense.helloWorld', () => {
		vscode.window.showInformationMessage('GAS IntelliSense is working!');
	});
	context.subscriptions.push(disposable);
}

/**
 * Prompts the user to set up the workspace for GAS IntelliSense
 * Only prompts once per workspace unless user explicitly requests setup again
 */
async function promptForWorkspaceSetup(context: vscode.ExtensionContext): Promise<void> {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders || workspaceFolders.length === 0) {
		return;
	}

	// Check if we've already asked the user for this workspace
	const workspaceId = workspaceFolders[0].uri.fsPath;
	const setupKey = `gas-intellisense.setup.${workspaceId}`;
	const setupState = context.workspaceState.get<string>(setupKey);

	if (setupState === 'completed' || setupState === 'declined') {
		// User has already made a choice for this workspace
		return;
	}

	// Check if setup is already done (config files exist)
	const folder = workspaceFolders[0];
	const jsconfigPath = path.join(folder.uri.fsPath, 'jsconfig.json');
	const tsconfigPath = path.join(folder.uri.fsPath, 'tsconfig.json');

	if (fs.existsSync(tsconfigPath) || fs.existsSync(jsconfigPath)) {
		// Configuration already exists, mark as completed
		await context.workspaceState.update(setupKey, 'completed');
		return;
	}

	// Show setup prompt
	const choice = await vscode.window.showInformationMessage(
		'GAS IntelliSense can configure your workspace for better Google Apps Script IntelliSense. This will create a jsconfig.json file and copy type definitions. Would you like to set up now?',
		'Yes',
		'No',
		'Don\'t Ask Again'
	);

	if (choice === 'Yes') {
		// User agreed, set up all workspace folders
		for (const folder of workspaceFolders) {
			await setupTypeDefinitions(folder.uri.fsPath, context.extensionPath, context);
		}
		await context.workspaceState.update(setupKey, 'completed');
	} else if (choice === 'Don\'t Ask Again') {
		// User doesn't want to be asked again for this workspace
		await context.workspaceState.update(setupKey, 'declined');
		vscode.window.showInformationMessage(
			'You can manually set up the workspace later using the command: "GAS: Setup Workspace"'
		);
	}
	// If 'No', we don't save state, so we'll ask again next time a .gs file is opened
}

/**
 * Sets up type definitions for Google Apps Script in the workspace
 */
async function setupTypeDefinitions(
	workspacePath: string,
	extensionPath: string,
	context: vscode.ExtensionContext
): Promise<boolean> {
	const jsconfigPath = path.join(workspacePath, 'jsconfig.json');
	const tsconfigPath = path.join(workspacePath, 'tsconfig.json');

	// Check if there's already a config file
	if (fs.existsSync(tsconfigPath) || fs.existsSync(jsconfigPath)) {
		console.log('TypeScript/JavaScript config already exists, skipping auto-setup');
		vscode.window.showInformationMessage(
			'GAS IntelliSense: Workspace already configured (existing config file found)'
		);
		return true;
	}

	// Copy type definitions to workspace node_modules
	const workspaceTypesDir = path.join(workspacePath, 'node_modules', '@types', 'google-apps-script');
	const extensionTypesDir = path.join(extensionPath, 'typedefs', 'google-apps-script');

	if (!fs.existsSync(extensionTypesDir)) {
		const errorMsg = 'Bundled type definitions not found in extension. Please reinstall the extension.';
		console.error(errorMsg);
		vscode.window.showErrorMessage('GAS IntelliSense: ' + errorMsg);
		return false;
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

		// Notify the user with option to reload
		const choice = await vscode.window.showInformationMessage(
			'GAS IntelliSense: Workspace configured successfully! Reload the window to activate IntelliSense for Google Apps Script.',
			'Reload Now',
			'Later'
		);

		if (choice === 'Reload Now') {
			await vscode.commands.executeCommand('workbench.action.reloadWindow');
		}

		return true;
	} catch (error) {
		const errorMsg = `Failed to setup GAS types: ${error}`;
		console.error(errorMsg);
		vscode.window.showErrorMessage('GAS IntelliSense: ' + errorMsg);
		return false;
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
			},

			// Additional Spreadsheet Methods
			'getSheetByName': {
				name: 'Spreadsheet.getSheetByName(name)',
				description: 'Returns a sheet with the specified name. Returns null if no sheet with that name exists.',
				link: 'https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#getsheetbynamename',
				example: 'const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(\'Sales\');'
			},
			'deleteRow': {
				name: 'Sheet.deleteRow(rowPosition)',
				description: 'Deletes the row at the specified position.',
				link: 'https://developers.google.com/apps-script/reference/spreadsheet/sheet#deleterowrowposition',
				example: 'sheet.deleteRow(5); // Delete row 5'
			},
			'insertRows': {
				name: 'Sheet.insertRows(rowIndex, numRows)',
				description: 'Inserts one or more consecutive blank rows starting at the specified location.',
				link: 'https://developers.google.com/apps-script/reference/spreadsheet/sheet#insertrowsrowindex,-numrows',
				example: 'sheet.insertRows(3, 2); // Insert 2 rows at position 3'
			},
			'getLastRow': {
				name: 'Sheet.getLastRow()',
				description: 'Returns the position of the last row that has content.',
				link: 'https://developers.google.com/apps-script/reference/spreadsheet/sheet#getlastrow',
				example: 'const lastRow = sheet.getLastRow();'
			},
			'getLastColumn': {
				name: 'Sheet.getLastColumn()',
				description: 'Returns the position of the last column that has content.',
				link: 'https://developers.google.com/apps-script/reference/spreadsheet/sheet#getlastcolumn',
				example: 'const lastCol = sheet.getLastColumn();'
			},
			'setFormula': {
				name: 'Range.setFormula(formula)',
				description: 'Sets the formula for the range. The formula is in A1 notation.',
				link: 'https://developers.google.com/apps-script/reference/spreadsheet/range#setformulaformula',
				example: 'range.setFormula(\'=SUM(A1:A10)\');'
			},
			'copyTo': {
				name: 'Range.copyTo(destination)',
				description: 'Copies the data from a range to another range. Both values and formatting are copied.',
				link: 'https://developers.google.com/apps-script/reference/spreadsheet/range#copytodestination',
				example: 'sourceRange.copyTo(destinationRange);'
			},

			// Advanced Gmail Methods
			'createLabel': {
				name: 'GmailApp.createLabel(name)',
				description: 'Creates a new label. Throws an error if a label with that name already exists.',
				link: 'https://developers.google.com/apps-script/reference/gmail/gmail-app#createlabelname',
				example: 'const label = GmailApp.createLabel(\'Important\');'
			},
			'getInboxThreads': {
				name: 'GmailApp.getInboxThreads()',
				description: 'Retrieves all threads in the inbox.',
				link: 'https://developers.google.com/apps-script/reference/gmail/gmail-app#getinboxthreads',
				example: 'const threads = GmailApp.getInboxThreads();'
			},
			'getDrafts': {
				name: 'GmailApp.getDrafts()',
				description: 'Gets all Gmail draft messages.',
				link: 'https://developers.google.com/apps-script/reference/gmail/gmail-app#getdrafts',
				example: 'const drafts = GmailApp.getDrafts();'
			},
			'markRead': {
				name: 'GmailThread.markRead()',
				description: 'Marks this thread as read.',
				link: 'https://developers.google.com/apps-script/reference/gmail/gmail-thread#markread',
				example: 'thread.markRead();'
			},
			'moveToTrash': {
				name: 'GmailThread.moveToTrash()',
				description: 'Moves this thread to the trash.',
				link: 'https://developers.google.com/apps-script/reference/gmail/gmail-thread#movetotrash',
				example: 'thread.moveToTrash();'
			},

			// Drive Methods
			'getFiles': {
				name: 'Folder.getFiles()',
				description: 'Gets a collection of all files in the folder.',
				link: 'https://developers.google.com/apps-script/reference/drive/folder#getfiles',
				example: 'const files = folder.getFiles();\nwhile (files.hasNext()) {\n  const file = files.next();\n}'
			},
			'getFolders': {
				name: 'Folder.getFolders()',
				description: 'Gets a collection of all folders in the folder.',
				link: 'https://developers.google.com/apps-script/reference/drive/folder#getfolders',
				example: 'const folders = folder.getFolders();'
			},
			'createFile': {
				name: 'Folder.createFile(blob)',
				description: 'Creates a file in the folder from a given Blob of arbitrary data.',
				link: 'https://developers.google.com/apps-script/reference/drive/folder#createfileblob',
				example: 'const file = folder.createFile(Utilities.newBlob(\'Hello World\', \'text/plain\', \'file.txt\'));'
			},
			'makeCopy': {
				name: 'File.makeCopy(name)',
				description: 'Creates a copy of the file. If no name is provided, uses a default name.',
				link: 'https://developers.google.com/apps-script/reference/drive/file#makecopyname',
				example: 'const copy = file.makeCopy(\'Copy of \' + file.getName());'
			},
			'setSharing': {
				name: 'File.setSharing(accessType, permissionType)',
				description: 'Sets the sharing access and permissions for the file.',
				link: 'https://developers.google.com/apps-script/reference/drive/file#setsharingaccesstype,-permissiontype',
				example: 'file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);'
			},

			// Calendar Methods
			'getEvents': {
				name: 'Calendar.getEvents(startTime, endTime)',
				description: 'Gets all events that occur within a given time range.',
				link: 'https://developers.google.com/apps-script/reference/calendar/calendar#geteventsstarttime,-endtime',
				example: 'const events = calendar.getEvents(new Date(), new Date(Date.now() + 7*24*60*60*1000));'
			},
			'createAllDayEvent': {
				name: 'Calendar.createAllDayEvent(title, date)',
				description: 'Creates a new all-day event.',
				link: 'https://developers.google.com/apps-script/reference/calendar/calendar#createalldayeventtitle,-date',
				example: 'calendar.createAllDayEvent(\'Holiday\', new Date(\'July 4, 2024\'));'
			},
			'getCalendarById': {
				name: 'CalendarApp.getCalendarById(id)',
				description: 'Gets the calendar with the specified ID.',
				link: 'https://developers.google.com/apps-script/reference/calendar/calendar-app#getcalendarbyidid',
				example: 'const calendar = CalendarApp.getCalendarById(\'primary\');'
			},

			// Document Methods
			'getBody': {
				name: 'Document.getBody()',
				description: 'Retrieves the document body. The body includes all document elements.',
				link: 'https://developers.google.com/apps-script/reference/document/document#getbody',
				example: 'const body = DocumentApp.getActiveDocument().getBody();'
			},
			'appendParagraph': {
				name: 'Body.appendParagraph(text)',
				description: 'Creates and appends a new Paragraph containing the given text contents.',
				link: 'https://developers.google.com/apps-script/reference/document/body#appendparagraphtext',
				example: 'body.appendParagraph(\'This is a new paragraph\');'
			},
			'appendTable': {
				name: 'Body.appendTable(cells)',
				description: 'Creates and appends a new Table containing the specified cells.',
				link: 'https://developers.google.com/apps-script/reference/document/body#appendtablecells',
				example: 'body.appendTable([[\'Row 1, Cell 1\', \'Row 1, Cell 2\']]);'
			},
			'openById': {
				name: 'DocumentApp.openById(id)',
				description: 'Opens and returns the document with the specified ID.',
				link: 'https://developers.google.com/apps-script/reference/document/document-app#openbyidid',
				example: 'const doc = DocumentApp.openById(\'abc123xyz\');'
			},

			// Forms Methods
			'create': {
				name: 'FormApp.create(title)',
				description: 'Creates and returns a new Form with the given title.',
				link: 'https://developers.google.com/apps-script/reference/forms/form-app#createtitle',
				example: 'const form = FormApp.create(\'Customer Survey\');'
			},
			'addMultipleChoiceItem': {
				name: 'Form.addMultipleChoiceItem()',
				description: 'Adds a new multiple-choice question to the form.',
				link: 'https://developers.google.com/apps-script/reference/forms/form#addmultiplechoiceitem',
				example: 'form.addMultipleChoiceItem().setTitle(\'Choose one\').setChoices([...]);'
			},
			'addTextItem': {
				name: 'Form.addTextItem()',
				description: 'Adds a new text question to the form.',
				link: 'https://developers.google.com/apps-script/reference/forms/form#addtextitem',
				example: 'form.addTextItem().setTitle(\'What is your name?\').setRequired(true);'
			},
			'getResponses': {
				name: 'Form.getResponses()',
				description: 'Gets all responses to the form.',
				link: 'https://developers.google.com/apps-script/reference/forms/form#getresponses',
				example: 'const responses = form.getResponses();'
			},

			// Slides Methods
			'appendSlide': {
				name: 'Presentation.appendSlide()',
				description: 'Appends a blank slide to the end of the presentation.',
				link: 'https://developers.google.com/apps-script/reference/slides/presentation#appendslide',
				example: 'const slide = presentation.appendSlide();'
			},
			'getSlides': {
				name: 'Presentation.getSlides()',
				description: 'Gets the slides in the presentation.',
				link: 'https://developers.google.com/apps-script/reference/slides/presentation#getslides',
				example: 'const slides = presentation.getSlides();'
			},
			'insertShape': {
				name: 'Slide.insertShape(shapeType)',
				description: 'Inserts a shape on the slide.',
				link: 'https://developers.google.com/apps-script/reference/slides/slide#insertshapeshapetype',
				example: 'slide.insertShape(SlidesApp.ShapeType.RECTANGLE);'
			},

			// Utilities Methods
			'formatDate': {
				name: 'Utilities.formatDate(date, timeZone, format)',
				description: 'Formats a date using the specified time zone and format string.',
				link: 'https://developers.google.com/apps-script/reference/utilities/utilities#formatdatedate,-timezone,-format',
				example: 'const formatted = Utilities.formatDate(new Date(), \'GMT\', \'yyyy-MM-dd HH:mm:ss\');'
			},
			'sleep': {
				name: 'Utilities.sleep(milliseconds)',
				description: 'Sleeps for specified number of milliseconds. Maximum time is 300000 milliseconds (5 minutes).',
				link: 'https://developers.google.com/apps-script/reference/utilities/utilities#sleepmilliseconds',
				example: 'Utilities.sleep(1000); // Sleep for 1 second'
			},
			'base64Encode': {
				name: 'Utilities.base64Encode(data)',
				description: 'Generates a base64-encoded string from the given string or byte array.',
				link: 'https://developers.google.com/apps-script/reference/utilities/utilities#base64encodedata',
				example: 'const encoded = Utilities.base64Encode(\'Hello World\');'
			},
			'computeDigest': {
				name: 'Utilities.computeDigest(algorithm, value)',
				description: 'Computes a digest using the specified algorithm on the specified value.',
				link: 'https://developers.google.com/apps-script/reference/utilities/utilities#computedigestalgorithm,-value',
				example: 'const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, \'input\');'
			},
			'parseCsv': {
				name: 'Utilities.parseCsv(csv)',
				description: 'Returns a two-dimensional array representing the values in a CSV string.',
				link: 'https://developers.google.com/apps-script/reference/utilities/utilities#parsecsvcsv',
				example: 'const data = Utilities.parseCsv(\'a,b,c\\n1,2,3\');'
			},

			// UrlFetchApp Methods
			'fetch': {
				name: 'UrlFetchApp.fetch(url, params)',
				description: 'Makes an HTTP request to a URL and returns the response.',
				link: 'https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app#fetchurl,-params',
				example: 'const response = UrlFetchApp.fetch(\'https://api.example.com/data\');'
			},
			'fetchAll': {
				name: 'UrlFetchApp.fetchAll(requests)',
				description: 'Fetches multiple URLs simultaneously.',
				link: 'https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app#fetchallrequests',
				example: 'const responses = UrlFetchApp.fetchAll([{url: \'url1\'}, {url: \'url2\'}]);'
			},
			'getContentText': {
				name: 'HTTPResponse.getContentText()',
				description: 'Returns the content of an HTTP response as a string.',
				link: 'https://developers.google.com/apps-script/reference/url-fetch/http-response#getcontenttext',
				example: 'const text = response.getContentText();'
			},

			// Properties Service Methods
			'getScriptProperties': {
				name: 'PropertiesService.getScriptProperties()',
				description: 'Gets a property store that all users of this script can access.',
				link: 'https://developers.google.com/apps-script/reference/properties/properties-service#getscriptproperties',
				example: 'const props = PropertiesService.getScriptProperties();'
			},
			'getUserProperties': {
				name: 'PropertiesService.getUserProperties()',
				description: 'Gets a property store that is specific to the current user.',
				link: 'https://developers.google.com/apps-script/reference/properties/properties-service#getuserproperties',
				example: 'const userProps = PropertiesService.getUserProperties();'
			},
			'getProperty': {
				name: 'Properties.getProperty(key)',
				description: 'Gets the value associated with the given key in the current Properties store.',
				link: 'https://developers.google.com/apps-script/reference/properties/properties#getpropertykey',
				example: 'const value = props.getProperty(\'myKey\');'
			},
			'setProperty': {
				name: 'Properties.setProperty(key, value)',
				description: 'Sets the value associated with the given key in the current Properties store.',
				link: 'https://developers.google.com/apps-script/reference/properties/properties#setpropertykey,-value',
				example: 'props.setProperty(\'myKey\', \'myValue\');'
			},

			// Cache Service Methods
			'getScriptCache': {
				name: 'CacheService.getScriptCache()',
				description: 'Gets a cache that is common to all users of the script.',
				link: 'https://developers.google.com/apps-script/reference/cache/cache-service#getscriptcache',
				example: 'const cache = CacheService.getScriptCache();'
			},
			'getUserCache': {
				name: 'CacheService.getUserCache()',
				description: 'Gets a cache that is specific to the current user.',
				link: 'https://developers.google.com/apps-script/reference/cache/cache-service#getusercache',
				example: 'const userCache = CacheService.getUserCache();'
			},
			'put': {
				name: 'Cache.put(key, value, expirationInSeconds)',
				description: 'Adds a key/value pair to the cache. Maximum expiration is 6 hours (21600 seconds).',
				link: 'https://developers.google.com/apps-script/reference/cache/cache#putkey,-value,-expirationinseconds',
				example: 'cache.put(\'myKey\', \'myValue\', 600); // Cache for 10 minutes'
			},
			'get': {
				name: 'Cache.get(key)',
				description: 'Gets the value for the given key from the cache. Returns null if not found or expired.',
				link: 'https://developers.google.com/apps-script/reference/cache/cache#getkey',
				example: 'const value = cache.get(\'myKey\');'
			},

			// Script Service Methods
			'newTrigger': {
				name: 'ScriptApp.newTrigger(functionName)',
				description: 'Creates a new trigger builder. Must call create() to build and install the trigger.',
				link: 'https://developers.google.com/apps-script/reference/script/script-app#newtriggerfunctionname',
				example: 'ScriptApp.newTrigger(\'myFunction\').timeBased().everyHours(1).create();'
			},
			'getProjectTriggers': {
				name: 'ScriptApp.getProjectTriggers()',
				description: 'Gets all installable triggers owned by this user in this project.',
				link: 'https://developers.google.com/apps-script/reference/script/script-app#getprojecttriggers',
				example: 'const triggers = ScriptApp.getProjectTriggers();'
			},
			'deleteTrigger': {
				name: 'ScriptApp.deleteTrigger(trigger)',
				description: 'Deletes the specified trigger.',
				link: 'https://developers.google.com/apps-script/reference/script/script-app#deletetriggertrigger',
				example: 'ScriptApp.deleteTrigger(trigger);'
			},

			// Session Methods
			'Session': {
				name: 'Session',
				description: 'Access information about the current user and execution context.',
				link: 'https://developers.google.com/apps-script/reference/base/session',
				example: 'const email = Session.getActiveUser().getEmail();'
			},
			'getActiveUser': {
				name: 'Session.getActiveUser()',
				description: 'Gets the currently active user. Returns null in some contexts.',
				link: 'https://developers.google.com/apps-script/reference/base/session#getactiveuser',
				example: 'const user = Session.getActiveUser();'
			},
			'getEffectiveUser': {
				name: 'Session.getEffectiveUser()',
				description: 'Gets the effective user. This is the user whose permissions are being used.',
				link: 'https://developers.google.com/apps-script/reference/base/session#geteffectiveuser',
				example: 'const effectiveUser = Session.getEffectiveUser();'
			},
			'getTimeZone': {
				name: 'Session.getScriptTimeZone()',
				description: 'Gets the time zone of the script.',
				link: 'https://developers.google.com/apps-script/reference/base/session#getscripttimezone',
				example: 'const timeZone = Session.getScriptTimeZone();'
			},

			// Lock Service
			'LockService': {
				name: 'LockService',
				description: 'Prevents concurrent access to sections of code. Useful for avoiding race conditions.',
				link: 'https://developers.google.com/apps-script/reference/lock/lock-service',
				example: 'const lock = LockService.getScriptLock();\nlock.waitLock(30000); // Wait up to 30 seconds\ntry {\n  // Critical section\n} finally {\n  lock.releaseLock();\n}'
			},
			'getScriptLock': {
				name: 'LockService.getScriptLock()',
				description: 'Gets a lock that prevents any user from concurrently running a section of code.',
				link: 'https://developers.google.com/apps-script/reference/lock/lock-service#getscriptlock',
				example: 'const lock = LockService.getScriptLock();'
			},

			// Blob and Utilities
			'newBlob': {
				name: 'Utilities.newBlob(data, contentType, name)',
				description: 'Creates a new Blob object from a string, byte array, or data source.',
				link: 'https://developers.google.com/apps-script/reference/utilities/utilities#newblobdata,-contenttype,-name',
				example: 'const blob = Utilities.newBlob(\'Hello World\', \'text/plain\', \'hello.txt\');'
			},
			'zip': {
				name: 'Utilities.zip(blobs, name)',
				description: 'Creates a new Blob object that is a zip file containing the specified blobs.',
				link: 'https://developers.google.com/apps-script/reference/utilities/utilities#zipblobs,-name',
				example: 'const zipBlob = Utilities.zip([blob1, blob2], \'archive.zip\');'
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
