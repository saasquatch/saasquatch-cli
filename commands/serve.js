'use strict';

var
  fs = require('fs'),

  extend     = require('extend'),
  defaults   = require('json-schema-defaults'),
  chalk      = require('chalk'),
  chokidar   = require('chokidar'),
  open       = require('open'),
  equal      = require('deep-equal'),
  express    = require('express'),
  cors       = require('cors'),
  bodyParser = require('body-parser'),

  // TODO: Remove gulp dependencies (ex. include and use `less` instead of `gulp-less`, remove `gulp`, etc)
  gulp       = require('gulp'),
  rename     = require('gulp-rename'),
  less       = require('gulp-less'),
  handlebars = require('gulp-compile-handlebars'),
  connect    = require('gulp-connect'),

  helpers = require('../lib/handlebars-helpers.js');

var
  cwd,
  readCustomerConfig,
  html,
  css,
  js,
  hbs,
  server,
  apiServer,
  watch,
  openUrl,
  alphaMessage,
  command;

cwd = process.cwd();

readCustomerConfig = function () {
  var path = './customer.json';

  if (!fs.existsSync(path)) {
    console.log(chalk.red('customer.json not found in current directory!'));
    process.exit(1);
  }

  return JSON.parse(fs.readFileSync(path, 'utf-8'));
};

html = function () {
  gulp.src('*.html')
    .pipe(connect.reload());
};

css = function () {
  gulp.src('assets/css/widget.less')
    .pipe(
      less()
    ).on('error', function (err) {
      console.log(chalk.red(err.message));
      this.emit('end');
    })
    .pipe(gulp.dest('assets/css'))
    .pipe(connect.reload());
};

js = function (path) {
  gulp.src(path)
    .pipe(connect.reload());
};

hbs = function () {
  var
    messagesPath,
    templateData,
    messagesSchema,
    messages,
    options;

  messagesPath = './variables.json';

  templateData = readCustomerConfig();

  if (fs.existsSync(messagesPath)) {
    messagesSchema = JSON.parse(fs.readFileSync(messagesPath));
    messages = {
      variablesSchema: messagesSchema,
      variables: defaults(messagesSchema)
    };

    templateData = extend(templateData, messages);
  }

  options = {
    helpers: helpers,
    batch: ['templates']
  };

  gulp.src('templates/widget.hbs')
    .pipe(handlebars(templateData, options))
    .pipe(rename('index.html'))
    .pipe(gulp.dest(''));
};

watch = function () {
  chokidar.watch('*.html').on('change', html);
  chokidar.watch('assets/css/**/*.less').on('change', css);
  chokidar.watch('assets/javascript/**/*.js').on('change', js);
  chokidar.watch(['*.json', 'templates/**/*.hbs']).on('change', hbs);
};

server = function (livereload) {
  connect.server({
    root: process.cwd(),
    livereload: livereload,
    host: process.env.IP || '0.0.0.0',
    port: process.env.PORT || '8080'
  });
};

apiServer = function () {
  var configPath = './api.json';

  if (!fs.existsSync(configPath)) { return false; }

  var
    app            = express(),
    config         = JSON.parse(fs.readFileSync(configPath)),
    customerConfig = readCustomerConfig(),
    endpoint       = {};

  app.use(cors());
  app.use(bodyParser.json());

  if (customerConfig.apiEndpoint) {
    var hostAndPort = customerConfig.apiEndpoint.match(/https?:\/\/([^:/]+):([^/]+)/);
    endpoint.host = hostAndPort[1];
    endpoint.port = hostAndPort[2];
  }

  app.post('/', function (req, res) {
    var response;

    config.exchanges.forEach(function (exchange) {
      if (equal(req.body, exchange.request)) {
        response = exchange.response;
      }
    });

    res.send(response || config.defaultResponse);
  });

  // TODO: Add live reloading
  var server = app.listen(
    endpoint.port || 8090,
    endpoint.host || '0.0.0.0',
    function () {
      var host = server.address().address;
      var port = server.address().port;
      console.log('API listening at http://%s:%s', host, port);
    }
  );
};

openUrl = function () {
  var host = process.env.IP || '0.0.0.0';
  var port = process.env.PORT || '8080';
  open('http://' + host + ':' + port);
};

alphaMessage = function () {
  console.log(chalk.yellow('The serve command is alpha and is not a perfect replica of the live environment.\nMore details: https://github.com/saasquatch/saasquatch-cli/#why-is-this-alpha'));
};

command = function (program) {
  var serve;

  serve = program.command('serve');

  var toBoolean = function (string){
  	switch(string.toLowerCase()){
  		case 'true': case 'yes': case '1': return true;
  		case 'false': case 'no': case '0': return false;
  		default: return null;
  	}
  };

  serve
    .description('[alpha] Start a server for a theme')
    .option('--livereload [livereload]', 'Enable the LiveReload plugin. Default to true', toBoolean, true)
    .action(function (options) {
      alphaMessage();
      server(options.livereload);
      apiServer();
      hbs();
      css();
      watch();
      openUrl();
    });

  return serve;
};

module.exports = command;
