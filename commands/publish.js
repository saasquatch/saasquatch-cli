var
  chalk   = require('chalk'),
  request = require('request');

module.exports = function(program) {
  var publish;

  publish = program.command('publish');

  publish
    .description('Publish a theme')
    .option('-t, --tenant [tenant]', 'required - which tenant to use')
    .option('-k, --apiKey [apiKey]', 'required - which API key to use (for corresponding tenant)')
    .action(function(options) {
      var
        tenant = options.tenant,
        apiKey = options.apiKey;

      // Validates inputs
      if (!options || !apiKey) {
        console.log(chalk.yellow('\n  Missing parameter. Both tenant and API key need to be specified to publish:'));
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

  return publish;
};
