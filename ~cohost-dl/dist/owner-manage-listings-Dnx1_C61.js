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

    const ApprovalChip = ({ status }) => {
        const Icon =
            status === "expired"
                ? postPage.ForwardRef$7
                : status === "approved"
                ? postPage.ForwardRef$8
                : status === "rejected"
                ? postPage.ForwardRef$9
                : postPage.ForwardRef$10;
        return (
            postPage.React.createElement('span', {
                className: `block max-w-max rounded-lg px-3 py-2 ${
                status === "expired"
                    ? "bg-gray-300 text-notBlack"
                    : status === "approved"
                    ? "bg-green-600 text-notWhite contrast-more:bg-green-700"
                    : status === "pending"
                    ? "bg-longan text-notBlack"
                    : "bg-red-600 text-notWhite contrast-more:bg-red-700"
            }`,}

                , postPage.React.createElement(Icon, { className: "mr-2 inline-block h-4 w-4"   ,} )
                , status
            )
        );
    };

    const ArtistAlleyOwnerListing


     = ({ listing, project }) => {
        const hasExpired =
            listing.status === "approved" &&
            new Date(listing.expiresAt) < new Date();
        const effectiveStatus = hasExpired ? "expired" : listing.status;

        return (
            postPage.React.createElement('div', { className: "flex w-full min-w-0 flex-row flex-wrap justify-between gap-4 "       ,}
                , postPage.React.createElement('div', { className: "flex-shrink space-y-3" ,}
                    , postPage.React.createElement(ApprovalChip, { status: effectiveStatus,} )
                    , postPage.React.createElement('div', null
                        , postPage.React.createElement('ul', { className: "space-y-3",}
                            , postPage.React.createElement('li', null
                                , postPage.React.createElement('span', { className: "font-bold",}, "purchase date:" ), " "
                                , postPage.DateTime_1.fromISO(listing.createdAt).toLocaleString(
                                    postPage.DateTime_1.DATETIME_FULL
                                )
                            )
                            , postPage.React.createElement('li', null
                                , postPage.React.createElement('span', { className: "font-bold",}, "weeks purchased:" ), " "
                                , listing.numWeeks
                            )
                            , listing.status === "approved" && (
                                postPage.React.createElement('li', null
                                    , postPage.React.createElement('span', { className: "font-bold",}, "end date:" ), " "
                                    , postPage.DateTime_1.fromISO(
                                        listing.expiresAt
                                    ).toLocaleString(postPage.DateTime_1.DATETIME_FULL)
                                )
                            )
                            , listing.receiptUrl && (
                                postPage.React.createElement('li', null
                                    , postPage.React.createElement('a', {
                                        href: listing.receiptUrl,
                                        rel: "noopener",
                                        target: "_blank",
                                        className: "font-bold underline" ,}
    , "view receipt"

                                    )
                                )
                            )
                            , listing.notes && (
                                postPage.React.createElement('li', null
                                    , postPage.React.createElement('span', { className: "font-bold",}, "submission notes:"

                                    )
                                    , postPage.React.createElement('br', null )
                                    , postPage.React.createElement('div', { className: "co-prose prose mt-2"  ,}
                                        , postPage.React.createElement('blockquote', null, listing.notes)
                                    )
                                )
                            )
                            , listing.rejectReason && (
                                postPage.React.createElement('li', null
                                    , postPage.React.createElement('span', { className: "font-bold",}, "rejection reason:"

                                    )
                                    , postPage.React.createElement('br', null )
                                    , postPage.React.createElement('div', { className: "co-prose prose mt-2"  ,}
                                        , postPage.React.createElement('blockquote', null
                                            , listing.rejectReason
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
                , postPage.React.createElement('div', { className: "w-full max-w-[300px] basis-[300px]"  ,}
                    , postPage.React.createElement(artistAlleyListing.ArtistAlleyListing, { listing: listing, project: project,} )
                )
            )
        );
    };

    const ArtistAlleyOwnerListingsPage = () => {
        postPage.useRequiresLogin();

        const [{ pages }, { hasNextPage, fetchNextPage, isFetching }] =
            postPage.trpc.artistAlley.getOwnerListings.useSuspenseInfiniteQuery(
                {},
                {
                    getNextPageParam: (lastPage) => lastPage.nextCursor,
                    refetchOnMount: false,
                    refetchOnWindowFocus: false,
                }
            );

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

        const combinedListings = postPage.reactExports.useMemo(() => {
            const val = flattenedListings
                .map


    ((listing) => {
                    const project = flattenedProjects.get(listing.projectId);
                    if (!project) return undefined;
                    return {
                        listing,
                        project,
                    };
                })
                .filter(postPage.isDefined);

            return val;
        }, [flattenedListings, flattenedProjects]);

        const theme = postPage.useDynamicTheme();

        return (
            postPage.React.createElement('main', { className: "w-full pt-16" ,}
                , postPage.React.createElement('div', { className: "container mx-auto grid grid-cols-1 gap-16 lg:grid-cols-4"     ,}
                    , postPage.React.createElement(postPage.SidebarMenu, null )
                    , postPage.React.createElement('section', { className: " col-span-1 flex flex-col gap-12 lg:col-span-2"     ,}
                        , postPage.React.createElement('div', {
                            className: "co-themed-box co-settings rounded-lg p-3"   ,
                            'data-theme': theme.current,}

                            , postPage.React.createElement('h1', { className: "co-settings-header",}, "manage your listings"

                            )
                            , postPage.React.createElement('hr', { className: "mt-6",} )
                            , postPage.React.createElement('div', { className: "my-6 flex flex-col space-y-3"   ,}
                                , combinedListings?.map((listing) => (
                                    postPage.React.createElement(postPage.React.Fragment, { key: listing.listing.id,}
                                        , postPage.React.createElement(ArtistAlleyOwnerListing, {
                                            listing: listing.listing,
                                            project: listing.project,}
                                        )
                                        , postPage.React.createElement('hr', null )
                                    )
                                ))
                            )
                            , postPage.React.createElement(postPage.BasicButton, {
                                as: "button",
                                buttonColor: "theme-sensitive-1",
                                buttonSize: "regular",
                                disabled: isFetching || !hasNextPage,
                                onClick: () => fetchNextPage(),}

                                , isFetching
                                    ? "loading..."
                                    : hasNextPage
                                    ? "load more"
                                    : "no more listings"
                            )
                        )
                    )
                )
            )
        );
    };

    exports.ArtistAlleyOwnerListingsPage = ArtistAlleyOwnerListingsPage;
    exports.default = ArtistAlleyOwnerListingsPage;

}));
