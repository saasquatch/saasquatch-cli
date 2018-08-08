'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fileIO = require('../utils/fileIO');

exports.default = program => {
  let setup = program.command('setup');

  setup.description('setup env').action(options => {
    (0, _fileIO.createEnvFile)();
  });
  return setup;
};