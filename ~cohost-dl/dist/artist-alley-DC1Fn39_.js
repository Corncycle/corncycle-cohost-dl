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

define(['exports', './post-page', './artist-alley-listing-Dn2_eERZ'], (function (exports, postPage, artistAlleyListing) { 'use strict';

    const useTransitionState = (...args) => {
        const [state, setState] = postPage.reactExports.useState(...args);
        const [isTransitioning, startTransition] = postPage.reactExports.useTransition();

        const setStateWithTransition = (newState) => {
            startTransition(() => {
                setState(newState);
            });
        };

        return [state, setStateWithTransition];
    };

    const ArtistAlleyApprovalStatus = postPage.mod.enum([
        "approved",
        "pending",
        "rejected",
    ]);
     



    const ArtistAlleyPaymentStatus = postPage.mod.enum(["paid", "unpaid", "refunded"]);
     

    postPage.mod.object({
        altText: postPage.mod.string(),
        attachmentFilename: postPage.mod.string(),
        ip: postPage.mod.string(),
    });
     

    const ArtistAlleyWireAttachment = postPage.mod.object({
        altText: postPage.mod.string(),
        previewURL: postPage.mod.string().url(),
        fileURL: postPage.mod.string().url(),
    });
     



    postPage.mod.enum(["hide", "include", "only"]);
     



    const WireArtistAlley = postPage.mod.object({
        id: postPage.ArtistAlleyAdId,
        projectId: postPage.ProjectId,
        expiresAt: postPage.ISODateString,
        createdAt: postPage.ISODateString,
        body: postPage.mod.string(),
        cta: postPage.mod.object({
            link: postPage.mod.string().url(),
            text: postPage.mod.string(),
        }),
        attachment: ArtistAlleyWireAttachment.nullable(),
        categories: postPage.mod.array(postPage.mod.string()),
        adultContent: postPage.mod.boolean(),
    });
     

    WireArtistAlley.extend({
        userId: postPage.UserId,
        status: ArtistAlleyApprovalStatus,
        paymentStatus: ArtistAlleyPaymentStatus,
        stripeCheckoutSessionId: postPage.mod.string().nullable(),
        stripePaymentIntentId: postPage.mod.string().nullable(),
        rejectReason: postPage.mod.string().nullable(),
        numWeeks: postPage.mod.number().int(),
        notes: postPage.mod.string().nullable(),
    });
     

    WireArtistAlley.extend({
        userId: postPage.UserId,
        status: ArtistAlleyApprovalStatus,
        paymentStatus: ArtistAlleyPaymentStatus,
        rejectReason: postPage.mod.string().nullable(),
        numWeeks: postPage.mod.number().int(),
        notes: postPage.mod.string().nullable(),
        receiptUrl: postPage.mod.string().url().nullable(),
    });

    function useSet(values) {
      const setRef = postPage.reactExports.useRef(new Set(values));
      const [, reRender] = postPage.reactExports.useReducer((x) => x + 1, 0);

      setRef.current.add = (...args) => {
        const res = Set.prototype.add.apply(setRef.current, args);
        reRender();

        return res;
      };

      setRef.current.clear = (...args) => {
        Set.prototype.clear.apply(setRef.current, args);
        reRender();
      };

      setRef.current.delete = (...args) => {
        const res = Set.prototype.delete.apply(setRef.current, args);
        reRender();

        return res;
      };

      return setRef.current;
    }

    // src/observe.ts
    var observerMap = /* @__PURE__ */ new Map();
    var RootIds = /* @__PURE__ */ new WeakMap();
    var rootId = 0;
    var unsupportedValue = void 0;
    function getRootId(root) {
      if (!root)
        return "0";
      if (RootIds.has(root))
        return RootIds.get(root);
      rootId += 1;
      RootIds.set(root, rootId.toString());
      return RootIds.get(root);
    }
    function optionsToId(options) {
      return Object.keys(options).sort().filter(
        (key) => options[key] !== void 0
      ).map((key) => {
        return `${key}_${key === "root" ? getRootId(options.root) : options[key]}`;
      }).toString();
    }
    function createObserver(options) {
      const id = optionsToId(options);
      let instance = observerMap.get(id);
      if (!instance) {
        const elements = /* @__PURE__ */ new Map();
        let thresholds;
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            var _a;
            const inView = entry.isIntersecting && thresholds.some((threshold) => entry.intersectionRatio >= threshold);
            if (options.trackVisibility && typeof entry.isVisible === "undefined") {
              entry.isVisible = inView;
            }
            (_a = elements.get(entry.target)) == null ? void 0 : _a.forEach((callback) => {
              callback(inView, entry);
            });
          });
        }, options);
        thresholds = observer.thresholds || (Array.isArray(options.threshold) ? options.threshold : [options.threshold || 0]);
        instance = {
          id,
          observer,
          elements
        };
        observerMap.set(id, instance);
      }
      return instance;
    }
    function observe(element, callback, options = {}, fallbackInView = unsupportedValue) {
      if (typeof window.IntersectionObserver === "undefined" && fallbackInView !== void 0) {
        const bounds = element.getBoundingClientRect();
        callback(fallbackInView, {
          isIntersecting: fallbackInView,
          target: element,
          intersectionRatio: typeof options.threshold === "number" ? options.threshold : 0,
          time: 0,
          boundingClientRect: bounds,
          intersectionRect: bounds,
          rootBounds: bounds
        });
        return () => {
        };
      }
      const { id, observer, elements } = createObserver(options);
      const callbacks = elements.get(element) || [];
      if (!elements.has(element)) {
        elements.set(element, callbacks);
      }
      callbacks.push(callback);
      observer.observe(element);
      return function unobserve() {
        callbacks.splice(callbacks.indexOf(callback), 1);
        if (callbacks.length === 0) {
          elements.delete(element);
          observer.unobserve(element);
        }
        if (elements.size === 0) {
          observer.disconnect();
          observerMap.delete(id);
        }
      };
    }
    function useInView({
      threshold,
      delay,
      trackVisibility,
      rootMargin,
      root,
      triggerOnce,
      skip,
      initialInView,
      fallbackInView,
      onChange
    } = {}) {
      var _a;
      const [ref, setRef] = postPage.reactExports.useState(null);
      const callback = postPage.reactExports.useRef();
      const [state, setState] = postPage.reactExports.useState({
        inView: !!initialInView,
        entry: void 0
      });
      callback.current = onChange;
      postPage.reactExports.useEffect(
        () => {
          if (skip || !ref)
            return;
          let unobserve;
          unobserve = observe(
            ref,
            (inView, entry) => {
              setState({
                inView,
                entry
              });
              if (callback.current)
                callback.current(inView, entry);
              if (entry.isIntersecting && triggerOnce && unobserve) {
                unobserve();
                unobserve = void 0;
              }
            },
            {
              root,
              rootMargin,
              threshold,
              // @ts-ignore
              trackVisibility,
              // @ts-ignore
              delay
            },
            fallbackInView
          );
          return () => {
            if (unobserve) {
              unobserve();
            }
          };
        },
        // We break the rule here, because we aren't including the actual `threshold` variable
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
          // If the threshold is an array, convert it to a string, so it won't change between renders.
          Array.isArray(threshold) ? threshold.toString() : threshold,
          ref,
          root,
          rootMargin,
          triggerOnce,
          skip,
          trackVisibility,
          fallbackInView,
          delay
        ]
      );
      const entryTarget = (_a = state.entry) == null ? void 0 : _a.target;
      const previousEntryTarget = postPage.reactExports.useRef();
      if (!ref && entryTarget && !triggerOnce && !skip && previousEntryTarget.current !== entryTarget) {
        previousEntryTarget.current = entryTarget;
        setState({
          inView: !!initialInView,
          entry: void 0
        });
      }
      const result = [setRef, state.inView, state.entry];
      result.ref = result[0];
      result.inView = result[1];
      result.entry = result[2];
      return result;
    }

    function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

    function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

    function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

    function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

    function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

    function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
    const defaultProps = {
      breakpointCols: undefined,
      // optional, number or object { default: number, [key: number]: number }
      className: undefined,
      // required, string
      columnClassName: undefined,
      // optional, string
      // Any React children. Typically an array of JSX items
      children: undefined,
      // Custom attributes, however it is advised against
      // using these to prevent unintended issues and future conflicts
      // ...any other attribute, will be added to the container
      columnAttrs: undefined,
      // object, added to the columns
      // Deprecated props
      // The column property is deprecated.
      // It is an alias of the `columnAttrs` property
      column: undefined
    };
    const DEFAULT_COLUMNS = 2;

    class Masonry extends postPage.React.Component {
      constructor(props) {
        super(props); // Correct scope for when methods are accessed externally

        this.reCalculateColumnCount = this.reCalculateColumnCount.bind(this);
        this.reCalculateColumnCountDebounce = this.reCalculateColumnCountDebounce.bind(this); // default state

        let columnCount;

        if (this.props.breakpointCols && this.props.breakpointCols.default) {
          columnCount = this.props.breakpointCols.default;
        } else {
          columnCount = parseInt(this.props.breakpointCols) || DEFAULT_COLUMNS;
        }

        this.state = {
          columnCount
        };
      }

      componentDidMount() {
        this.reCalculateColumnCount(); // window may not be available in some environments

        if (window) {
          window.addEventListener('resize', this.reCalculateColumnCountDebounce);
        }
      }

      componentDidUpdate() {
        this.reCalculateColumnCount();
      }

      componentWillUnmount() {
        if (window) {
          window.removeEventListener('resize', this.reCalculateColumnCountDebounce);
        }
      }

      reCalculateColumnCountDebounce() {
        if (!window || !window.requestAnimationFrame) {
          // IE10+
          this.reCalculateColumnCount();
          return;
        }

        if (window.cancelAnimationFrame) {
          // IE10+
          window.cancelAnimationFrame(this._lastRecalculateAnimationFrame);
        }

        this._lastRecalculateAnimationFrame = window.requestAnimationFrame(() => {
          this.reCalculateColumnCount();
        });
      }

      reCalculateColumnCount() {
        const windowWidth = window && window.innerWidth || Infinity;
        let breakpointColsObject = this.props.breakpointCols; // Allow passing a single number to `breakpointCols` instead of an object

        if (typeof breakpointColsObject !== 'object') {
          breakpointColsObject = {
            default: parseInt(breakpointColsObject) || DEFAULT_COLUMNS
          };
        }

        let matchedBreakpoint = Infinity;
        let columns = breakpointColsObject.default || DEFAULT_COLUMNS;

        for (let breakpoint in breakpointColsObject) {
          const optBreakpoint = parseInt(breakpoint);
          const isCurrentBreakpoint = optBreakpoint > 0 && windowWidth <= optBreakpoint;

          if (isCurrentBreakpoint && optBreakpoint < matchedBreakpoint) {
            matchedBreakpoint = optBreakpoint;
            columns = breakpointColsObject[breakpoint];
          }
        }

        columns = Math.max(1, parseInt(columns) || 1);

        if (this.state.columnCount !== columns) {
          this.setState({
            columnCount: columns
          });
        }
      }

      itemsInColumns() {
        const currentColumnCount = this.state.columnCount;
        const itemsInColumns = new Array(currentColumnCount); // Force children to be handled as an array

        const items = postPage.React.Children.toArray(this.props.children);

        for (let i = 0; i < items.length; i++) {
          const columnIndex = i % currentColumnCount;

          if (!itemsInColumns[columnIndex]) {
            itemsInColumns[columnIndex] = [];
          }

          itemsInColumns[columnIndex].push(items[i]);
        }

        return itemsInColumns;
      }

      renderColumns() {
        const {
          column,
          columnAttrs = {},
          columnClassName
        } = this.props;
        const childrenInColumns = this.itemsInColumns();
        const columnWidth = `${100 / childrenInColumns.length}%`;
        let className = columnClassName;

        if (className && typeof className !== 'string') {
          this.logDeprecated('The property "columnClassName" requires a string'); // This is a deprecated default and will be removed soon.

          if (typeof className === 'undefined') {
            className = 'my-masonry-grid_column';
          }
        }

        const columnAttributes = _objectSpread(_objectSpread(_objectSpread({}, column), columnAttrs), {}, {
          style: _objectSpread(_objectSpread({}, columnAttrs.style), {}, {
            width: columnWidth
          }),
          className
        });

        return childrenInColumns.map((items, i) => {
          return /*#__PURE__*/postPage.React.createElement("div", _extends({}, columnAttributes, {
            key: i
          }), items);
        });
      }

      logDeprecated(message) {
        console.error('[Masonry]', message);
      }

      render() {
        const _this$props = this.props,
              {
          // ignored
          children,
          breakpointCols,
          columnClassName,
          columnAttrs,
          column,
          // used
          className
        } = _this$props,
              rest = _objectWithoutProperties(_this$props, ["children", "breakpointCols", "columnClassName", "columnAttrs", "column", "className"]);

        let classNameOutput = className;

        if (typeof className !== 'string') {
          this.logDeprecated('The property "className" requires a string'); // This is a deprecated default and will be removed soon.

          if (typeof className === 'undefined') {
            classNameOutput = 'my-masonry-grid';
          }
        }

        return /*#__PURE__*/postPage.React.createElement("div", _extends({}, rest, {
          className: classNameOutput
        }), this.renderColumns());
      }

    }

    Masonry.defaultProps = defaultProps;

    const MultiSwitchButton





     = ({ tabs }) => {
        return (
            postPage.React.createElement('ul', { className: "co-multi-button mx-auto my-2 flex w-auto max-w-fit flex-row items-center justify-evenly overflow-y-auto whitespace-nowrap rounded-lg"           ,}
                , tabs.map((tab) => (
                    postPage.React.createElement('li', {
                        key: `${tab.label}`,
                        className: `co-multi-button px-3 py-2 text-center text-sm first-of-type:rounded-l-lg last-of-type:rounded-r-lg ${
                        tab.active
                            ? "co-active rounded-lg rounded-b-lg font-bold first-of-type:rounded-bl-none last-of-type:rounded-br-none"
                            : ""
                    }`,}

                        , postPage.React.createElement('button', { onClick: tab.onClick,}, tab.label)
                    )
                ))
            )
        );
    };

    const ArtistAlleyFilters

     = ({ className }) => {
        const postBoxTheme = postPage.useDynamicTheme();

        const isDesktop = postPage.useMedia("(min-width: 1200px)", true);

        const [allCategories] =
            postPage.trpc.artistAlley.getCategoriesInUse.useSuspenseQuery(undefined, {
                refetchInterval: Infinity,
                keepPreviousData: true,
            });

        const { loggedIn } = postPage.useUserInfo();

        const { data: hasPurchasedListing } =
            postPage.trpc.artistAlley.hasPurchasedListing.useQuery(undefined, {
                enabled: loggedIn,
                suspense: true,
            });

        const {
            adultFilterMode,
            setAdultFilterMode,
            categories,
            isAdult,
            categoryMatch,
            setCategoryMatch,
            sortOrder,
            setSortOrder,
        } = artistAlleyListing.useArtistAlleyFilters();

        return (
            postPage.React.createElement(postPage.React.Fragment, null
                , postPage.React.createElement(postPage.ve, {
                    as: "div",
                    'data-theme': postBoxTheme.current,
                    className: postPage.tw`co-themed-box co-artist-alley-filters cohost-shadow-light dark:cohost-shadow-dark col-span-1 flex h-fit max-h-max min-h-0 w-full flex-col rounded-lg border ${
                    className ?? ""
                }`,
                    defaultOpen: isDesktop,}

                    , postPage.React.createElement(postPage.ve.Button, {
                        as: "header",
                        className: "flex flex-row items-center justify-between rounded-t-lg p-3 ui-not-open:rounded-b-lg"      ,}

                        , postPage.React.createElement(postPage.ForwardRef$2, { className: "h-5 w-5 ui-open:rotate-90 motion-safe:transition-transform"   ,} )
                        , postPage.React.createElement('span', { className: "font-league text-xs uppercase"  ,}, "filters"

                        )
                    )
                    , postPage.React.createElement(postPage.ve.Panel, { as: "div",}
                        , postPage.React.createElement('div', { className: "flex flex-row flex-wrap gap-2 px-3 py-2"     ,}
                            , allCategories.map((category) => (
                                postPage.React.createElement('div', {
                                    key: `selected-token-${category}`,
                                    className: "group h-max cursor-pointer select-none"   ,}

                                    /* this weird nested div thing is to prevent a bug caused by having the default click handler and our removal handler on the same element */
                                    , postPage.React.createElement('button', {
                                        className: postPage.tw`co-token flex items-center justify-start gap-1 rounded-lg px-2 py-1 leading-none ${
                                        categories.has(category)
                                            ? "co-active"
                                            : ""
                                    }`,
                                        onClick: (e) => {
                                            e.stopPropagation();
                                            categories.has(category)
                                                ? categories.delete(category)
                                                : categories.add(category);
                                        },
                                        type: "button",}

                                        , postPage.React.createElement(postPage.ForwardRef$3, { className: "inline-block h-3.5" ,} )
                                        , postPage.React.createElement('span', { className: "block",}, category)
                                    )
                                )
                            ))
                        )
                        , postPage.React.createElement(MultiSwitchButton, {
                            tabs: [
                                {
                                    label: "any",
                                    onClick: () => setCategoryMatch("any"),
                                    active: categoryMatch === "any",
                                },
                                {
                                    label: "all",
                                    onClick: () => setCategoryMatch("all"),
                                    active: categoryMatch === "all",
                                },
                            ],}
                        )
                        , isAdult && (
                            postPage.React.createElement(postPage.React.Fragment, null
                                , postPage.React.createElement('hr', { className: "border-notWhite",} )
                                , postPage.React.createElement(MultiSwitchButton, {
                                    tabs: [
                                        {
                                            label: "hide 18+",
                                            onClick: () => {
                                                setAdultFilterMode("hide");
                                            },
                                            active: adultFilterMode === "hide",
                                        },
                                        {
                                            label: "show 18+",
                                            onClick: () => {
                                                setAdultFilterMode("include");
                                            },
                                            active: adultFilterMode === "include",
                                        },
                                        {
                                            label: "only 18+",
                                            onClick: () => {
                                                setAdultFilterMode("only");
                                            },
                                            active: adultFilterMode === "only",
                                        },
                                    ],}
                                )
                            )
                        )
                        , postPage.React.createElement('hr', { className: "border-notWhite",} )
                        , postPage.React.createElement(MultiSwitchButton, {
                            tabs: [
                                {
                                    label: "random",
                                    onClick: () => {
                                        setSortOrder("random");
                                    },
                                    active: sortOrder === "random",
                                },
                                {
                                    label: "newest first",
                                    onClick: () => {
                                        setSortOrder("newest");
                                    },
                                    active: sortOrder === "newest",
                                },
                                {
                                    label: "oldest first",
                                    onClick: () => {
                                        setSortOrder("oldest");
                                    },
                                    active: sortOrder === "oldest",
                                },
                            ],}
                        )
                    )
                )
                , postPage.React.createElement(postPage.ve, {
                    as: "div",
                    'data-theme': postBoxTheme.current,
                    className: postPage.tw`co-themed-box co-artist-alley-filters cohost-shadow-light dark:cohost-shadow-dark col-span-1 mt-4 flex h-fit max-h-max min-h-0 w-full flex-col rounded-lg border ${
                    className ?? ""
                }`,
                    defaultOpen: isDesktop,}

                    , postPage.React.createElement(postPage.ve.Button, {
                        as: "header",
                        className: "flex flex-row items-center justify-between rounded-t-lg p-3 ui-not-open:rounded-b-lg"      ,}

                        , postPage.React.createElement(postPage.ForwardRef$2, { className: "h-5 w-5 ui-open:rotate-90 motion-safe:transition-transform"   ,} )
                        , postPage.React.createElement('span', { className: "font-league text-xs uppercase"  ,}, "your listing here!"

                        )
                    )
                    , postPage.React.createElement(postPage.ve.Panel, { as: "div", className: "p-3",}
                        , postPage.React.createElement('div', { className: "co-prose prose mb-3"  ,}
                            , postPage.React.createElement('p', null, "are you an artist, musician, game developer, or other creative? got something you want cohost users to know about? get an artist alley listing! only $10 per week!"




                            )
                        )
                        , postPage.React.createElement(postPage.BasicButton, {
                            buttonSize: "regular",
                            buttonColor: "post-box-filled",
                            as: "a",
                            href: postPage.sitemap.public.artistAlley.create().toString(),
                            extraClasses: "mt-2",}
    , "buy a listing"

                        )
                        , hasPurchasedListing && (
                            postPage.React.createElement(postPage.BasicButton, {
                                buttonSize: "regular",
                                buttonColor: "post-box-filled",
                                as: "a",
                                href: postPage.sitemap.public.artistAlley
                                    .ownerManage()
                                    .toString(),
                                extraClasses: "mt-2",}
    , "manage your listings"

                            )
                        )
                    )
                )
            )
        );
    };

    function generateMasonryBreakpoints(
        maxCols
    ) {
        const breakpoints = {
            default: 1,
        };

        // breakpoints are based on a max-width, so we need to set the breakpoint
        // based on the maximum number of columns below that width. columns are max
        // 300px, so 2 columns requires a min-width of 600px, meaning 1 column has a
        // max-width of 600px. i swear this makes sense. - jkap, 4/23/24
        for (let i = 1; i <= maxCols; i++) {
            breakpoints[300 * (i + 1)] = i;
        }

        // since it's based on max-width, we set a fallback breakpoint that's
        // impossible to hit so that we don't snap back to 1 column on larger
        // screens.
        breakpoints[Number.MAX_SAFE_INTEGER] = maxCols + 1;
        return breakpoints;
    }

    const ArtistAlleyPage = () => {
        const { isAdult, explicitlyCollapseAdultContent } = postPage.useDisplayPrefs();

        const [adultState, setAdultFilterMode] =
            useTransitionState(
                // if the user is an adult, use their display setting. otherwise,
                // default to hiding adult content
                isAdult
                    ? explicitlyCollapseAdultContent
                        ? "hide"
                        : "include"
                    : "hide"
            );
        const [categoryMatch, setCategoryMatch] =
            useTransitionState("any");
        const categories = useSet();

        const artistAlleyLive = postPage.index_browserExports.useFlag(postPage.FeatureFlag.Enum["artist-alley-listings"]);

        const [sortOrder, setSortOrder] = useTransitionState("random");

        return (
            postPage.React.createElement(artistAlleyListing.ArtistAlleyFilterProvider.Provider, {
                value: {
                    adultFilterMode: adultState,
                    isAdult,
                    categories,
                    setAdultFilterMode,
                    categoryMatch,
                    setCategoryMatch,
                    sortOrder,
                    setSortOrder,
                },}

                , postPage.React.createElement('div', { className: "styled-scrollbars-light dark:styled-scrollbars-dark styled-scrollbars-light dark:styled-scrollbars-dark container mx-auto flex w-full max-w-full flex-row [height:calc(100vh-4rem)]"          ,}
                    , postPage.React.createElement(postPage.Helmet, { title: "artist alley" ,} )
                    , postPage.React.createElement(postPage.SidebarMenu, { narrowMode: true,} )
                    , artistAlleyLive ? (
                        postPage.React.createElement(postPage.reactExports.Suspense, { fallback: postPage.React.createElement('div', null, "aaaaaaa"),}
                            , postPage.React.createElement(ArtistAlleyInner, null )
                        )
                    ) : (
                        postPage.React.createElement(ArtistAlleyClosed, null )
                    )
                )
            )
        );
    };

    const ArtistAlleyClosed = () => {
        const theme = postPage.useDynamicTheme();
        return (
            postPage.React.createElement('div', { className: "mt-12",}
                , postPage.React.createElement('div', { 'data-theme': theme.current, className: "co-themed-box co-static" ,}
                    , postPage.React.createElement('div', { className: "co-prose prose" ,}
                        , postPage.React.createElement('h1', null, "artist alley is currently closed"    )

                        , postPage.React.createElement('p', null, "we're still working on getting everything set up! if you're interested in buying a listing, you can do so on the"


                            , " "
                            , postPage.React.createElement('a', {
                                href: postPage.sitemap.public.artistAlley
                                    .create()
                                    .toString(),}
    , "sign up page!"

                            )
                        )
                        , postPage.React.createElement('p', null, "artist alley should be live soon. check out"
                                   , " "
                            , postPage.React.createElement('a', { href: "https://cohost.org/staff",}, "@staff"), " for the most recent info!"

                        )
                    )
                )
            )
        );
    };

    // doing this with zod because i was having trouble getting typescript to handle
    // the discriminated union correctly otherwise
    postPage.mod.discriminatedUnion("type", [
        postPage.mod.object({
            type: postPage.mod.literal("LISTING"),
            id: postPage.ArtistAlleyAdId,
            listing: WireArtistAlley,
            project: postPage.WireProjectModel,
        }),
        postPage.mod.object({ type: postPage.mod.literal("FILTER"), id: postPage.mod.literal("FILTER") }),
    ]);


    const ArtistAlleyInner = () => {
        const toastId = postPage.reactExports.useRef(undefined);

        const { operatingPrime } = postPage.useSiteConfig();

        const { adultFilterMode, categories, categoryMatch, sortOrder } =
            artistAlleyListing.useArtistAlleyFilters();

        const [{ pages }, { fetchNextPage, fetchStatus }] =
            postPage.trpc.artistAlley.getListingsForDisplay.useSuspenseInfiniteQuery(
                {
                    adultDisplayMode: adultFilterMode,
                    categories: Array.from(categories),
                    sortModulus: operatingPrime,
                    categoryMatch,
                    sortOrder,
                },
                {
                    getNextPageParam: (lastPage) => lastPage.nextCursor,
                    keepPreviousData: true,
                    // never refetch, each page load should be fully deterministic
                    refetchInterval: Infinity,
                    refetchOnMount: false,
                    refetchOnReconnect: false,
                    refetchOnWindowFocus: false,
                    refetchIntervalInBackground: false,

                    // toast management
                    onError: (err) => {
                        postPage.n.error(err.message, {
                            id: toastId.current,
                        });
                    },
                    onSuccess: () => {
                        postPage.n.dismiss(toastId.current);
                    },
                }
            );

        postPage.reactExports.useEffect(() => {
            if (fetchStatus === "fetching") {
                toastId.current = postPage.n.loading("loading listings...", {
                    id: toastId.current,
                });
            }
        }, [fetchStatus]);

        const flattenedListings = postPage.reactExports.useMemo(() => {
            return pages.flatMap((page) => page.listings) ?? [];
        }, [pages]);

        const flattenedProjects = postPage.reactExports.useMemo(() => {
            const projects = new Map();
            pages.forEach((page) => {
                Object.values(page.relevantProjects).forEach((project) => {
                    projects.set(project.projectId, project);
                });
            });
            return projects;
        }, [pages]);

        const masonicListings = postPage.reactExports.useMemo(() => {
            const val = flattenedListings
                .map((listing) => {
                    const project = flattenedProjects.get(listing.projectId);
                    if (!project) return undefined;
                    return {
                        type: "LISTING",
                        id: listing.id,
                        listing,
                        project,
                    };
                })
                .filter(postPage.isDefined);

            // inject the filter sentinel item at the beginning so it's rendered in the right place
            val.unshift({ type: "FILTER", id: "FILTER" });

            return val;
        }, [flattenedListings, flattenedProjects]);

        const { ref, inView } = useInView();

        postPage.reactExports.useEffect(() => {
            if (inView) {
                postPage.reactExports.startTransition(() => {
                    void fetchNextPage();
                });
            }
        }, [inView, fetchNextPage]);

        const masonryBreakpoints = postPage.reactExports.useMemo(() => {
            return generateMasonryBreakpoints(20);
        }, []);

        return (
            postPage.React.createElement('div', { className: "flex w-full flex-col gap-4"   ,}
                , postPage.React.createElement(Masonry, {
                    breakpointCols: masonryBreakpoints,
                    className: "artist-alley-grid w-full" ,
                    columnClassName: "artist-alley-grid_column",}

                    , masonicListings.map((listing) => (
                        postPage.React.createElement(ListingMasonryWrapper, { key: listing.id, data: listing,} )
                    ))
                )
                /* marker so we can load the next page */
                , postPage.React.createElement('div', { className: "h-[1px] w-[1px] flex-shrink-0"  , ref: ref,})
            )
        );
    };

    const ListingMasonryWrapper

     = ({ data }) => {
        if (data.type === "LISTING")
            return (
                postPage.React.createElement('div', {
                    key: data.listing.id,
                    className: "mt-4 inline-block w-full max-w-[300px]"   ,}

                    , postPage.React.createElement(artistAlleyListing.ArtistAlleyListing, {
                        listing: data.listing,
                        project: data.project,}
                    )
                )
            );

        return (
            postPage.React.createElement('div', { key: data.id, className: "mt-4 inline-block w-full max-w-[300px]"   ,}
                , postPage.React.createElement(ArtistAlleyFilters, null )
            )
        );
    };

    exports.ArtistAlleyPage = ArtistAlleyPage;
    exports.default = ArtistAlleyPage;

}));
