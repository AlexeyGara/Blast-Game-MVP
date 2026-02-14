/*
 * WARNING:
 * This eslint_v.8 config is only for IDE real-time linting only; it is NOT USED by the CLI lint script!
 */

const path = require('path');

module.exports = function () {
	return {
		globals: {
			"cc": "readonly", // Cocos
			"Editor": "readonly",
			"jsb": "readonly",
		},

		parser: '@typescript-eslint/parser',
		parserOptions: {
			project: [// required for rules that need type information. See https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/parser#configuration
				'./tsconfig.json'
			],
			tsconfigRootDir: path.resolve(__dirname),
			createDefaultProgram: false,
			ecmaVersion: "latest",
			sourceType: "module"
		},
		plugins: [
			'@typescript-eslint',
			'@stylistic/ts',
			//'jest'
		],
		extends: [
			'plugin:import/recommended',
			'plugin:import/typescript',
			'plugin:@typescript-eslint/recommended',
			//'plugin:jest/recommended'
		],
		settings: {
			'import/resolver': {
				typescript: {
					alwaysTryTypes: true,
					project: './tsconfig.json'
				}
			}
		},
		env: {
			//"jest/globals": true
		},
		ignorePatterns: [
			"creator.d.ts",
			"dist/",
			"src/_global-init_/",
			"node_modules/",
			"library/",
			"local/",
			"temp/",
			"build/",
			"settings/",
			"packages/"
		],
		overrides: [{
			files: [
				"**/*.{ts,tsx}"
			],
			rules: {
				// obsolete and not working:
				//"@typescript-eslint/semi": ["error", "always"],// instead 'semi'

				// return to regular 'semi':
				"semi": ["error", "always"],// do not use with ts

				// extends regular 'semi' for interfaces:
				"@stylistic/ts/member-delimiter-style": ["error", {
					"multiline": {"delimiter": "semi", "requireLast": true},
					//"singleline": {"delimiter": "semi", "requireLast": true}
				}],

				"@typescript-eslint/naming-convention": [
					"error",
					{ // private properties & methods names: require to start with "_"
						"selector": "memberLike",
						"modifiers": ["private"],
						"format": ["camelCase"],
						"leadingUnderscore": "require"
					}, { // public and protected properties & methods names: never start with "_"
						"selector": "memberLike",
						"modifiers": ["public", "protected"],
						"format": ["camelCase"],
						"leadingUnderscore": "forbid"
					}, { // vars names: never start with "_" (exclude unusable vars)
						"selector": "variable",
						"format": ["camelCase", "UPPER_CASE"],
						"leadingUnderscore": "forbid"
					}, { // vars names: never start with "_" (only for exporting const)
						"selector": "variable",
						"modifiers": ["const", "exported"],
						"format": ["camelCase", "PascalCase", "UPPER_CASE"],
						"leadingUnderscore": "forbid"
					}, { // static consts names: never start with "_"
						"selector": "classProperty",
						"modifiers": ["static", "readonly"],
						"format": ["UPPER_CASE"],
						"leadingUnderscore": "forbid"
					},
				],

				"@typescript-eslint/consistent-type-imports": [
					"error",
					{
						"prefer": "type-imports",
						"fixStyle": "separate-type-imports"
					}
				],
				"@typescript-eslint/explicit-module-boundary-types": "error",
				"@typescript-eslint/explicit-function-return-type": "error",
				"@typescript-eslint/no-unused-vars": ["error", {"argsIgnorePattern": "^_$"}],

				"no-restricted-syntax": [
					"error", {
						"selector": "TSEnumDeclaration",
						"message": "Enum usage are deprecated! Use 'export const PascalNamed = { ... } as const' instead. And use type auto-inferring 'export type PascalNamed = typeof PascalNamed[keyof typeof PascalNamed]'."
					}, {
						"selector": "TSMethodSignature[kind='get'], TSMethodSignature[kind='set']",
						"message": "No get/set at interface and types declarations."
					}
				],

				"@typescript-eslint/no-misused-promises": [
					"error", {"checksVoidReturn": true}
				],
				"@typescript-eslint/no-floating-promises": "error",

				"no-restricted-imports": ["error", {
					"patterns": [{
						"group": ["../*"],
						"message": "Not relative '../' imports! Please use alias instead."
					}]
				}],
				"import/no-restricted-paths": [
					"error",
					{
						"zones": [{
							"from": "./assets/Script/platform",
							"target": "./assets/Script/app",
							"message": "Do not use platform directly! Please use dependency inversion instead."
						}, {
							"from": "./assets/Script/platform",
							"target": "./assets/Script/gameplay",
							"message": "Do not use platform directly! Please use dependency inversion instead."
						}]
					}
				]
			}
		}]
	}
}();