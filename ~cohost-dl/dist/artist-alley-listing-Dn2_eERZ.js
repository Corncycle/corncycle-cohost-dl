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

    const ArtistAlleyFilterProvider = postPage.React.createContext








    ({
        adultFilterMode: "hide",
        isAdult: false,
        categories: new Set(),
        setAdultFilterMode: () => {},
        categoryMatch: "any",
        setCategoryMatch: () => {},
        sortOrder: "random",
        setSortOrder: () => {},
    });

    const useArtistAlleyFilters = () => {
        return postPage.reactExports.useContext(ArtistAlleyFilterProvider);
    };

    const ASPECT_RATIO = 300 / 250;

    const ArtistAlleyAttachment

     = ({ attachment }) => {
        const displayPrefs = postPage.useDisplayPrefs();
        const [src, setSrc] = postPage.reactExports.useState(
            displayPrefs.gifsStartPaused
                ? attachment.previewURL
                : attachment.fileURL
        );
        const [isPlaying, setIsPlaying] = postPage.reactExports.useState(!displayPrefs.gifsStartPaused);

        const srcWithDpr = postPage.useImageOptimizer(src, 300, ASPECT_RATIO);

        const handlePause = () => {
            setIsPlaying(false);
            setSrc(attachment.previewURL);
        };

        const handlePlay = () => {
            setIsPlaying(true);
            setSrc(attachment.fileURL);
        };

        return (
            postPage.React.createElement('div', { className: "group relative" ,}
                , postPage.React.createElement('img', {
                    src: srcWithDpr(1),
                    srcSet: `
                ${srcWithDpr(1)} 1x,
                ${srcWithDpr(2)} 2x,
                ${srcWithDpr(3)} 3x,
            `,
                    alt: attachment.altText,
                    className: "co-border aspect-[300/250] w-full border-b object-cover"    ,}
                )

                , attachment.previewURL !== attachment.fileURL && (
                    postPage.React.createElement(postPage.PlayPauseButton, {
                        isPlaying: isPlaying,
                        showPlay: attachment.previewURL !== attachment.fileURL,
                        extraClasses: "absolute bottom-3 right-3 w-12"   ,
                        onPlay: handlePlay,
                        onPause: handlePause,}
                    )
                )
            )
        );
    };

    const ArtistAlleyMeatballMenu = ({
        listing,
    }) => {
        const reportingUIContext = postPage.reactExports.useContext(postPage.ReportingUIContext);

        return (
            // explicit height is required to vertically align the
            // meatballs with the rest of the action buttons
            postPage.React.createElement(postPage.ot, { as: "div", className: "relative h-6" ,}
                , postPage.React.createElement(postPage.ot.Button, { className: "co-action-button cursor-pointer text-sm font-bold hover:underline"    ,}
                    , postPage.React.createElement(postPage.ForwardRef$11, { className: "h-6 w-6 transition-transform ui-open:rotate-90"   ,} )
                )

                , postPage.React.createElement(postPage.ot.Items, { className: "co-meatball-items absolute right-0 top-8 z-30 flex min-w-max flex-col divide-y rounded-lg p-3  focus:!outline-none"            ,}
                    , postPage.React.createElement(postPage.ot.Item, null
                        , postPage.React.createElement(postPage.MeatballMenuItem, {
                            disabled: false,
                            onClick: () => {
                                reportingUIContext.send({
                                    type: "START_REPORT",
                                    artistAlleyListingId: listing.id,
                                });
                            },
                            ItemIcon: postPage.ForwardRef$12,
                            text: "report",}
                        )
                    )
                )
            )
        );
    };

    const ArtistAlleyListing


     = ({ listing, project }) => {
        const rendered = postPage.reactExports.useMemo(() => {
            return postPage.renderMarkdownReactNoHTML(listing.body, new Date(), {
                disableEmbeds: true,
                externalLinksInNewTab: true,
                hasCohostPlus: false,
                renderingContext: "artistAlley",
            });
        }, [listing.body]);

        const theme = postPage.useDynamicTheme();

        return (
            postPage.React.createElement('div', {
                'data-theme': theme.current,
                className: "co-themed-box co-artist-alley-listing flex w-full flex-col rounded-lg border"      ,}

                , postPage.React.createElement('div', { className: "co-border flex flex-row items-center gap-2 border-b px-2 py-3"       ,}
                    , postPage.React.createElement(postPage.ProjectAvatar, { project: project, className: "h-8",} )
                    , postPage.React.createElement('a', {
                        href: postPage.sitemap.public.project
                            .mainAppProfile({ projectHandle: project.handle })
                            .toString(),}
    , "@"
                        , project.handle
                    )
                    , postPage.React.createElement('div', { className: "flex-1",}, " ")
                    , listing.adultContent ? (
                        postPage.React.createElement('span', { className: "co-18-plus rounded-lg p-1 text-xs "    ,}, "18+"

                        )
                    ) : null
                    , postPage.React.createElement(ArtistAlleyMeatballMenu, { listing: listing,} )
                )
                , listing.attachment && (
                    postPage.React.createElement(ArtistAlleyAttachment, { attachment: listing.attachment,} )
                )
                , postPage.React.createElement('div', { className: "co-prose prose p-2"  ,}, rendered)

                , postPage.React.createElement('div', { className: "mx-2 my-3" ,}
                    , postPage.React.createElement(postPage.BasicButton, {
                        as: "a",
                        buttonColor: "",
                        buttonSize: "regular",
                        href: listing.cta.link,
                        extraClasses: "co-cta-button",
                        target: "_blank",}

                        , listing.cta.text
                    )
                )

                , listing.categories.length > 0 && (
                    postPage.React.createElement(ListingTags, { tags: listing.categories,} )
                )
            )
        );
    };

    const ListingTags = ({ tags }) => {
        const { categories } = useArtistAlleyFilters();
        const filteredTags = tags.filter((tag) => tag != "");

        return filteredTags.length ? (
            postPage.React.createElement('div', { className: "w-full max-w-full p-3"  ,}
                , postPage.React.createElement('div', {
                    className: postPage.tw`co-tags relative w-full overflow-y-hidden break-words leading-none`,}

                    , postPage.React.createElement('div', null
                        , filteredTags.map((tag) => (
                            postPage.React.createElement('button', {
                                key: tag,
                                className: `mr-2 inline-block text-sm hover:underline ${
                                // bold currently filtered tags
                                categories.has(tag) ? "font-bold" : ""
                            }`,
                                onClick: () => {
                                    categories.has(tag)
                                        ? categories.delete(tag)
                                        : categories.add(tag);
                                },}
    , "#"
                                , tag
                            )
                        ))
                    )
                )
            )
        ) : null;
    };

    exports.ArtistAlleyFilterProvider = ArtistAlleyFilterProvider;
    exports.ArtistAlleyListing = ArtistAlleyListing;
    exports.useArtistAlleyFilters = useArtistAlleyFilters;

}));
