(function() {
  var Pioneer, color, configBuilder, cucumber, fs, minimist, moment, path, scaffoldBuilder;

  moment = require('moment');

  fs = require('fs');

  path = require('path');

  minimist = require('minimist');

  configBuilder = require('./config_builder');

  scaffoldBuilder = require('./scaffold_builder');

  color = require('colors');

  cucumber = require('cucumber');

  Pioneer = (function() {
    function Pioneer(libPath) {
      var args, configPath, p;
      args = minimist(process.argv.slice(2));
      process.argv = [];
      if (this.isVersionRequested(args)) {
        console.log(require('../package').version);
        return;
      }
      if (args.configPath && fs.existsSync(args.configPath)) {
        configPath = args.configPath;
      } else if (args.scaffold) {
        scaffoldBuilder.createScaffold();
      } else {
        p = path.join(process.cwd(), '/pioneer.json');
        if (fs.existsSync(p)) {
          configPath = p;
        } else {
          configPath = null;
        }
      }
      if (configPath) {
        console.log(('Configuration loaded from ' + configPath + '\n').yellow.inverse);
      } else {
        console.log('No configuration path specified.\n'.yellow.inverse);
      }
      this.getSpecifications(configPath, libPath, args);
    }

    Pioneer.prototype.getSpecifications = function(path, libPath, args) {
      var obj;
      obj = {};
      if (path) {
        return fs.readFile(path, 'utf8', (function(_this) {
          return function(err, data) {
            var object;
            if (err) {
              throw err;
            }
            object = _this.parseAndValidateJSON(data, path);
            return _this.applySpecifications(object, libPath, args);
          };
        })(this));
      } else {
        return this.applySpecifications(obj, libPath, args);
      }
    };

    Pioneer.prototype.applySpecifications = function(obj, libPath, args) {
      var opts;
      opts = configBuilder.generateOptions(args, obj, libPath);
      if (opts) {
        return this.start(opts);
      }
    };

    Pioneer.prototype.start = function(opts) {
      var timeStart;
      timeStart = new Date().getTime();
      require('./environment')();
      return cucumber.Cli(opts).run(function(success) {
        var testTime;
        testTime = moment.duration(new Date().getTime() - timeStart)._data;
        console.log("Duration " + "(" + testTime.minutes + "m:" + testTime.seconds + "s:" + testTime.milliseconds + "ms)");
        return process.exit(success ? 0 : 1);
      });
    };

    Pioneer.prototype.parseAndValidateJSON = function(config, path) {
      var err;
      try {
        return JSON.parse(config);
      } catch (_error) {
        err = _error;
        throw new Error(path + " does not include a valid JSON object.\n");
      }
    };

    Pioneer.prototype.isVersionRequested = function(args) {
      return args.version || args.v;
    };

    return Pioneer;

  })();

  module.exports = Pioneer;

}).call(this);
