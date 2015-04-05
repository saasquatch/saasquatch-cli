var fs         = require('fs');

var gulp       = require('gulp'),
    gutil      = require('gulp-util'),
    rename     = require('gulp-rename'),
    replace    = require('gulp-replace'),
    less       = require('gulp-less'),
    handlebars = require('gulp-compile-handlebars'),
    connect    = require('gulp-connect'),
    open       = require('gulp-open');

function extend(target) {
  'use strict';
  var sources = [].slice.call(arguments, 1);

  sources.forEach(function(source) {
    for (var prop in source) {
      if (source.hasOwnProperty(prop)) {
        target[prop] = source[prop];
      }
    }
  });

  return target;
}

gulp.task('html', function() {
  return gulp.src('*.html')
    .pipe(connect.reload());
});

gulp.task('less', function() {
  return gulp.src('assets/css/widget.less')
    .pipe(
      less()
    ).on('error', gutil.log)
    .pipe(gulp.dest('assets/css'))
    .pipe(connect.reload());
});

gulp.task('js', function() {
  return gulp.src('assets/javascript/*.js')
    .pipe(connect.reload());
});

gulp.task('hbs', function() {
  var customerData,
      templateData,
      options;

  customerData = JSON.parse(fs.readFileSync('./customer.json', 'utf-8'));

  templateData = extend(customerData, {});

  options = {
    helpers: {
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

      format: function(string, args) {
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
        return 'http://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d51?d=' + defaultGravatar + forceDefault;
      },

      ifInRange: function(val1, min, max, options) {
        var fn;

        fn = val1 >= min && val1 <= max ? 'fn' : 'inverse';

        return options[fn](this);
      },

      lower: function (string) {
        return string.toLowerCase();
      },

      math: function(val1, val2, val3, val4, val5, val6, options) {
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

        return + (eval(toBeEvaled));
      },

      stringFormat: function (string) {
        return string;
      },

      times: function(n, block) {
        var string = '';
        for (var i = 0; i < n; ++i) {
          string += block.fn(i);
        }
        return string;
      },

      urlencode: function (url) {
        return url;
      }
    },
    batch: ['templates']
  };

  return gulp.src('templates/widget.hbs')
    .pipe(handlebars(templateData, options))
    .pipe(rename('index.html'))
    .pipe(gulp.dest(''));
});

gulp.task('watch', ['hbs', 'less'], function() {
  gulp.watch('assets/css/*.less', ['less']);
  gulp.watch('*.html', ['html']);
  gulp.watch('assets/javascript/*.js', ['js']);
  gulp.watch(['*.json', 'templates/*.hbs'], ['hbs']);
});

gulp.task('connect', ['hbs', 'less'], function() {
  connect.server({
    root: __dirname,
    livereload: true,
    host: '0.0.0.0'
  });
});

gulp.task('open', ['hbs', 'less'], function() {
  gulp.src('*.html')
    .pipe(open('', { url: 'http://0.0.0.0:8080' }));
});

gulp.task('serve', ['connect', 'watch', 'open']);
