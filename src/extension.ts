import * as vscode from 'vscode';

/**
 * This method is called when your extension is activated
 * Extension is activated when a JavaScript file is opened (including .gs files)
 */
export function activate(context: vscode.ExtensionContext) {
	console.log('GAS IntelliSense extension is now active!');

	// The @types/google-apps-script package is bundled with the extension
	// VS Code's TypeScript language server automatically picks up the types
	// and provides IntelliSense for .gs files (which are mapped to JavaScript)

	// Future enhancements can register custom providers here:
	// - Hover provider with links to Google documentation
	// - Signature help provider for enhanced parameter hints
	// - Completion provider for custom suggestions

	// Register a command (optional - for future use)
	const disposable = vscode.commands.registerCommand('gas-intellisense.helloWorld', () => {
		vscode.window.showInformationMessage('GAS IntelliSense is working!');
	});

	context.subscriptions.push(disposable);
}

/**
 * This method is called when your extension is deactivated
 */
export function deactivate() {
	console.log('GAS IntelliSense extension is now deactivated');
}
