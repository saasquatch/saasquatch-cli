#!/usr/bin/env node
'use strict';

var
  program = require('commander'),
  chalk   = require('chalk'),
  request = require('request');

// TODO: Remove gulp dependency (ex. include and use `less` instead of `gulp-less`)
var gulp       = require('gulp'),
    gutil      = require('gulp-util'),
    rename     = require('gulp-rename'),
    replace    = require('gulp-replace'),
    less       = require('gulp-less'),
    handlebars = require('gulp-compile-handlebars'),
    connect    = require('gulp-connect'),
    open       = require('gulp-open');

program
  .version('1.0.0');

var
  publish = program.command('publish'),
  serve   = program.command('serve');

publish.description('Triggers a publish of the theme. Pulls the HEAD of the configured Git repository')
  .option('-t, --tenant [tenant]', 'REQUIRED - which tenant to use')
  .option('-k, --apiKey [apiKey]', 'REQUIRED - which apiKey to use (for corresponding tenant)')
  .action(function(options) {
    var
      tenant = options.tenant,
      apiKey = options.apiKey;

    // Validates inputs
    if (!options || !apiKey) {
      console.log(chalk.yellow('\n  INVALID INPUT - Tenant and Apikey both need to be specific to publish'));
      publish.outputHelp();
      return;
    }

    var magicConstants = {
      completedMsg          : 'PUBLISH COMPLETED',
      errorMsgPrefix        : 'ERROR',
      themeStatusSuccessCode: 200,
      deploySuccessCode     : 202,
      pollingInterval       : 500
    };

    console.log('Publishing theme for %s with key %s', chalk.blue(tenant), chalk.blue(apiKey));

    // HTTP Basic Auth
    var auth = apiKey + ':' + apiKey + '@';

    // Gets the theme status log, outputting each logItem to `cb`
    // TODO: Rewrite to promises instead of callbacks, use less callbacks
    var getStatus = function(cb, doneCb) {
      request({
        uri: 'https://' + auth + 'app.referralsaasquatch.com/api/v1/' + tenant + '/theme/publish_status',
        method: 'GET'
      }, function(error, response, body) {
        if (error) {
          console.log('Unhandled error polling publish status', error);
          return;
        }

        if (response.statusCode !== magicConstants.themeStatusSuccessCode) {
          console.log('Unhandled HTTP response polling publish status', response);
          return;
        }

        var data = JSON.parse(body);

        for (var line = data.log.length; line > 0; --line) {
          var logItem = data.log[line];

          if (logItem) {
            cb(logItem);
          }
        }

        if (doneCb) {
          doneCb();
        }
      });
    };

    // Recursively watched
    var watchStatusLog = function(sinceTime) {
      var thisLoopLatest = null;
      var lastMsg = '';

      getStatus(function(logItem) {
        if (logItem.timestamp > sinceTime) {
          lastMsg        = logItem.message;
          thisLoopLatest = logItem.timestamp;

          if (logItem.message === magicConstants.completedMsg) {
            console.log(chalk.green(logItem.message));
          } else {
            console.log(logItem.message);
          }
        }
      }, function() {
        if (lastMsg === magicConstants.completedMsg) {
          return; // Quit with success
        } else if (lastMsg.indexOf(magicConstants.errorMsgPrefix) === 0) {
          return; // Quit with Error
        } else {
          var newSinceTime = thisLoopLatest ? thisLoopLatest : sinceTime;

          // NOTE -- This is recursion
          setTimeout(function(){ watchStatusLog(newSinceTime); }, magicConstants.pollingInterval);
        }
      });
    };

    var previousDeployTime = 0;

    getStatus(function(logItem) {
      if (logItem.timestamp > previousDeployTime) {
        previousDeployTime = logItem.timestamp;
      }
    }, function() {
      request({
        uri: 'https://' + auth + 'app.referralsaasquatch.com/api/v1/' + tenant + '/theme/publish',
        method: 'POST',
        json: {}
      }, function(error, response, body) {
        if (error) {
          console.log('Unhandled error publishing theme', error);
          return;
        }

        if (response.statusCode !== magicConstants.deploySuccessCode){
          console.log('Unhandled HTTP response to publishing theme', response);
          return;
        }

        // Triggers log polling since `previousDeployTime`
        watchStatusLog(previousDeployTime + 1);
      });
    });
  });

serve.description('Starts a server for a theme, with Less and Handlebars compilation and live reloading.')
  .action(function(options) {
    connect.server({
      root: __dirname,
      livereload: true,
      host: '0.0.0.0'
    });
  });


program
  .command('*')
  .description('Prints help')
  .action(function(options) {
    console.error('Choose a valid command like `publish`');
    program.outputHelp();
  });

program.parse(process.argv);
