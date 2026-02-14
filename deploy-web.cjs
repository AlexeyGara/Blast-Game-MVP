/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: Blast-Game-MVP
 * File: deploy-web.js
 * Path:
 * Author: alexeygara
 * Last modified: 2026-02-14 13:47
 */

const {execSync} = require('child_process');
const config = require('./build-web.json');
const buildPath = `${config.buildPath}/${config.platform}`;

try {
	console.log(`\n--- Starting Build: '${buildPath}' ---`);

	execSync('npm run build:web', {stdio: 'inherit'});

	console.log(`\n--- Build Finished. ---`);


	console.log(`\n--- Starting Tests ---`);

	execSync('npm run test', {stdio: 'inherit'});

	console.log(`\n--- Tests Completed. ---`)


	console.log(`\n--- Starting Deploy: 'gh-pages' -> '${buildPath}' ---`);

	execSync('gh-pages -d ' + buildPath, {stdio: 'inherit'});

	console.log('--- Successfully Deployed. ---');
}
catch(error) {
	console.error('--- Deployment failed! ---');

	process.exit(1);
}