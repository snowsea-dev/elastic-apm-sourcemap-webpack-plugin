"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var R = _interopRequireWildcard(require("ramda"));

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _formData = _interopRequireDefault(require("form-data"));

var _webpackLog = _interopRequireDefault(require("webpack-log"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ElasticAPMSourceMapPlugin = /*#__PURE__*/function () {
  function ElasticAPMSourceMapPlugin(config) {
    _classCallCheck(this, ElasticAPMSourceMapPlugin);

    this.config = Object.assign({
      logLevel: 'warn',
      ignoreErrors: false
    }, config);
    this.logger = (0, _webpackLog["default"])({
      name: 'ElasticAPMSourceMapPlugin',
      level: this.config.logLevel
    });
  }

  _createClass(ElasticAPMSourceMapPlugin, [{
    key: "emit",
    value: function emit(compilation, callback) {
      var _this = this;

      var logger = this.logger;
      logger.debug("starting uploading sourcemaps with configs: ".concat(JSON.stringify(this.config), "."));

      var _compilation$getStats = compilation.getStats().toJson(),
          _compilation$getStats2 = _compilation$getStats.chunks,
          chunks = _compilation$getStats2 === void 0 ? [] : _compilation$getStats2;

      return R.compose(function (promises) {
        return Promise.all(promises).then(function () {
          logger.debug('finished uploading sourcemaps.');
          callback();
        })["catch"](function (err) {
          logger.error(err);

          if (_this.config.ignoreErrors) {
            callback();
          } else {
            callback(err);
          }
        });
      }, R.map(function (_ref) {
        var sourceFile = _ref.sourceFile,
            sourceMap = _ref.sourceMap;

        /* istanbul ignore next */
        if (!sourceFile || !sourceMap) {
          // It is impossible for Wepback to run into here.
          logger.debug('there is no .js files to be uploaded.');
          return Promise.resolve();
        }

        var formData = new _formData["default"]();
        var bundleFilePath = "".concat(_this.config.publicPath, "/").concat(sourceFile);
        formData.append('sourcemap', compilation.assets[sourceMap].source(), {
          filename: sourceMap,
          contentType: 'application/json'
        });
        formData.append('service_version', _this.config.serviceVersion);
        formData.append('bundle_filepath', bundleFilePath);
        formData.append('service_name', _this.config.serviceName);
        var headers = {};

        if (_this.config.secret) {
          headers.Authorization = "Bearer ".concat(_this.config.secret);
        }

        if (_this.config.apiKey) {
          headers.Authorization = "ApiKey ".concat(_this.config.apiKey);
        }

        logger.debug("uploading ".concat(sourceMap, " to Elastic APM with bundle_filepath: ").concat(bundleFilePath, "."));
        return (0, _nodeFetch["default"])(_this.config.serverURL, {
          method: 'POST',
          body: formData,
          headers: headers
        }).then(function (response) {
          return Promise.all([response.ok, response.text()]);
        }).then(function (_ref2) {
          var _ref3 = _slicedToArray(_ref2, 2),
              ok = _ref3[0],
              responseText = _ref3[1];

          if (ok) {
            logger.debug("uploaded ".concat(sourceMap, "."));
          } else {
            logger.error("APM server response: ".concat(responseText));
            throw new Error("error while uploading ".concat(sourceMap, " to Elastic APM"));
          }
        });
      }), R.map(function (chunk) {
        var files = chunk.files,
            auxiliaryFiles = chunk.auxiliaryFiles;
        var sourceFile = R.find(R.test(/\.js$/), files || []); // Webpack 4 uses `files` and does not have `auxiliaryFiles`. The following line
        // is allowed to work in both Webpack 4 and 5.

        var sourceMap = R.find(R.test(/\.js\.map$/), auxiliaryFiles || files || []);
        return {
          sourceFile: sourceFile,
          sourceMap: sourceMap
        };
      }))(chunks);
    }
  }, {
    key: "apply",
    value: function apply(compiler) {
      var _this2 = this;

      /* istanbul ignore else */
      if (compiler.hooks) {
        // webpack 5
        compiler.hooks.emit.tapAsync('ElasticAPMSourceMapPlugin', function (compilation, callback) {
          return _this2.emit(compilation, callback);
        }); // We only run tests against Webpack 5 currently.

        /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
        // @ts-expect-error
      } else if (compiler.plugin) {
        // Webpack 4

        /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
        // @ts-expect-error
        compiler.plugin('emit', function (compilation, callback) {
          return _this2.emit(compilation, callback);
        });
      } else {
        this.logger.error("does not compatible with the current Webpack version");
      }
    }
  }]);

  return ElasticAPMSourceMapPlugin;
}();

exports["default"] = ElasticAPMSourceMapPlugin;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9lbGFzdGljLWFwbS1zb3VyY2VtYXAtd2VicGFjay1wbHVnaW4udHMiXSwibmFtZXMiOlsiRWxhc3RpY0FQTVNvdXJjZU1hcFBsdWdpbiIsImNvbmZpZyIsIk9iamVjdCIsImFzc2lnbiIsImxvZ0xldmVsIiwiaWdub3JlRXJyb3JzIiwibG9nZ2VyIiwibmFtZSIsImxldmVsIiwiY29tcGlsYXRpb24iLCJjYWxsYmFjayIsImRlYnVnIiwiSlNPTiIsInN0cmluZ2lmeSIsImdldFN0YXRzIiwidG9Kc29uIiwiY2h1bmtzIiwiUiIsImNvbXBvc2UiLCJwcm9taXNlcyIsIlByb21pc2UiLCJhbGwiLCJ0aGVuIiwiZXJyIiwiZXJyb3IiLCJtYXAiLCJzb3VyY2VGaWxlIiwic291cmNlTWFwIiwicmVzb2x2ZSIsImZvcm1EYXRhIiwiRm9ybURhdGEiLCJidW5kbGVGaWxlUGF0aCIsInB1YmxpY1BhdGgiLCJhcHBlbmQiLCJhc3NldHMiLCJzb3VyY2UiLCJmaWxlbmFtZSIsImNvbnRlbnRUeXBlIiwic2VydmljZVZlcnNpb24iLCJzZXJ2aWNlTmFtZSIsImhlYWRlcnMiLCJzZWNyZXQiLCJBdXRob3JpemF0aW9uIiwiYXBpS2V5Iiwic2VydmVyVVJMIiwibWV0aG9kIiwiYm9keSIsInJlc3BvbnNlIiwib2siLCJ0ZXh0IiwicmVzcG9uc2VUZXh0IiwiRXJyb3IiLCJjaHVuayIsImZpbGVzIiwiYXV4aWxpYXJ5RmlsZXMiLCJmaW5kIiwidGVzdCIsImNvbXBpbGVyIiwiaG9va3MiLCJlbWl0IiwidGFwQXN5bmMiLCJwbHVnaW4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQWlCcUJBLHlCO0FBR25CLHFDQUFZQyxNQUFaLEVBQTRCO0FBQUE7O0FBQzFCLFNBQUtBLE1BQUwsR0FBY0MsTUFBTSxDQUFDQyxNQUFQLENBQ1o7QUFDRUMsTUFBQUEsUUFBUSxFQUFFLE1BRFo7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Q0FBUCxFQUE2QkYsY0FBYyxJQUFJRCxLQUFsQixJQUEyQixFQUF4RCxDQUFsQjtBQUVBLGVBQU87QUFBRTNCLFVBQUFBLFVBQVUsRUFBVkEsVUFBRjtBQUFjQyxVQUFBQSxTQUFTLEVBQVRBO0FBQWQsU0FBUDtBQUNELE9BVEQsQ0EvREssRUF5RUxYLE1BekVLLENBQVA7QUEwRUQ7OztXQUVELGVBQU15QyxRQUFOLEVBQXdDO0FBQUE7O0FBRXRDO0FBQ0EsVUFBSUEsUUFBUSxDQUFDQyxLQUFiLEVBQW9CO0FBQ2xCO0FBQ0FELFFBQUFBLFFBQVEsQ0FBQ0MsS0FBVCxDQUFlQyxJQUFmLENBQW9CQyxRQUFwQixDQUE2QiwyQkFBN0IsRUFBMEQsVUFBQ25ELFdBQUQsRUFBY0MsUUFBZDtBQUFBLGlCQUN4RCxNQUFJLENBQUNpRCxJQUFMLENBQVVsRCxXQUFWLEVBQXVCQyxRQUF2QixDQUR3RDtBQUFBLFNBQTFELEVBRmtCLENBS3BCOztBQUNBO0FBQ0E7QUFDQyxPQVJELE1BUU8sSUFBSStDLFFBQVEsQ0FBQ0ksTUFBYixFQUFxQjtBQUMxQjs7QUFDQTtBQUNBO0FBQ0FKLFFBQUFBLFFBQVEsQ0FBQ0ksTUFBVCxDQUFnQixNQUFoQixFQUF3QixVQUFDcEQsV0FBRCxFQUFjQyxRQUFkO0FBQUEsaUJBQ3RCLE1BQUksQ0FBQ2lELElBQUwsQ0FBVWxELFdBQVYsRUFBdUJDLFFBQXZCLENBRHNCO0FBQUEsU0FBeEI7QUFHRCxPQVBNLE1BT0E7QUFDTCxhQUFLSixNQUFMLENBQVlrQixLQUFaO0FBQ0Q7QUFDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFIgZnJvbSAncmFtZGEnO1xuaW1wb3J0IGZldGNoIGZyb20gJ25vZGUtZmV0Y2gnO1xuaW1wb3J0IEZvcm1EYXRhIGZyb20gJ2Zvcm0tZGF0YSc7XG5pbXBvcnQgd2VicGFjaywgeyBTdGF0c0NodW5rLCBXZWJwYWNrUGx1Z2luSW5zdGFuY2UgfSBmcm9tICd3ZWJwYWNrJztcbmltcG9ydCB3ZWJwYWNrTG9nLCB7IExldmVsLCBMb2dnZXIgfSBmcm9tICd3ZWJwYWNrLWxvZyc7XG5pbnRlcmZhY2UgU291cmNlIHtcbiAgc291cmNlRmlsZT86IHN0cmluZztcbiAgc291cmNlTWFwPzogc3RyaW5nO1xufVxudHlwZSBVcGxvYWRUYXNrID0gUHJvbWlzZTx2b2lkPjtcblxuZXhwb3J0IGludGVyZmFjZSBDb25maWcge1xuICBzZXJ2aWNlTmFtZTogc3RyaW5nO1xuICBzZXJ2aWNlVmVyc2lvbjogc3RyaW5nO1xuICBwdWJsaWNQYXRoOiBzdHJpbmc7XG4gIHNlcnZlclVSTDogc3RyaW5nO1xuICBzZWNyZXQ/OiBzdHJpbmc7XG4gIGFwaUtleT86IHN0cmluZztcbiAgbG9nTGV2ZWw/OiBMZXZlbDtcbiAgaWdub3JlRXJyb3JzPzogYm9vbGVhbjtcbn1cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVsYXN0aWNBUE1Tb3VyY2VNYXBQbHVnaW4gaW1wbGVtZW50cyBXZWJwYWNrUGx1Z2luSW5zdGFuY2Uge1xuICBjb25maWc6IENvbmZpZztcbiAgbG9nZ2VyOiBMb2dnZXI7XG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogQ29uZmlnKSB7XG4gICAgdGhpcy5jb25maWcgPSBPYmplY3QuYXNzaWduKFxuICAgICAge1xuICAgICAgICBsb2dMZXZlbDogJ3dhcm4nLFxuICAgICAgICBpZ25vcmVFcnJvcnM6IGZhbHNlXG4gICAgICB9LFxuICAgICAgY29uZmlnXG4gICAgKTtcbiAgICB0aGlzLmxvZ2dlciA9IHdlYnBhY2tMb2coe1xuICAgICAgbmFtZTogJ0VsYXN0aWNBUE1Tb3VyY2VNYXBQbHVnaW4nLFxuICAgICAgbGV2ZWw6IHRoaXMuY29uZmlnLmxvZ0xldmVsXG4gICAgfSk7XG4gIH1cblxuICBlbWl0KFxuICAgIGNvbXBpbGF0aW9uOiB3ZWJwYWNrLkNvbXBpbGF0aW9uLFxuICAgIGNhbGxiYWNrOiAoZXJyb3I/OiBFcnJvcikgPT4gdm9pZFxuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBsb2dnZXIgPSB0aGlzLmxvZ2dlcjtcblxuICAgIGxvZ2dlci5kZWJ1Zyhgc3RhcnRpbmcgdXBsb2FkaW5nIHNvdXJjZW1hcHMgd2l0aCBjb25maWdzOiAke0pTT04uc3RyaW5naWZ5KHRoaXMuY29uZmlnKX0uYCk7XG5cbiAgICBjb25zdCB7IGNodW5rcyA9IFtdIH0gPSBjb21waWxhdGlvbi5nZXRTdGF0cygpLnRvSnNvbigpO1xuXG4gICAgcmV0dXJuIFIuY29tcG9zZTxTdGF0c0NodW5rW10sIFNvdXJjZVtdLCBVcGxvYWRUYXNrW10sIFByb21pc2U8dm9pZD4+KFxuICAgICAgKHByb21pc2VzOiBBcnJheTxQcm9taXNlPHZvaWQ+PikgPT5cbiAgICAgICAgUHJvbWlzZS5hbGwocHJvbWlzZXMpXG4gICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKCdmaW5pc2hlZCB1cGxvYWRpbmcgc291cmNlbWFwcy4nKTtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlcnIpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5jb25maWcuaWdub3JlRXJyb3JzKSB7XG4gICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pLFxuICAgICAgUi5tYXAoKHsgc291cmNlRmlsZSwgc291cmNlTWFwIH0pID0+IHtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgaWYgKCFzb3VyY2VGaWxlIHx8ICFzb3VyY2VNYXApIHtcbiAgICAgICAgICAvLyBJdCBpcyBpbXBvc3NpYmxlIGZvciBXZXBiYWNrIHRvIHJ1biBpbnRvIGhlcmUuXG4gICAgICAgICAgbG9nZ2VyLmRlYnVnKCd0aGVyZSBpcyBubyAuanMgZmlsZXMgdG8gYmUgdXBsb2FkZWQuJyk7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcbiAgICAgICAgY29uc3QgYnVuZGxlRmlsZVBhdGggPSBgJHt0aGlzLmNvbmZpZy5wdWJsaWNQYXRofS8ke3NvdXJjZUZpbGV9YDtcblxuICAgICAgICBmb3JtRGF0YS5hcHBlbmQoJ3NvdXJjZW1hcCcsIGNvbXBpbGF0aW9uLmFzc2V0c1tzb3VyY2VNYXBdLnNvdXJjZSgpLCB7XG4gICAgICAgICAgZmlsZW5hbWU6IHNvdXJjZU1hcCxcbiAgICAgICAgICBjb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgICAgIH0pO1xuICAgICAgICBmb3JtRGF0YS5hcHBlbmQoJ3NlcnZpY2VfdmVyc2lvbicsIHRoaXMuY29uZmlnLnNlcnZpY2VWZXJzaW9uKTtcbiAgICAgICAgZm9ybURhdGEuYXBwZW5kKCdidW5kbGVfZmlsZXBhdGgnLCBidW5kbGVGaWxlUGF0aCk7XG4gICAgICAgIGZvcm1EYXRhLmFwcGVuZCgnc2VydmljZV9uYW1lJywgdGhpcy5jb25maWcuc2VydmljZU5hbWUpO1xuXG4gICAgICAgIGNvbnN0IGhlYWRlcnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcblxuICAgICAgICBpZiAodGhpcy5jb25maWcuc2VjcmV0KSB7XG4gICAgICAgICAgaGVhZGVycy5BdXRob3JpemF0aW9uID0gYEJlYXJlciAke3RoaXMuY29uZmlnLnNlY3JldH1gO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5hcGlLZXkpIHtcbiAgICAgICAgICBoZWFkZXJzLkF1dGhvcml6YXRpb24gPSBgQXBpS2V5ICR7dGhpcy5jb25maWcuYXBpS2V5fWA7XG4gICAgICAgIH1cblxuICAgICAgICBsb2dnZXIuZGVidWcoXG4gICAgICAgICAgYHVwbG9hZGluZyAke3NvdXJjZU1hcH0gdG8gRWxhc3RpYyBBUE0gd2l0aCBidW5kbGVfZmlsZXBhdGg6ICR7YnVuZGxlRmlsZVBhdGh9LmBcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gZmV0Y2godGhpcy5jb25maWcuc2VydmVyVVJMLCB7XG4gICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgYm9keTogZm9ybURhdGEsXG4gICAgICAgICAgaGVhZGVyczogaGVhZGVyc1xuICAgICAgICB9KVxuICAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IFByb21pc2UuYWxsKFtyZXNwb25zZS5vaywgcmVzcG9uc2UudGV4dCgpXSkpXG4gICAgICAgICAgLnRoZW4oKFtvaywgcmVzcG9uc2VUZXh0XSkgPT4ge1xuICAgICAgICAgICAgaWYgKG9rKSB7XG4gICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhgdXBsb2FkZWQgJHtzb3VyY2VNYXB9LmApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGBBUE0gc2VydmVyIHJlc3BvbnNlOiAke3Jlc3BvbnNlVGV4dH1gKTtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBlcnJvciB3aGlsZSB1cGxvYWRpbmcgJHtzb3VyY2VNYXB9IHRvIEVsYXN0aWMgQVBNYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICB9KSxcbiAgICAgIFIubWFwKChjaHVuaykgPT4ge1xuICAgICAgICBjb25zdCB7IGZpbGVzLCBhdXhpbGlhcnlGaWxlcyB9ID0gY2h1bmtcblxuICAgICAgICBjb25zdCBzb3VyY2VGaWxlID0gUi5maW5kKFIudGVzdCgvXFwuanMkLyksIGZpbGVzIHx8IFtdKTtcbiAgICAgICAgLy8gV2VicGFjayA0IHVzZXMgYGZpbGVzYCBhbmQgZG9lcyBub3QgaGF2ZSBgYXV4aWxpYXJ5RmlsZXNgLiBUaGUgZm9sbG93aW5nIGxpbmVcbiAgICAgICAgLy8gaXMgYWxsb3dlZCB0byB3b3JrIGluIGJvdGggV2VicGFjayA0IGFuZCA1LlxuICAgICAgICBjb25zdCBzb3VyY2VNYXAgPSBSLmZpbmQoUi50ZXN0KC9cXC5qc1xcLm1hcCQvKSwgYXV4aWxpYXJ5RmlsZXMgfHwgZmlsZXMgfHwgW10pO1xuXG4gICAgICAgIHJldHVybiB7IHNvdXJjZUZpbGUsIHNvdXJjZU1hcCB9O1xuICAgICAgfSlcbiAgICApKGNodW5rcyk7XG4gIH1cblxuICBhcHBseShjb21waWxlcjogd2VicGFjay5Db21waWxlcik6IHZvaWQge1xuXG4gICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICBpZiAoY29tcGlsZXIuaG9va3MpIHtcbiAgICAgIC8vIHdlYnBhY2sgNVxuICAgICAgY29tcGlsZXIuaG9va3MuZW1pdC50YXBBc3luYygnRWxhc3RpY0FQTVNvdXJjZU1hcFBsdWdpbicsIChjb21waWxhdGlvbiwgY2FsbGJhY2spID0+XG4gICAgICAgIHRoaXMuZW1pdChjb21waWxhdGlvbiwgY2FsbGJhY2spXG4gICAgICApO1xuICAgIC8vIFdlIG9ubHkgcnVuIHRlc3RzIGFnYWluc3QgV2VicGFjayA1IGN1cnJlbnRseS5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50ICovXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgIH0gZWxzZSBpZiAoY29tcGlsZXIucGx1Z2luKSB7XG4gICAgICAvLyBXZWJwYWNrIDRcbiAgICAgIC8qIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnQgKi9cbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgIGNvbXBpbGVyLnBsdWdpbignZW1pdCcsIChjb21waWxhdGlvbiwgY2FsbGJhY2spID0+XG4gICAgICAgIHRoaXMuZW1pdChjb21waWxhdGlvbiwgY2FsbGJhY2spXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxvZ2dlci5lcnJvcihgZG9lcyBub3QgY29tcGF0aWJsZSB3aXRoIHRoZSBjdXJyZW50IFdlYnBhY2sgdmVyc2lvbmApO1xuICAgIH1cbiAgfVxufVxuIl19