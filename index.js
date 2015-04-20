#!/usr/bin/env node
'use strict';

var
  program = require('commander'),
  chalk   = require('chalk'),

  publishCommand = require('./commands/publish'),
  serveCommand   = require('./commands/serve');

program
  .version('1.0.0');

publishCommand(program);
serveCommand(program);

program
  .command('*')
  .description('Prints help')
  .action(function() {
    console.error(chalk.red('\n  Invalid command. Please use one of the following:'));
    program.outputHelp();
  });

program.parse(process.argv);
