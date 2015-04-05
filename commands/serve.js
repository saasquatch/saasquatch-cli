'use strict';

// TODO: Remove gulp dependencies (ex. include and use `less` instead of `gulp-less`, remove `gulp`, etc)
var
  fs = require('fs'),

  chokidar = require('chokidar'),
  extend   = require('extend'),

  gulp       = require('gulp'),
  gutil      = require('gulp-util'),
  rename     = require('gulp-rename'),
  replace    = require('gulp-replace'),
  less       = require('gulp-less'),
  handlebars = require('gulp-compile-handlebars'),
  connect    = require('gulp-connect'),
  open       = require('gulp-open');

var
  command,
  cwd,
  html,
  server,
  watch;

cwd = process.cwd();

html = function() {
  return gulp.src('*.html')
    .pipe(connect.reload());
};

watch = function() {
  chokidar.watch('*.html').on('all', html);
};

server = function() {
  connect.server({
    root: process.cwd(),
    livereload: true,
    host: '0.0.0.0'
  });
};

command = function(program) {
  var serve;

  serve = program.command('serve');

  serve
    .description('Start a server for a theme')
    .action(function() {
      server();
      watch();
    });

  return serve;
};

module.exports = command;
