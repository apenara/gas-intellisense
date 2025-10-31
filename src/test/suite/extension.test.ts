import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Integration Test Suite', () => {
	vscode.window.showInformationMessage('Start all integration tests.');

	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension('apenara.gas-intellisense'));
	});

	test('Extension should activate', async () => {
		const ext = vscode.extensions.getExtension('apenara.gas-intellisense');
		assert.ok(ext);

		await ext!.activate();
		assert.strictEqual(ext!.isActive, true);
	});

	test('Setup workspace command should be registered', async () => {
		const commands = await vscode.commands.getCommands(true);
		assert.ok(commands.includes('gas-intellisense.setupWorkspace'));
	});

	test('Hover provider should be registered for JavaScript', async () => {
		// Create a temporary document
		const doc = await vscode.workspace.openTextDocument({
			language: 'javascript',
			content: 'const app = SpreadsheetApp;'
		});

		const editor = await vscode.window.showTextDocument(doc);
		const position = new vscode.Position(0, 16); // Position on 'SpreadsheetApp'

		// Request hover information
		const hovers = await vscode.commands.executeCommand<vscode.Hover[]>(
			'vscode.executeHoverProvider',
			doc.uri,
			position
		);

		// Should have at least one hover provider response
		assert.ok(hovers && hovers.length > 0, 'Hover provider should return results');
	});

	test('Snippets should be available for JavaScript', async () => {
		const snippets = await vscode.commands.executeCommand<any>(
			'vscode.executeCompletionItemProvider',
			vscode.Uri.parse('untitled:test.gs'),
			new vscode.Position(0, 0)
		);

		assert.ok(snippets, 'Completion items should be available');
	});

	test('Language configuration should include .gs files', () => {
		const ext = vscode.extensions.getExtension('apenara.gas-intellisense');
		assert.ok(ext);

		const packageJSON = ext!.packageJSON;
		const languages = packageJSON.contributes.languages;

		assert.ok(languages, 'Languages should be defined');
		assert.ok(Array.isArray(languages), 'Languages should be an array');

		const gasLanguage = languages.find((lang: any) =>
			lang.extensions && lang.extensions.includes('.gs')
		);

		assert.ok(gasLanguage, '.gs extension should be registered');
		assert.strictEqual(gasLanguage.id, 'javascript', '.gs should be associated with JavaScript');
	});

	test('Configuration properties should be registered', () => {
		const config = vscode.workspace.getConfiguration('gasIntellisense');

		// Test that enableSnippets setting exists
		const enableSnippets = config.inspect('enableSnippets');
		assert.ok(enableSnippets, 'enableSnippets setting should exist');
		assert.strictEqual(enableSnippets!.defaultValue, true, 'enableSnippets should default to true');
	});
});
