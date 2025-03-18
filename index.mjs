#!/usr/bin/env node

// 1. the DEPLOYMENT_KEY can be re/generated as follows
//      ssh-keygen -t ed25519 -C "<github email address>"
//      eval "$(ssh-agent -s)"
//      ssh-add ~/.ssh/id_ed25519
//      cat ~/.ssh/id_ed25519.pub
// 2. Add the public key contents to github
//  on github go to Profile - Settings - SSH & GPG keys to add a new ssh key contents
// 3. Setup the base64 private key into DEPLOYMENT_KEY
//      cat ~/.ssh/id_ed25519 | base64
//  3.1 on local machine, update ENV DEPLOYMENT_KEY= with 'the base64 private key content' in Node.dockerfile
//  3.2 on cloudflare, Update DEPLOYMENT_KEY environment variable with 'the base64 private key content' in both production and preview environments

import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { exit } from 'node:process';

const SSH_PATH = '~/.ssh/id_ed25519';

function main() {
  if (!import.meta.env.DEPLOYMENT_KEY) {
    console.error('Privatize error: encoded DEPLOYMENT_KEY environment variable is not set.');
    exit(1);
  }

  const packageName = path.resolve(process.cwd(), 'package.json');
  if (!existsSync(packageName)) {
    console.error('Privatize error: package.json not found.');
    exit(1);
  }

  const packageJson = JSON.parse(readFileSync(packageName, 'utf-8'));
  if (!Object.hasOwn(packageJson, 'privatize')) {
    console.info('No privatize key found');
    exit(0);
  }

  const repositories = Object.values(packageJson.privatize).join(' ');
  if (!repositories || repositories.length === 0) {
    console.info('No privatize repositories found');
    exit(0);
  }

  // Create the .ssh directory and add GitHub to known hosts
  try {
    execSync('mkdir -p ~/.ssh && ssh-keyscan -Ht rsa github.com >> ~/.ssh/known_hosts', { stdio: 'inherit' });
    // Decode the ENV_DEPLOYMENT_KEY and save it to a file
    execSync(`echo ${import.meta.env.DEPLOYMENT_KEY} | base64 -d > ${SSH_PATH}`, {
      stdio: 'inherit',
    });
    execSync(`chmod 600 ${SSH_PATH}`, { stdio: 'inherit' });

    console.log('SSH environment ready for github private install.');
  } catch (error) {
    console.error('Error during SSH environment setup:', error.message);
    exit(1);
  }

  // Run npm install without scripts
  try {
    console.log(`npm install ${repositories} --no-scripts --save-optional`);
    execSync(`npm install ${repositories} --no-scripts --save-optional`, {
      stdio: 'inherit',
    });
    execSync(`rm -rf ${SSH_PATH}`, { stdio: 'inherit' });
    console.log('privatize install completed successfully.');
  } catch (error) {
    console.error('Error during npm install:', error.message);
    exit(1);
  }
}

main();
