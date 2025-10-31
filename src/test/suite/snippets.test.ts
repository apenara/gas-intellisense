import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';

suite('Snippet Validation Test Suite', () => {
	const snippetsPath = path.resolve(__dirname, '../../../snippets/gas-snippets.json');

	test('Snippets file should exist', () => {
		assert.ok(fs.existsSync(snippetsPath), 'gas-snippets.json file should exist');
	});

	test('Snippets file should be valid JSON', () => {
		const content = fs.readFileSync(snippetsPath, 'utf-8');
		assert.doesNotThrow(() => {
			JSON.parse(content);
		}, 'Snippets file should be valid JSON');
	});

	test('All snippets should have required fields', () => {
		const content = fs.readFileSync(snippetsPath, 'utf-8');
		const snippets = JSON.parse(content);

		for (const [name, snippet] of Object.entries(snippets)) {
			const s = snippet as any;

			assert.ok(s.prefix, `Snippet "${name}" should have a prefix`);
			assert.ok(s.body, `Snippet "${name}" should have a body`);
			assert.ok(s.description, `Snippet "${name}" should have a description`);

			assert.ok(typeof s.prefix === 'string', `Snippet "${name}" prefix should be a string`);
			assert.ok(Array.isArray(s.body), `Snippet "${name}" body should be an array`);
			assert.ok(typeof s.description === 'string', `Snippet "${name}" description should be a string`);
		}
	});

	test('All snippet prefixes should be unique', () => {
		const content = fs.readFileSync(snippetsPath, 'utf-8');
		const snippets = JSON.parse(content);

		const prefixes = new Set<string>();
		const duplicates: string[] = [];

		for (const [name, snippet] of Object.entries(snippets)) {
			const s = snippet as any;
			const prefix = s.prefix;

			if (prefixes.has(prefix)) {
				duplicates.push(prefix);
			} else {
				prefixes.add(prefix);
			}
		}

		assert.strictEqual(
			duplicates.length,
			0,
			`Found duplicate prefixes: ${duplicates.join(', ')}`
		);
	});

	test('Snippet bodies should not be empty', () => {
		const content = fs.readFileSync(snippetsPath, 'utf-8');
		const snippets = JSON.parse(content);

		for (const [name, snippet] of Object.entries(snippets)) {
			const s = snippet as any;

			assert.ok(
				s.body.length > 0,
				`Snippet "${name}" body should not be empty`
			);

			// Check that body lines are not all empty
			const hasContent = s.body.some((line: string) => line.trim().length > 0);
			assert.ok(
				hasContent,
				`Snippet "${name}" should have at least one non-empty line`
			);
		}
	});

	test('Snippet bodies should be valid JavaScript syntax', () => {
		const content = fs.readFileSync(snippetsPath, 'utf-8');
		const snippets = JSON.parse(content);

		for (const [name, snippet] of Object.entries(snippets)) {
			const s = snippet as any;

			// Join body lines and remove snippet placeholders
			let code = s.body.join('\n');

			// Remove VS Code snippet syntax: ${1:text}, $0, ${variable}
			code = code.replace(/\$\{?\d+:?[^}]*\}?/g, 'placeholder');
			code = code.replace(/\$\d+/g, 'placeholder');

			// Simple syntax check - just ensure it doesn't have obvious syntax errors
			// We'll check for balanced braces, brackets, and parentheses
			const braces = (code.match(/\{/g) || []).length - (code.match(/\}/g) || []).length;
			const brackets = (code.match(/\[/g) || []).length - (code.match(/\]/g) || []).length;
			const parens = (code.match(/\(/g) || []).length - (code.match(/\)/g) || []).length;

			assert.strictEqual(
				braces,
				0,
				`Snippet "${name}" has unbalanced braces`
			);
			assert.strictEqual(
				brackets,
				0,
				`Snippet "${name}" has unbalanced brackets`
			);
			assert.strictEqual(
				parens,
				0,
				`Snippet "${name}" has unbalanced parentheses`
			);
		}
	});

	test('Should have expected number of snippets', () => {
		const content = fs.readFileSync(snippetsPath, 'utf-8');
		const snippets = JSON.parse(content);

		const snippetCount = Object.keys(snippets).length;

		// As per the README, we should have 28 snippets
		assert.strictEqual(
			snippetCount,
			28,
			`Expected 28 snippets, but found ${snippetCount}`
		);
	});

	test('Common snippets should exist', () => {
		const content = fs.readFileSync(snippetsPath, 'utf-8');
		const snippets = JSON.parse(content);

		const expectedPrefixes = [
			'onOpen',
			'onEdit',
			'doGet',
			'doPost',
			'getActiveSheet',
			'sendEmail',
			'getRange',
			'getValues',
			'log',
			'tryCatch'
		];

		const allPrefixes = Object.values(snippets).map((s: any) => s.prefix);

		for (const prefix of expectedPrefixes) {
			assert.ok(
				allPrefixes.includes(prefix),
				`Expected snippet with prefix "${prefix}" to exist`
			);
		}
	});

	test('Snippet descriptions should be meaningful', () => {
		const content = fs.readFileSync(snippetsPath, 'utf-8');
		const snippets = JSON.parse(content);

		for (const [name, snippet] of Object.entries(snippets)) {
			const s = snippet as any;

			assert.ok(
				s.description.length >= 10,
				`Snippet "${name}" description should be at least 10 characters (got: "${s.description}")`
			);

			// Description should not be the same as the prefix
			assert.notStrictEqual(
				s.description.toLowerCase(),
				s.prefix.toLowerCase(),
				`Snippet "${name}" description should not be the same as prefix`
			);
		}
	});
});
