'use strict';

var
  extend     = require('extend'),
  handlebars = require('handlebars'),
  mathjs     = require('mathjs'),
  sprintf    = require('sprintf-js').sprintf;

module.exports = {
  assets: function (filepath) {
    return '/assets/' + filepath;
  },

  block: function (name, options) {
    var context = extend(this, options.hash);
    return options.fn(context);
  },

  color: function (string) {
    if (string.match(/^#[0-9a-f]{3,6}$/)) {
      return string;
    }
  },

  format: function (string, args) {
    var
      regExp,
      value;

    args = args.hash;

    for (var key in args) {
      regExp = new RegExp('%\{' + key + '\}');
      value = args[key];
      string = string.replace(regExp, value);
    }

    return string;
  },

  gravatar: function (email, args) {
    var defaultGravatar = 'blank',
        forceDefault    = '';

    if (args.hash) {
      if (args.hash.default) {
        defaultGravatar = args.hash.default;
      }

      if (args.hash.forceDefault) {
        forceDefault = '&f=y';
      }
    }
    return 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d51?d=' + defaultGravatar + forceDefault;
  },

  ifInRange: function (val1, min, max, options) {
    var fn;

    fn = val1 >= min && val1 <= max ? 'fn' : 'inverse';

    return options[fn](this);
  },

  lower: function (string) {
    return string.toLowerCase();
  },

  math: function (val1, val2, val3, val4, val5, val6) {
    var toBeEvaled = '',
        vals = {
          val1: val1,
          val2: val2,
          val3: val3,
          val4: val4,
          val5: val5,
          val6: val6
        },
        currentVal;

    for (var i = 1; i < 7; i++) {
      currentVal = vals['val' + i];

      if (currentVal !== undefined && typeof currentVal !== 'object') {
        toBeEvaled += currentVal;
      }
    }

    return mathjs.eval(toBeEvaled);
  },

  stringFormat: function () {
    arguments[0] = arguments[0].replace(/%n/g, '\n');
    return sprintf.apply(this, arguments);
  },

  times: function (n, block) {
    var string = '';
    for (var i = 0; i < n; ++i) {
      string += block.fn(i);
    }
    return string;
  },

  urlencode: function (url) {
    return url;
  },

  variables: function (variablePath) {
    if (!this.variables) { return ''; }

    var followPath = function(oldVal, newVal) {
      return oldVal[newVal];
    };

    var themeVariable = variablePath.split('.').reduce(followPath, this.variables);

    var themeVariableTemplate = handlebars.compile(themeVariable);

    return themeVariableTemplate(this);
  }
};
