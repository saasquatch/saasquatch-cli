#!/usr/bin/env node
"use strict";

require("babel-polyfill");

var _commander = require("commander");

var _commander2 = _interopRequireDefault(_commander);

var _chalk = require("chalk");

var _chalk2 = _interopRequireDefault(_chalk);

var _readline = require("readline");

var _readline2 = _interopRequireDefault(_readline);

var _publish = require("./commands/publish");

var _publish2 = _interopRequireDefault(_publish);

var _package = require("../package.json");

var _upload = require("./commands/upload");

var _upload2 = _interopRequireDefault(_upload);

var _download = require("./commands/download");

var _download2 = _interopRequireDefault(_download);

var _logout = require("./commands/logout");

var _logout2 = _interopRequireDefault(_logout);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Allows for interactive keyboard stuff with Ink
_readline2.default.emitKeypressEvents(process.stdin);
// Polyfill for Async/Await and other features in older Node versionss

process.stdin.setRawMode(true);

_commander2.default.version(_package.version);

(0, _publish2.default)(_commander2.default);
(0, _upload2.default)(_commander2.default);
(0, _download2.default)(_commander2.default);
(0, _logout2.default)(_commander2.default);

_commander2.default.command("*").description("Prints help").action(function () {
  console.error(_chalk2.default.red("\n  Invalid command. Please use one of the following:"));
  _commander2.default.outputHelp();
});

_commander2.default.parse(process.argv);