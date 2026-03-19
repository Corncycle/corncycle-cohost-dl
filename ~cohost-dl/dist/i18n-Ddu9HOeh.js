if (!window.define) {
    const modules = {};
    window.__modules = modules;
    const modulePromises = {};

    const thisScriptSource = document.currentScript.getAttribute('src');
    const srcDir = thisScriptSource.substring(0, thisScriptSource.lastIndexOf('/'));

    const load = (id) => {
        if (modules[id]) return modules[id];
        if (modulePromises[id]) return modulePromises[id];
        return modulePromises[id] = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = srcDir + '/' + id + '.js';
            script.onload = () => modules[id].then(resolve);
            script.onerror = err => reject(new Error('failed to load ' + id));
            script.dataset.id = id;
            document.head.append(script);
        });
    };

    const require = (ids, callback) => {
        Promise.all(ids.map(load)).then(items => {
            if (items.length === 1) callback(items[0]);
            else callback(items);
        });
    };
    window.require = require;

    require.context = (dir, useSubdirs) => {
        if ((dir === "../../images/emoji" || dir === "../images/emoji") && !useSubdirs) {
            const data = {"chunks.png":"f59b84127fa7b6c48b6c.png","eggbug-classic.png":"41454e429d62b5cb7963.png","eggbug.png":"17aa2d48956926005de9.png","sixty.png":"9a6014af31fb1ca65a1f.png","unyeah.png":"5cf84d596a2c422967de.png","yeah.png":"014b0a8cc35206ef151d.png"};
            const f = (n) => data[n];
            f.keys = () => Object.keys(data);
            return f;
        } else if ((dir === "../../images/plus-emoji" || dir === "../images/plus-emoji") && !useSubdirs) {
            const data = {"eggbug-asleep.png":"ebbf360236a95b62bdfc.png","eggbug-devious.png":"c4f3f2c6b9ffb85934e7.png","eggbug-heart-sob.png":"b59709333449a01e3e0a.png","eggbug-nervous.png":"d2753b632211c395538e.png","eggbug-pensive.png":"ae53a8b5de7c919100e6.png","eggbug-pleading.png":"11c5493261064ffa82c0.png","eggbug-relieved.png":"3633c116f0941d94d237.png","eggbug-shocked.png":"b25a9fdf230219087003.png","eggbug-smile-hearts.png":"d7ec7f057e6fb15a94cc.png","eggbug-sob.png":"9559ff8058a895328d76.png","eggbug-tuesday.png":"90058099e741e483208a.png","eggbug-uwu.png":"228d3a13bd5f7796b434.png","eggbug-wink.png":"3bc3a1c5272e2ceb8712.png","host-aww.png":"9bb403f3822c6457baf6.png","host-cry.png":"530f8cf75eac87716702.png","host-evil.png":"cb9a5640d7ef7b361a1a.png","host-frown.png":"99c7fbf98de865cc9726.png","host-joy.png":"53635f5fe850274b1a7d.png","host-love.png":"c45b6d8f9de20f725b98.png","host-nervous.png":"e5d55348f39c65a20148.png","host-plead.png":"fa883e2377fea8945237.png","host-shock.png":"bfa6d6316fd95ae76803.png","host-stare.png":"a09d966cd188c9ebaa4c.png"};
            const f = (n) => data[n];
            f.keys = () => Object.keys(data);
            return f;
        }
        throw new Error('not supported: require.context for ' + dir);
    };

    window.define = (imports, exec) => {
        if (typeof imports === 'function') {
            exec = imports;
            imports = [];
        }
        const id = document.currentScript.dataset.id
            ?? './' + document.currentScript.getAttribute('src').split('/').pop().replace(/\.js$/i, '');
        if (modules[id]) return;
        const exports = {};
        modules[id] = Promise.resolve().then(function() {
            const imported = [];
            for (const id of imports) {
                if (id === 'require') imported.push(Promise.resolve(require));
                else if (id === 'exports') imported.push(Promise.resolve(exports));
                else imported.push(load(id));
            }
            return Promise.all(imported);
        }).then(function(imported) {
            const result = exec.apply(window, imported);
            if (!('default' in exports)) exports.default = result;
            return exports;
        });
    };

    window.process = { env: { NODE_ENV: 'production' } };
}

define(['exports', './post-page'], (function (exports, postPage) { 'use strict';

  function _mergeNamespaces(n, m) {
    m.forEach(function (e) {
      e && typeof e !== 'string' && !Array.isArray(e) && Object.keys(e).forEach(function (k) {
        if (k !== 'default' && !(k in n)) {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function () { return e[k]; }
          });
        }
      });
    });
    return Object.freeze(n);
  }

  const initReactI18next = {
    type: '3rdParty',
    init(instance) {
      postPage.setDefaults(instance.options.react);
      postPage.setI18n(instance);
    }
  };

  function _classCallCheck$1(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties$1(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass$1(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties$1(Constructor.prototype, protoProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  var arr$1 = [];
  var each$1 = arr$1.forEach;
  var slice$1 = arr$1.slice;
  function defaults$1(obj) {
    each$1.call(slice$1.call(arguments, 1), function (source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === undefined) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  }
  function createClassOnDemand(ClassOrObject) {
    if (!ClassOrObject) return null;
    if (typeof ClassOrObject === 'function') return new ClassOrObject();
    return ClassOrObject;
  }

  function getDefaults$2() {
    return {
      handleEmptyResourcesAsFailed: true
    };
  }
  var Backend$1 = /*#__PURE__*/function () {
    function Backend(services) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      _classCallCheck$1(this, Backend);
      this.backends = [];
      this.type = 'backend';
      this.init(services, options);
    }
    _createClass$1(Backend, [{
      key: "init",
      value: function init(services) {
        var _this = this;
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var i18nextOptions = arguments.length > 2 ? arguments[2] : undefined;
        this.services = services;
        this.options = defaults$1(options, this.options || {}, getDefaults$2());
        this.options.backends && this.options.backends.forEach(function (b, i) {
          _this.backends[i] = _this.backends[i] || createClassOnDemand(b);
          _this.backends[i].init(services, _this.options.backendOptions && _this.options.backendOptions[i] || {}, i18nextOptions);
        });
      }
    }, {
      key: "read",
      value: function read(language, namespace, callback) {
        var _this2 = this;
        var bLen = this.backends.length;
        var loadPosition = function loadPosition(pos) {
          if (pos >= bLen) return callback(new Error('non of the backend loaded data;', true)); // failed pass retry flag
          var isLastBackend = pos === bLen - 1;
          var lengthCheckAmount = _this2.options.handleEmptyResourcesAsFailed && !isLastBackend ? 0 : -1;
          var backend = _this2.backends[pos];
          if (backend.read) {
            backend.read(language, namespace, function (err, data) {
              if (!err && data && Object.keys(data).length > lengthCheckAmount) {
                callback(null, data, pos);
                savePosition(pos - 1, data); // save one in front
              } else {
                loadPosition(pos + 1); // try load from next
              }
            });
          } else {
            loadPosition(pos + 1); // try load from next
          }
        };

        var savePosition = function savePosition(pos, data) {
          if (pos < 0) return;
          var backend = _this2.backends[pos];
          if (backend.save) {
            backend.save(language, namespace, data);
            savePosition(pos - 1, data);
          } else {
            savePosition(pos - 1, data);
          }
        };
        loadPosition(0);
      }
    }, {
      key: "create",
      value: function create(languages, namespace, key, fallbackValue, callback, options) {
        this.backends.forEach(function (b) {
          if (b.create) b.create(languages, namespace, key, fallbackValue, null, options);
        });
      }
    }]);
    return Backend;
  }();
  Backend$1.type = 'backend';

  function _typeof$2(obj) { "@babel/helpers - typeof"; return _typeof$2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof$2(obj); }
  var arr = [];
  var each = arr.forEach;
  var slice = arr.slice;
  function defaults(obj) {
    each.call(slice.call(arguments, 1), function (source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === undefined) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  }
  function hasXMLHttpRequest() {
    return typeof XMLHttpRequest === 'function' || (typeof XMLHttpRequest === "undefined" ? "undefined" : _typeof$2(XMLHttpRequest)) === 'object';
  }

  function isPromise(maybePromise) {
    return !!maybePromise && typeof maybePromise.then === 'function';
  }

  function makePromise(maybePromise) {
    if (isPromise(maybePromise)) {
      return maybePromise;
    }
    return Promise.resolve(maybePromise);
  }

  function commonjsRequire(path) {
  	throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
  }

  var getFetch$1 = {exports: {}};

  var browserPonyfill = {exports: {}};

  var hasRequiredBrowserPonyfill;

  function requireBrowserPonyfill () {
  	if (hasRequiredBrowserPonyfill) return browserPonyfill.exports;
  	hasRequiredBrowserPonyfill = 1;
  	(function (module, exports) {
  		var global = typeof self !== 'undefined' ? self : postPage.commonjsGlobal;
  		var __self__ = (function () {
  		function F() {
  		this.fetch = false;
  		this.DOMException = global.DOMException;
  		}
  		F.prototype = global;
  		return new F();
  		})();
  		(function(self) {

  		((function (exports) {

  		  var support = {
  		    searchParams: 'URLSearchParams' in self,
  		    iterable: 'Symbol' in self && 'iterator' in Symbol,
  		    blob:
  		      'FileReader' in self &&
  		      'Blob' in self &&
  		      (function() {
  		        try {
  		          new Blob();
  		          return true
  		        } catch (e) {
  		          return false
  		        }
  		      })(),
  		    formData: 'FormData' in self,
  		    arrayBuffer: 'ArrayBuffer' in self
  		  };

  		  function isDataView(obj) {
  		    return obj && DataView.prototype.isPrototypeOf(obj)
  		  }

  		  if (support.arrayBuffer) {
  		    var viewClasses = [
  		      '[object Int8Array]',
  		      '[object Uint8Array]',
  		      '[object Uint8ClampedArray]',
  		      '[object Int16Array]',
  		      '[object Uint16Array]',
  		      '[object Int32Array]',
  		      '[object Uint32Array]',
  		      '[object Float32Array]',
  		      '[object Float64Array]'
  		    ];

  		    var isArrayBufferView =
  		      ArrayBuffer.isView ||
  		      function(obj) {
  		        return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
  		      };
  		  }

  		  function normalizeName(name) {
  		    if (typeof name !== 'string') {
  		      name = String(name);
  		    }
  		    if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
  		      throw new TypeError('Invalid character in header field name')
  		    }
  		    return name.toLowerCase()
  		  }

  		  function normalizeValue(value) {
  		    if (typeof value !== 'string') {
  		      value = String(value);
  		    }
  		    return value
  		  }

  		  // Build a destructive iterator for the value list
  		  function iteratorFor(items) {
  		    var iterator = {
  		      next: function() {
  		        var value = items.shift();
  		        return {done: value === undefined, value: value}
  		      }
  		    };

  		    if (support.iterable) {
  		      iterator[Symbol.iterator] = function() {
  		        return iterator
  		      };
  		    }

  		    return iterator
  		  }

  		  function Headers(headers) {
  		    this.map = {};

  		    if (headers instanceof Headers) {
  		      headers.forEach(function(value, name) {
  		        this.append(name, value);
  		      }, this);
  		    } else if (Array.isArray(headers)) {
  		      headers.forEach(function(header) {
  		        this.append(header[0], header[1]);
  		      }, this);
  		    } else if (headers) {
  		      Object.getOwnPropertyNames(headers).forEach(function(name) {
  		        this.append(name, headers[name]);
  		      }, this);
  		    }
  		  }

  		  Headers.prototype.append = function(name, value) {
  		    name = normalizeName(name);
  		    value = normalizeValue(value);
  		    var oldValue = this.map[name];
  		    this.map[name] = oldValue ? oldValue + ', ' + value : value;
  		  };

  		  Headers.prototype['delete'] = function(name) {
  		    delete this.map[normalizeName(name)];
  		  };

  		  Headers.prototype.get = function(name) {
  		    name = normalizeName(name);
  		    return this.has(name) ? this.map[name] : null
  		  };

  		  Headers.prototype.has = function(name) {
  		    return this.map.hasOwnProperty(normalizeName(name))
  		  };

  		  Headers.prototype.set = function(name, value) {
  		    this.map[normalizeName(name)] = normalizeValue(value);
  		  };

  		  Headers.prototype.forEach = function(callback, thisArg) {
  		    for (var name in this.map) {
  		      if (this.map.hasOwnProperty(name)) {
  		        callback.call(thisArg, this.map[name], name, this);
  		      }
  		    }
  		  };

  		  Headers.prototype.keys = function() {
  		    var items = [];
  		    this.forEach(function(value, name) {
  		      items.push(name);
  		    });
  		    return iteratorFor(items)
  		  };

  		  Headers.prototype.values = function() {
  		    var items = [];
  		    this.forEach(function(value) {
  		      items.push(value);
  		    });
  		    return iteratorFor(items)
  		  };

  		  Headers.prototype.entries = function() {
  		    var items = [];
  		    this.forEach(function(value, name) {
  		      items.push([name, value]);
  		    });
  		    return iteratorFor(items)
  		  };

  		  if (support.iterable) {
  		    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
  		  }

  		  function consumed(body) {
  		    if (body.bodyUsed) {
  		      return Promise.reject(new TypeError('Already read'))
  		    }
  		    body.bodyUsed = true;
  		  }

  		  function fileReaderReady(reader) {
  		    return new Promise(function(resolve, reject) {
  		      reader.onload = function() {
  		        resolve(reader.result);
  		      };
  		      reader.onerror = function() {
  		        reject(reader.error);
  		      };
  		    })
  		  }

  		  function readBlobAsArrayBuffer(blob) {
  		    var reader = new FileReader();
  		    var promise = fileReaderReady(reader);
  		    reader.readAsArrayBuffer(blob);
  		    return promise
  		  }

  		  function readBlobAsText(blob) {
  		    var reader = new FileReader();
  		    var promise = fileReaderReady(reader);
  		    reader.readAsText(blob);
  		    return promise
  		  }

  		  function readArrayBufferAsText(buf) {
  		    var view = new Uint8Array(buf);
  		    var chars = new Array(view.length);

  		    for (var i = 0; i < view.length; i++) {
  		      chars[i] = String.fromCharCode(view[i]);
  		    }
  		    return chars.join('')
  		  }

  		  function bufferClone(buf) {
  		    if (buf.slice) {
  		      return buf.slice(0)
  		    } else {
  		      var view = new Uint8Array(buf.byteLength);
  		      view.set(new Uint8Array(buf));
  		      return view.buffer
  		    }
  		  }

  		  function Body() {
  		    this.bodyUsed = false;

  		    this._initBody = function(body) {
  		      this._bodyInit = body;
  		      if (!body) {
  		        this._bodyText = '';
  		      } else if (typeof body === 'string') {
  		        this._bodyText = body;
  		      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
  		        this._bodyBlob = body;
  		      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
  		        this._bodyFormData = body;
  		      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
  		        this._bodyText = body.toString();
  		      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
  		        this._bodyArrayBuffer = bufferClone(body.buffer);
  		        // IE 10-11 can't handle a DataView body.
  		        this._bodyInit = new Blob([this._bodyArrayBuffer]);
  		      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
  		        this._bodyArrayBuffer = bufferClone(body);
  		      } else {
  		        this._bodyText = body = Object.prototype.toString.call(body);
  		      }

  		      if (!this.headers.get('content-type')) {
  		        if (typeof body === 'string') {
  		          this.headers.set('content-type', 'text/plain;charset=UTF-8');
  		        } else if (this._bodyBlob && this._bodyBlob.type) {
  		          this.headers.set('content-type', this._bodyBlob.type);
  		        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
  		          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
  		        }
  		      }
  		    };

  		    if (support.blob) {
  		      this.blob = function() {
  		        var rejected = consumed(this);
  		        if (rejected) {
  		          return rejected
  		        }

  		        if (this._bodyBlob) {
  		          return Promise.resolve(this._bodyBlob)
  		        } else if (this._bodyArrayBuffer) {
  		          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
  		        } else if (this._bodyFormData) {
  		          throw new Error('could not read FormData body as blob')
  		        } else {
  		          return Promise.resolve(new Blob([this._bodyText]))
  		        }
  		      };

  		      this.arrayBuffer = function() {
  		        if (this._bodyArrayBuffer) {
  		          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
  		        } else {
  		          return this.blob().then(readBlobAsArrayBuffer)
  		        }
  		      };
  		    }

  		    this.text = function() {
  		      var rejected = consumed(this);
  		      if (rejected) {
  		        return rejected
  		      }

  		      if (this._bodyBlob) {
  		        return readBlobAsText(this._bodyBlob)
  		      } else if (this._bodyArrayBuffer) {
  		        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
  		      } else if (this._bodyFormData) {
  		        throw new Error('could not read FormData body as text')
  		      } else {
  		        return Promise.resolve(this._bodyText)
  		      }
  		    };

  		    if (support.formData) {
  		      this.formData = function() {
  		        return this.text().then(decode)
  		      };
  		    }

  		    this.json = function() {
  		      return this.text().then(JSON.parse)
  		    };

  		    return this
  		  }

  		  // HTTP methods whose capitalization should be normalized
  		  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

  		  function normalizeMethod(method) {
  		    var upcased = method.toUpperCase();
  		    return methods.indexOf(upcased) > -1 ? upcased : method
  		  }

  		  function Request(input, options) {
  		    options = options || {};
  		    var body = options.body;

  		    if (input instanceof Request) {
  		      if (input.bodyUsed) {
  		        throw new TypeError('Already read')
  		      }
  		      this.url = input.url;
  		      this.credentials = input.credentials;
  		      if (!options.headers) {
  		        this.headers = new Headers(input.headers);
  		      }
  		      this.method = input.method;
  		      this.mode = input.mode;
  		      this.signal = input.signal;
  		      if (!body && input._bodyInit != null) {
  		        body = input._bodyInit;
  		        input.bodyUsed = true;
  		      }
  		    } else {
  		      this.url = String(input);
  		    }

  		    this.credentials = options.credentials || this.credentials || 'same-origin';
  		    if (options.headers || !this.headers) {
  		      this.headers = new Headers(options.headers);
  		    }
  		    this.method = normalizeMethod(options.method || this.method || 'GET');
  		    this.mode = options.mode || this.mode || null;
  		    this.signal = options.signal || this.signal;
  		    this.referrer = null;

  		    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
  		      throw new TypeError('Body not allowed for GET or HEAD requests')
  		    }
  		    this._initBody(body);
  		  }

  		  Request.prototype.clone = function() {
  		    return new Request(this, {body: this._bodyInit})
  		  };

  		  function decode(body) {
  		    var form = new FormData();
  		    body
  		      .trim()
  		      .split('&')
  		      .forEach(function(bytes) {
  		        if (bytes) {
  		          var split = bytes.split('=');
  		          var name = split.shift().replace(/\+/g, ' ');
  		          var value = split.join('=').replace(/\+/g, ' ');
  		          form.append(decodeURIComponent(name), decodeURIComponent(value));
  		        }
  		      });
  		    return form
  		  }

  		  function parseHeaders(rawHeaders) {
  		    var headers = new Headers();
  		    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
  		    // https://tools.ietf.org/html/rfc7230#section-3.2
  		    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
  		    preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
  		      var parts = line.split(':');
  		      var key = parts.shift().trim();
  		      if (key) {
  		        var value = parts.join(':').trim();
  		        headers.append(key, value);
  		      }
  		    });
  		    return headers
  		  }

  		  Body.call(Request.prototype);

  		  function Response(bodyInit, options) {
  		    if (!options) {
  		      options = {};
  		    }

  		    this.type = 'default';
  		    this.status = options.status === undefined ? 200 : options.status;
  		    this.ok = this.status >= 200 && this.status < 300;
  		    this.statusText = 'statusText' in options ? options.statusText : 'OK';
  		    this.headers = new Headers(options.headers);
  		    this.url = options.url || '';
  		    this._initBody(bodyInit);
  		  }

  		  Body.call(Response.prototype);

  		  Response.prototype.clone = function() {
  		    return new Response(this._bodyInit, {
  		      status: this.status,
  		      statusText: this.statusText,
  		      headers: new Headers(this.headers),
  		      url: this.url
  		    })
  		  };

  		  Response.error = function() {
  		    var response = new Response(null, {status: 0, statusText: ''});
  		    response.type = 'error';
  		    return response
  		  };

  		  var redirectStatuses = [301, 302, 303, 307, 308];

  		  Response.redirect = function(url, status) {
  		    if (redirectStatuses.indexOf(status) === -1) {
  		      throw new RangeError('Invalid status code')
  		    }

  		    return new Response(null, {status: status, headers: {location: url}})
  		  };

  		  exports.DOMException = self.DOMException;
  		  try {
  		    new exports.DOMException();
  		  } catch (err) {
  		    exports.DOMException = function(message, name) {
  		      this.message = message;
  		      this.name = name;
  		      var error = Error(message);
  		      this.stack = error.stack;
  		    };
  		    exports.DOMException.prototype = Object.create(Error.prototype);
  		    exports.DOMException.prototype.constructor = exports.DOMException;
  		  }

  		  function fetch(input, init) {
  		    return new Promise(function(resolve, reject) {
  		      var request = new Request(input, init);

  		      if (request.signal && request.signal.aborted) {
  		        return reject(new exports.DOMException('Aborted', 'AbortError'))
  		      }

  		      var xhr = new XMLHttpRequest();

  		      function abortXhr() {
  		        xhr.abort();
  		      }

  		      xhr.onload = function() {
  		        var options = {
  		          status: xhr.status,
  		          statusText: xhr.statusText,
  		          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
  		        };
  		        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
  		        var body = 'response' in xhr ? xhr.response : xhr.responseText;
  		        resolve(new Response(body, options));
  		      };

  		      xhr.onerror = function() {
  		        reject(new TypeError('Network request failed'));
  		      };

  		      xhr.ontimeout = function() {
  		        reject(new TypeError('Network request failed'));
  		      };

  		      xhr.onabort = function() {
  		        reject(new exports.DOMException('Aborted', 'AbortError'));
  		      };

  		      xhr.open(request.method, request.url, true);

  		      if (request.credentials === 'include') {
  		        xhr.withCredentials = true;
  		      } else if (request.credentials === 'omit') {
  		        xhr.withCredentials = false;
  		      }

  		      if ('responseType' in xhr && support.blob) {
  		        xhr.responseType = 'blob';
  		      }

  		      request.headers.forEach(function(value, name) {
  		        xhr.setRequestHeader(name, value);
  		      });

  		      if (request.signal) {
  		        request.signal.addEventListener('abort', abortXhr);

  		        xhr.onreadystatechange = function() {
  		          // DONE (success or failure)
  		          if (xhr.readyState === 4) {
  		            request.signal.removeEventListener('abort', abortXhr);
  		          }
  		        };
  		      }

  		      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
  		    })
  		  }

  		  fetch.polyfill = true;

  		  if (!self.fetch) {
  		    self.fetch = fetch;
  		    self.Headers = Headers;
  		    self.Request = Request;
  		    self.Response = Response;
  		  }

  		  exports.Headers = Headers;
  		  exports.Request = Request;
  		  exports.Response = Response;
  		  exports.fetch = fetch;

  		  Object.defineProperty(exports, '__esModule', { value: true });

  		  return exports;

  		}))({});
  		})(__self__);
  		__self__.fetch.ponyfill = true;
  		// Remove "polyfill" property added by whatwg-fetch
  		delete __self__.fetch.polyfill;
  		// Choose between native implementation (global) or custom implementation (__self__)
  		// var ctx = global.fetch ? global : __self__;
  		var ctx = __self__; // this line disable service worker support temporarily
  		exports = ctx.fetch; // To enable: import fetch from 'cross-fetch'
  		exports.default = ctx.fetch; // For TypeScript consumers without esModuleInterop.
  		exports.fetch = ctx.fetch; // To enable: import {fetch} from 'cross-fetch'
  		exports.Headers = ctx.Headers;
  		exports.Request = ctx.Request;
  		exports.Response = ctx.Response;
  		module.exports = exports; 
  	} (browserPonyfill, browserPonyfill.exports));
  	return browserPonyfill.exports;
  }

  (function (module, exports) {
  	var fetchApi;
  	if (typeof fetch === 'function') {
  	  if (typeof postPage.commonjsGlobal !== 'undefined' && postPage.commonjsGlobal.fetch) {
  	    fetchApi = postPage.commonjsGlobal.fetch;
  	  } else if (typeof window !== 'undefined' && window.fetch) {
  	    fetchApi = window.fetch;
  	  } else {
  	    fetchApi = fetch;
  	  }
  	}

  	if (typeof commonjsRequire !== 'undefined' && (typeof window === 'undefined' || typeof window.document === 'undefined')) {
  	  var f = fetchApi || requireBrowserPonyfill();
  	  if (f.default) f = f.default;
  	  exports.default = f;
  	  module.exports = exports.default;
  	} 
  } (getFetch$1, getFetch$1.exports));

  var getFetchExports = getFetch$1.exports;
  var getFetch = /*@__PURE__*/postPage.getDefaultExportFromCjs(getFetchExports);

  var fetchNode = /*#__PURE__*/_mergeNamespaces({
    __proto__: null,
    default: getFetch
  }, [getFetchExports]);

  function _typeof$1(obj) { "@babel/helpers - typeof"; return _typeof$1 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof$1(obj); }
  var fetchApi;
  if (typeof fetch === 'function') {
    if (typeof global !== 'undefined' && global.fetch) {
      fetchApi = global.fetch;
    } else if (typeof window !== 'undefined' && window.fetch) {
      fetchApi = window.fetch;
    } else {
      fetchApi = fetch;
    }
  }
  var XmlHttpRequestApi;
  if (hasXMLHttpRequest()) {
    if (typeof global !== 'undefined' && global.XMLHttpRequest) {
      XmlHttpRequestApi = global.XMLHttpRequest;
    } else if (typeof window !== 'undefined' && window.XMLHttpRequest) {
      XmlHttpRequestApi = window.XMLHttpRequest;
    }
  }
  var ActiveXObjectApi;
  if (typeof ActiveXObject === 'function') {
    if (typeof global !== 'undefined' && global.ActiveXObject) {
      ActiveXObjectApi = global.ActiveXObject;
    } else if (typeof window !== 'undefined' && window.ActiveXObject) {
      ActiveXObjectApi = window.ActiveXObject;
    }
  }
  if (!fetchApi && fetchNode && !XmlHttpRequestApi && !ActiveXObjectApi) fetchApi = getFetch || fetchNode;
  if (typeof fetchApi !== 'function') fetchApi = undefined;
  var addQueryString = function addQueryString(url, params) {
    if (params && _typeof$1(params) === 'object') {
      var queryString = '';
      for (var paramName in params) {
        queryString += '&' + encodeURIComponent(paramName) + '=' + encodeURIComponent(params[paramName]);
      }
      if (!queryString) return url;
      url = url + (url.indexOf('?') !== -1 ? '&' : '?') + queryString.slice(1);
    }
    return url;
  };
  var fetchIt = function fetchIt(url, fetchOptions, callback) {
    fetchApi(url, fetchOptions).then(function (response) {
      if (!response.ok) return callback(response.statusText || 'Error', {
        status: response.status
      });
      response.text().then(function (data) {
        callback(null, {
          status: response.status,
          data: data
        });
      }).catch(callback);
    }).catch(callback);
  };
  var omitFetchOptions = false;

  var requestWithFetch = function requestWithFetch(options, url, payload, callback) {
    if (options.queryStringParams) {
      url = addQueryString(url, options.queryStringParams);
    }
    var headers = defaults({}, typeof options.customHeaders === 'function' ? options.customHeaders() : options.customHeaders);
    if (payload) headers['Content-Type'] = 'application/json';
    var reqOptions = typeof options.requestOptions === 'function' ? options.requestOptions(payload) : options.requestOptions;
    var fetchOptions = defaults({
      method: payload ? 'POST' : 'GET',
      body: payload ? options.stringify(payload) : undefined,
      headers: headers
    }, omitFetchOptions ? {} : reqOptions);
    try {
      fetchIt(url, fetchOptions, callback);
    } catch (e) {
      if (!reqOptions || Object.keys(reqOptions).length === 0 || !e.message || e.message.indexOf('not implemented') < 0) {
        return callback(e);
      }
      try {
        Object.keys(reqOptions).forEach(function (opt) {
          delete fetchOptions[opt];
        });
        fetchIt(url, fetchOptions, callback);
        omitFetchOptions = true;
      } catch (err) {
        callback(err);
      }
    }
  };

  var requestWithXmlHttpRequest = function requestWithXmlHttpRequest(options, url, payload, callback) {
    if (payload && _typeof$1(payload) === 'object') {
      payload = addQueryString('', payload).slice(1);
    }
    if (options.queryStringParams) {
      url = addQueryString(url, options.queryStringParams);
    }
    try {
      var x;
      if (XmlHttpRequestApi) {
        x = new XmlHttpRequestApi();
      } else {
        x = new ActiveXObjectApi('MSXML2.XMLHTTP.3.0');
      }
      x.open(payload ? 'POST' : 'GET', url, 1);
      if (!options.crossDomain) {
        x.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      }
      x.withCredentials = !!options.withCredentials;
      if (payload) {
        x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      }
      if (x.overrideMimeType) {
        x.overrideMimeType('application/json');
      }
      var h = options.customHeaders;
      h = typeof h === 'function' ? h() : h;
      if (h) {
        for (var i in h) {
          x.setRequestHeader(i, h[i]);
        }
      }
      x.onreadystatechange = function () {
        x.readyState > 3 && callback(x.status >= 400 ? x.statusText : null, {
          status: x.status,
          data: x.responseText
        });
      };
      x.send(payload);
    } catch (e) {
      console && console.log(e);
    }
  };
  var request = function request(options, url, payload, callback) {
    if (typeof payload === 'function') {
      callback = payload;
      payload = undefined;
    }
    callback = callback || function () {};
    if (fetchApi && url.indexOf('file:') !== 0) {
      return requestWithFetch(options, url, payload, callback);
    }
    if (hasXMLHttpRequest() || typeof ActiveXObject === 'function') {
      return requestWithXmlHttpRequest(options, url, payload, callback);
    }
    callback(new Error('No fetch and no xhr implementation found!'));
  };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
  function _defineProperty$1(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  var getDefaults$1 = function getDefaults() {
    return {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      addPath: '/locales/add/{{lng}}/{{ns}}',
      allowMultiLoading: false,
      parse: function parse(data) {
        return JSON.parse(data);
      },
      stringify: JSON.stringify,
      parsePayload: function parsePayload(namespace, key, fallbackValue) {
        return _defineProperty$1({}, key, fallbackValue || '');
      },
      request: request,
      reloadInterval: typeof window !== 'undefined' ? false : 60 * 60 * 1000,
      customHeaders: {},
      queryStringParams: {},
      crossDomain: false,
      withCredentials: false,
      overrideMimeType: false,
      requestOptions: {
        mode: 'cors',
        credentials: 'same-origin',
        cache: 'default'
      }
    };
  };
  var Backend = function () {
    function Backend(services) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var allOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      _classCallCheck(this, Backend);
      this.services = services;
      this.options = options;
      this.allOptions = allOptions;
      this.type = 'backend';
      this.init(services, options, allOptions);
    }
    _createClass(Backend, [{
      key: "init",
      value: function init(services) {
        var _this = this;
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var allOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        this.services = services;
        this.options = defaults(options, this.options || {}, getDefaults$1());
        this.allOptions = allOptions;
        if (this.services && this.options.reloadInterval) {
          setInterval(function () {
            return _this.reload();
          }, this.options.reloadInterval);
        }
      }
    }, {
      key: "readMulti",
      value: function readMulti(languages, namespaces, callback) {
        this._readAny(languages, languages, namespaces, namespaces, callback);
      }
    }, {
      key: "read",
      value: function read(language, namespace, callback) {
        this._readAny([language], language, [namespace], namespace, callback);
      }
    }, {
      key: "_readAny",
      value: function _readAny(languages, loadUrlLanguages, namespaces, loadUrlNamespaces, callback) {
        var _this2 = this;
        var loadPath = this.options.loadPath;
        if (typeof this.options.loadPath === 'function') {
          loadPath = this.options.loadPath(languages, namespaces);
        }
        loadPath = makePromise(loadPath);
        loadPath.then(function (resolvedLoadPath) {
          if (!resolvedLoadPath) return callback(null, {});
          var url = _this2.services.interpolator.interpolate(resolvedLoadPath, {
            lng: languages.join('+'),
            ns: namespaces.join('+')
          });
          _this2.loadUrl(url, callback, loadUrlLanguages, loadUrlNamespaces);
        });
      }
    }, {
      key: "loadUrl",
      value: function loadUrl(url, callback, languages, namespaces) {
        var _this3 = this;
        this.options.request(this.options, url, undefined, function (err, res) {
          if (res && (res.status >= 500 && res.status < 600 || !res.status)) return callback('failed loading ' + url + '; status code: ' + res.status, true);
          if (res && res.status >= 400 && res.status < 500) return callback('failed loading ' + url + '; status code: ' + res.status, false);
          if (!res && err && err.message && err.message.indexOf('Failed to fetch') > -1) return callback('failed loading ' + url + ': ' + err.message, true);
          if (err) return callback(err, false);
          var ret, parseErr;
          try {
            if (typeof res.data === 'string') {
              ret = _this3.options.parse(res.data, languages, namespaces);
            } else {
              ret = res.data;
            }
          } catch (e) {
            parseErr = 'failed parsing ' + url + ' to json';
          }
          if (parseErr) return callback(parseErr, false);
          callback(null, ret);
        });
      }
    }, {
      key: "create",
      value: function create(languages, namespace, key, fallbackValue, callback) {
        var _this4 = this;
        if (!this.options.addPath) return;
        if (typeof languages === 'string') languages = [languages];
        var payload = this.options.parsePayload(namespace, key, fallbackValue);
        var finished = 0;
        var dataArray = [];
        var resArray = [];
        languages.forEach(function (lng) {
          var addPath = _this4.options.addPath;
          if (typeof _this4.options.addPath === 'function') {
            addPath = _this4.options.addPath(lng, namespace);
          }
          var url = _this4.services.interpolator.interpolate(addPath, {
            lng: lng,
            ns: namespace
          });
          _this4.options.request(_this4.options, url, payload, function (data, res) {
            finished += 1;
            dataArray.push(data);
            resArray.push(res);
            if (finished === languages.length) {
              if (callback) callback(dataArray, resArray);
            }
          });
        });
      }
    }, {
      key: "reload",
      value: function reload() {
        var _this5 = this;
        var _this$services = this.services,
          backendConnector = _this$services.backendConnector,
          languageUtils = _this$services.languageUtils,
          logger = _this$services.logger;
        var currentLanguage = backendConnector.language;
        if (currentLanguage && currentLanguage.toLowerCase() === 'cimode') return;

        var toLoad = [];
        var append = function append(lng) {
          var lngs = languageUtils.toResolveHierarchy(lng);
          lngs.forEach(function (l) {
            if (toLoad.indexOf(l) < 0) toLoad.push(l);
          });
        };
        append(currentLanguage);
        if (this.allOptions.preload) this.allOptions.preload.forEach(function (l) {
          return append(l);
        });
        toLoad.forEach(function (lng) {
          _this5.allOptions.ns.forEach(function (ns) {
            backendConnector.read(lng, ns, 'read', null, null, function (err, data) {
              if (err) logger.warn("loading namespace ".concat(ns, " for language ").concat(lng, " failed"), err);
              if (!err && data) logger.log("loaded namespace ".concat(ns, " for language ").concat(lng), data);
              backendConnector.loaded("".concat(lng, "|").concat(ns), err, data);
            });
          });
        });
      }
    }]);
    return Backend;
  }();
  Backend.type = 'backend';

  function _typeof(o) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof(o);
  }

  function _toPrimitive(input, hint) {
    if (_typeof(input) !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (_typeof(res) !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }

  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return _typeof(key) === "symbol" ? key : String(key);
  }

  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }

  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
  /* eslint-disable max-classes-per-file */
  var Storage = /*#__PURE__*/function () {
    function Storage(options) {
      _classCallCheck$1(this, Storage);
      this.store = options.store;
    }
    _createClass$1(Storage, [{
      key: "setItem",
      value: function setItem(key, value) {
        if (this.store) {
          try {
            this.store.setItem(key, value);
          } catch (e) {
            // f.log('failed to set value for key "' + key + '" to localStorage.');
          }
        }
      }
    }, {
      key: "getItem",
      value: function getItem(key, value) {
        if (this.store) {
          try {
            return this.store.getItem(key, value);
          } catch (e) {
            // f.log('failed to get value for key "' + key + '" from localStorage.');
          }
        }
        return undefined;
      }
    }]);
    return Storage;
  }();
  function getDefaults() {
    return {
      prefix: 'i18next_res_',
      expirationTime: 7 * 24 * 60 * 60 * 1000,
      defaultVersion: undefined,
      versions: {},
      store: typeof window !== 'undefined' ? window.localStorage : null
    };
  }
  var Cache = /*#__PURE__*/function () {
    function Cache(services) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      _classCallCheck$1(this, Cache);
      this.init(services, options);
      this.type = 'backend';
    }
    _createClass$1(Cache, [{
      key: "init",
      value: function init(services) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        this.services = services;
        this.options = _objectSpread(_objectSpread(_objectSpread({}, getDefaults()), this.options), options);
        this.storage = new Storage(this.options);
      }
    }, {
      key: "read",
      value: function read(language, namespace, callback) {
        var nowMS = new Date().getTime();
        if (!this.storage.store) {
          return callback(null, null);
        }
        var local = this.storage.getItem("".concat(this.options.prefix).concat(language, "-").concat(namespace));
        if (local) {
          local = JSON.parse(local);
          var version = this.getVersion(language);
          if (
          // expiration field is mandatory, and should not be expired
          local.i18nStamp && local.i18nStamp + this.options.expirationTime > nowMS &&
          // there should be no language version set, or if it is, it should match the one in translation
          version === local.i18nVersion) {
            delete local.i18nVersion;
            delete local.i18nStamp;
            return callback(null, local);
          }
        }
        return callback(null, null);
      }
    }, {
      key: "save",
      value: function save(language, namespace, data) {
        if (this.storage.store) {
          data.i18nStamp = new Date().getTime();

          // language version (if set)
          var version = this.getVersion(language);
          if (version) {
            data.i18nVersion = version;
          }

          // save
          this.storage.setItem("".concat(this.options.prefix).concat(language, "-").concat(namespace), JSON.stringify(data));
        }
      }
    }, {
      key: "getVersion",
      value: function getVersion(language) {
        return this.options.versions[language] || this.options.defaultVersion;
      }
    }]);
    return Cache;
  }();
  Cache.type = 'backend';

  // @ts-expect-error there's some weird shit happening with declaration merging. i can't figure it out.
  postPage.instance.use(Backend$1)
      .use(initReactI18next)
      .init({
          backend: {
              backends: [Cache, Backend],
              backendOptions: [
                  {
                      expirationTime: 30 * 24 * 60 * 60 * 1000, // 30 days
                      defaultVersion: postPage.env.VERSION,
                  },
                  {
                      loadPath: "../.." + `/rc/locales/{{lng}}/{{ns}}.json?${postPage.env.VERSION}`,
                  },
              ],
          },
          lng: "en",
          fallbackLng: "en",
          debug: 'production' !== "production",
          interpolation: { escapeValue: true },
          // TODO: move server keys that are actually needed on the client to `client` namespace
          ns: ["client", "common", "server"],
          react: {
              useSuspense: false,
          },
      })
      .catch((e) => console.error(e));

  // ye olde hack to make common strings used in interpolation stick around
  // t("common:username", "username")
  // t("common:handle", "handle")
  // t("common:email", "e-mail")
  // t("common:password", "password")

  exports.default = postPage.instance;

}));
