'use strict';

// TODO: Remove gulp dependencies (ex. include and use `less` instead of `gulp-less`, remove `gulp`, etc)
var
  fs = require('fs'),

  chalk    = require('chalk'),
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
  css,
  command,
  cwd,
  html,
  server,
  watch;

cwd = process.cwd();

html = function() {
  gulp.src('*.html')
    .pipe(connect.reload());
};

css = function() {
  gulp.src('assets/css/widget.less')
    .pipe(
      less()
    ).on('error', function(err) {
      console.log(chalk.red(err.message));
      this.emit('end');
    })
    .pipe(gulp.dest('assets/css'))
    .pipe(connect.reload());
};

watch = function() {
  chokidar.watch('*.html').on('all', html);
  chokidar.watch('assets/css/*.less').on('all', css);
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
      css();
      server();
      watch();
    });

  return serve;
};

module.exports = command;
