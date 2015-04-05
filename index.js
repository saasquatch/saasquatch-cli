#!/usr/bin/env node
'use strict';

var
  program = require('commander'),
  chalk   = require('chalk');

program
  .version('1.0.0');

var
  publish = require('./commands/publish')(program),
  serve   = require('./commands/serve')(program);

program
  .command('*')
  .description('Prints help')
  .action(function(options) {
    console.error(chalk.red('\n  Invalid command. Please use one of the following:'));
    program.outputHelp();
  });

program.parse(process.argv);
