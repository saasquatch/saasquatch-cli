'use strict';

// TODO: Remove gulp dependency (ex. include and use `less` instead of `gulp-less`)
var
  // gulp       = require('gulp'),
  // gutil      = require('gulp-util'),
  // rename     = require('gulp-rename'),
  // replace    = require('gulp-replace'),
  // less       = require('gulp-less'),
  // handlebars = require('gulp-compile-handlebars'),
  connect    = require('gulp-connect');
  // open       = require('gulp-open');

var
  command,
  cwd;

cwd = process.cwd();

command = function(program) {
  var serve;

  serve = program.command('serve');

  serve
    .description('Start a server for a theme')
    .action(function() {
      connect.server({
        root: process.cwd(),
        livereload: true,
        host: '0.0.0.0'
      });
    });

  return serve;
};

module.exports = command;
