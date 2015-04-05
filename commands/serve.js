'use strict';

var
  fs = require('fs'),

  chalk    = require('chalk'),
  chokidar = require('chokidar'),
  open     = require('open'),

  // TODO: Remove gulp dependencies (ex. include and use `less` instead of `gulp-less`, remove `gulp`, etc)
  gulp       = require('gulp'),
  rename     = require('gulp-rename'),
  less       = require('gulp-less'),
  handlebars = require('gulp-compile-handlebars'),
  connect    = require('gulp-connect'),

  helpers = require('../lib/handlebars-helpers.js');

var
  cwd,

  html,
  css,
  js,
  hbs,
  server,
  watch,
  openUrl,

  command;


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

js = function() {
  gulp.src('*.js')
    .pipe(connect.reload());
};

hbs = function() {
  var
    templateData,
    options;

  templateData = JSON.parse(fs.readFileSync('./customer.json', 'utf-8'));

  options = {
    helpers: helpers,
    batch: ['templates']
  };

  gulp.src('templates/widget.hbs')
    .pipe(handlebars(templateData, options))
    .pipe(rename('index.html'))
    .pipe(gulp.dest(''));
};

watch = function() {
  chokidar.watch('*.html').on('change', html);
  chokidar.watch('assets/css/*.less').on('change', css);
  chokidar.watch('assets/javascript/*.js').on('change', js);
  chokidar.watch(['*.json', 'templates/*.hbs']).on('change', hbs);
};

server = function() {
  connect.server({
    root: process.cwd(),
    livereload: true,
    host: '0.0.0.0'
  });
};

openUrl = function() {
  open('http://0.0.0.0:8080');
};


command = function(program) {
  var serve;

  serve = program.command('serve');

  serve
    .description('Start a server for a theme')
    .action(function() {
      server();
      hbs();
      css();
      watch();
      openUrl();
    });

  return serve;
};

module.exports = command;
