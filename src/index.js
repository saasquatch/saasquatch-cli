#!/usr/bin/env node
// Polyfill for Async/Await and other features in older Node versionss
import "babel-polyfill";
import program from "commander";
import chalk from "chalk";
import readline from "readline";
import dotenv from 'dotenv';
import publishCommand from "./commands/publish";

import { version } from "../package.json";
import uploadCommand from "./commands/upload";
import downloadCommand from "./commands/download";
import setupCommand from "./commands/setup";

// Allows for interactive keyboard stuff with Ink
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

program.version(version);
dotenv.config();

setupCommand(program);
publishCommand(program);
uploadCommand(program);
downloadCommand(program);

program
  .command("*")
  .description("Prints help")
  .action(function() {
    console.error(
      chalk.red("\n  Invalid command. Please use one of the following:")
    );
    program.outputHelp();
  });

program.parse(process.argv);
