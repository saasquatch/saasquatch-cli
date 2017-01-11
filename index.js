#!/usr/bin/env node
'use strict';

var program = require('commander');
var chalk   = require('chalk');

var publishCommand = require('./commands/publish');
var version = require('./package.json').version;

program
  .version(version);

publishCommand(program);

program
  .command('*')
  .description('Prints help')
  .action(function () {
    console.error(chalk.red('\n  Invalid command. Please use one of the following:'));
    program.outputHelp();
  });

program.parse(process.argv);
