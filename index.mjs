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

import { execSync } from 'child_process';
import { env, exit } from 'node:process';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

function main() {
  if (env.PRIVATIZE_INSTALL) {
    console.info('Status: PRIVATIZE_INSTALL completed previously.');
    exit(0);
  }

  const jsonPath = path.resolve(process.cwd(), 'privatize.json');

  if (!existsSync(jsonPath)) {
    console.info('No privatize.json file found in application root.');
    exit(0);
  }

  const data = readFileSync(jsonPath, 'utf8');
  const { packages } = JSON.parse(data);

  if (!env.DEPLOYMENT_KEY) {
    console.error(
      'Error: encoded DEPLOYMENT_KEY environment variable is not set.'
    );
    exit(1);
  }

  // Create the .ssh directory and add GitHub to known hosts
  try {
    execSync(
      'mkdir -p ~/.ssh && ssh-keyscan -Ht rsa github.com >> ~/.ssh/known_hosts',
      { stdio: 'inherit' }
    );

    // Decode the ENV_DEPLOYMENT_KEY and save it to a file
    execSync(`echo ${env.DEPLOYMENT_KEY} | base64 -d > ~/.ssh/id_ed25519`, {
      stdio: 'inherit',
    });
    execSync('chmod 600 ~/.ssh/id_ed25519', { stdio: 'inherit' });

    console.log('SSH environment ready for github private install.');
  } catch (error) {
    console.error('Error during SSH environment setup:', error.message);
    exit(1);
  }

  // Run npm install without scripts
  try {
    execSync(`npm install ${packages.join(' ')} --no-scripts --save-optional`, {
      stdio: 'inherit',
    });
    //   execSync('rm -rf ~/.ssh', { stdio: 'inherit' });

    env.PRIVATIZE_INSTALL = 'COMPLETE';
    console.log('privatize install completed successfully.');
  } catch (error) {
    console.error('Error during npm install:', error.message);
    exit(1);
  }
}

main();
