#!/usr/bin/env node
'use strict';

// Polyfill for Async/Await and other features in older Node versionss
import "babel-polyfill";

import program from 'commander';
import chalk from 'chalk';

import publishCommand from './commands/publish';

import {version} from '../package.json';
import uploadCommand from './commands/upload';
import downloadCommand from './commands/download';

program
  .version(version);

publishCommand(program);
uploadCommand(program);
downloadCommand(program);

program
  .command('*')
  .description('Prints help')
  .action(function () {
    console.error(chalk.red('\n  Invalid command. Please use one of the following:'));
    program.outputHelp();
  });

program.parse(process.argv);