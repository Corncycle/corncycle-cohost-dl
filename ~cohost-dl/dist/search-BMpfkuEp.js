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

    const FollowRequestsContext = postPage.reactExports.createContext


    ({ onAction: () => {} });

    const FollowRequestButtons

     = ({ requester }) => {
        const { t } = postPage.useTranslation();
        const userInfo = postPage.useUserInfo();
        const { onAction } = postPage.reactExports.useContext(FollowRequestsContext);
        const utils = postPage.trpc.useContext();

        const createRequestMutationArgs = (action) => {
            return {
                onSettled: async () => {
                    onAction(requester.projectId, action);
                    await utils.relationships.countFollowRequests.invalidate();
                    await utils.posts.profilePosts.invalidate();
                },
            };
        };

        const acceptRequestMutation =
            postPage.trpc.relationships.acceptFollowRequest.useMutation(
                createRequestMutationArgs("accept")
            );
        const onClickAccept = postPage.reactExports.useCallback(async () => {
            if (!userInfo.projectId) return;

            await acceptRequestMutation.mutateAsync({
                fromProjectId: requester.projectId,
                toProjectId: userInfo.projectId,
            });
        }, [acceptRequestMutation, requester.projectId, userInfo.projectId]);

        const declineRequestMutation =
            postPage.trpc.relationships.declineOrCancelFollowRequest.useMutation(
                createRequestMutationArgs("decline")
            );

        const onClickDecline = postPage.reactExports.useCallback(async () => {
            if (!userInfo.projectId) return;

            await declineRequestMutation.mutateAsync({
                fromProjectId: requester.projectId,
                toProjectId: userInfo.projectId,
            });
        }, [declineRequestMutation, requester.projectId, userInfo.projectId]);

        return (
            postPage.React.createElement('div', { className: "flex flex-row justify-center gap-2"   ,}
                , postPage.React.createElement(postPage.Button, { buttonStyle: "pill", color: "green", onClick: onClickAccept,}
                    , t(
                        "server:relationships.accept-follow-request-button-text-short",
                        "accept"
                    )
                )
                , postPage.React.createElement(postPage.Button, { buttonStyle: "pill", color: "red", onClick: onClickDecline,}
                    , t(
                        "server:relationships.decline-follow-request-button-text-short",
                        "decline"
                    )
                )
            )
        );
    };

    const ProjectCard = ({
        project,
        isFollowRequest = false,
    }) => {
        return (
            postPage.React.createElement('div', { className: "flex flex-row items-center gap-1"   ,}
                , postPage.React.createElement(postPage.ProjectAvatar, { project: project,} )
                , postPage.React.createElement('div', { className: "min-w-0 flex-shrink justify-center gap-0 lg:flex-row"    ,}
                    , postPage.React.createElement('div', { className: "items-left flex flex-shrink flex-row gap-1 lg:flex-col"     ,}
                        , postPage.React.createElement(postPage.ProjectReference, { project: project,} )
                    )
                    , postPage.React.createElement('p', null, project.dek)
                )
                , postPage.React.createElement('div', { className: "flex-grow",} )
                , isFollowRequest ? (
                    postPage.React.createElement(FollowRequestButtons, { requester: project,} )
                ) : (
                    postPage.React.createElement(postPage.FollowButton, { project: project, color: "cherry",} )
                )
            )
        );
    };

    const BookmarkTagButton = ({
        tagName,
        className,
    }) => {
        const { loggedIn } = postPage.useUserInfo();
        const utils = postPage.trpc.useContext();
        const { data: isBookmarked, isFetched } =
            postPage.trpc.bookmarks.tags.isBookmarked.useQuery(
                { tagName },
                { enabled: loggedIn }
            );
        const { t } = postPage.useTranslation();
        const buttonText = isBookmarked
            ? t("common:unbookmark-tag", "unbookmark this tag")
            : t("common:bookmark-tag", "bookmark this tag");

        const bookmarkTagMutation = postPage.trpc.bookmarks.tags.create.useMutation({
            onSettled: () =>
                Promise.all([
                    utils.bookmarks.tags.isBookmarked.invalidate({ tagName }),
                    utils.bookmarks.tags.list.invalidate(),
                ]),
        });

        const unbookmarkTagMutation = postPage.trpc.bookmarks.tags.delete.useMutation({
            onSettled: () =>
                Promise.all([
                    utils.bookmarks.tags.isBookmarked.invalidate({ tagName }),
                    utils.bookmarks.tags.list.invalidate(),
                ]),
        });

        const bookmarkTag = postPage.reactExports.useCallback(() => {
            if (isBookmarked) {
                unbookmarkTagMutation.mutate({ tagName });
            } else {
                bookmarkTagMutation.mutate({ tagName });
            }
        }, [isBookmarked, unbookmarkTagMutation, tagName, bookmarkTagMutation]);

        return loggedIn ? (
            isFetched ? (
                postPage.React.createElement(postPage.Button, {
                    className: className,
                    buttonStyle: "roundrect",
                    color: "secondary",
                    onClick: bookmarkTag,}

                    , buttonText
                )
            ) : (
                postPage.React.createElement(postPage.Button, {
                    className: className,
                    buttonStyle: "roundrect",
                    color: "secondary",
                    disabled: true,}

                    , t("common:loading")
                )
            )
        ) : null;
    };

    const SearchPage = () => {
        return (
            postPage.React.createElement('main', { className: "w-full pt-16" ,}
                , postPage.React.createElement('div', { className: "container mx-auto grid grid-cols-1 gap-16 lg:grid-cols-4"     ,}
                    , postPage.React.createElement(postPage.SidebarMenu, null )
                    , postPage.React.createElement('section', { className: "col-span-1 flex flex-col gap-12 lg:col-span-2"    ,}
                        , postPage.React.createElement('div', { className: "rounded-lg bg-notWhite p-3 text-notBlack"   ,}
                            , postPage.React.createElement(postPage.reactExports.Suspense, null
                                , postPage.React.createElement(SearchResults, null )
                            )
                        )
                    )
                )
            )
        );
    };

    const SearchResults = () => {
        const [searchParams, setSearchParams] = postPage.useSearchParams();
        const [query, setQuery] = postPage.reactExports.useState(
            () => searchParams.get("q") ?? ""
        );
        const [searchToken, setSearchToken] = postPage.reactExports.useState(() => query);
        const [, startTransition] = postPage.reactExports.useTransition();

        const projectResults = postPage.useProjectSearch(searchToken, {});
        const tagResults = postPage.useTagSearch(searchToken);

        const onChangeQuery = postPage.reactExports.useCallback

    (
            (e) => {
                const value = e.currentTarget.value;
                setQuery(value);
                startTransition(() => {
                    setSearchToken(value);
                    setSearchParams({ q: value }, { replace: true });
                });
            },
            [setSearchParams]
        );

        return (
            postPage.React.createElement(postPage.React.Fragment, null
                , postPage.React.createElement(postPage.Helmet, { title: `search: ${query}`,} )
                , postPage.React.createElement('div', { className: "flex flex-col gap-4"  ,}
                    , postPage.React.createElement('h1', { className: "h2",}, "search")
                    /* if we've got js, that's great! we're updating on keystrokes
                    anyway. if we don't, the form should still work by changing the
                    query string. */
                    , postPage.React.createElement('form', { method: "get", onSubmit: (e) => e.preventDefault(),}
                        , postPage.React.createElement('input', {
                            type: "text",
                            name: "q",
                            placeholder: "search for pages and tags!"    ,
                            className: "w-full",
                            value: query,
                            onChange: onChangeQuery,}
                        )
                    )

                    , !searchToken || searchToken.length < 3 ? (
                        postPage.React.createElement('p', { className: "h5",}, "enter a query to see results!"     )
                    ) : null

                    , searchToken && searchToken.length >= 3 ? (
                        postPage.React.createElement(postPage.React.Fragment, null
                            , postPage.React.createElement('div', { className: "mt-4",}
                                , postPage.React.createElement('h2', { className: "h5",}, "pages")
                                , postPage.React.createElement('div', { className: "flex w-full flex-col gap-4"   ,}
                                    , projectResults.projects?.length ? (
                                        projectResults.projects?.map((project) => (
                                            postPage.React.createElement(ProjectCard, {
                                                project: project,
                                                key: project.projectId,}
                                            )
                                        ))
                                    ) : (
                                        postPage.React.createElement('p', { className: "h6",}, "No pages found!"  )
                                    )
                                )
                            )

                            , postPage.React.createElement('hr', { className: "my-4",} )

                            , postPage.React.createElement('div', null
                                , postPage.React.createElement('h2', { className: "h5",}, "tags")
                                , tagResults.suggestions?.result.length ? (
                                    postPage.React.createElement('div', { className: "mt-4 flex flex-col gap-2"   ,}
                                        , tagResults.suggestions?.result?.map(
                                            (tag) => (
                                                postPage.React.createElement('div', {
                                                    key: tag.content,
                                                    className: "flex flex-row justify-between gap-3"   ,}

                                                    , postPage.React.createElement('a', {
                                                        href: postPage.sitemap.public
                                                            .tags({
                                                                tagSlug:
                                                                    tag.content,
                                                            })
                                                            .toString(),
                                                        className: "underline before:content-['#']" ,}

                                                        , tag.content
                                                    )
                                                    , postPage.React.createElement(BookmarkTagButton, {
                                                        tagName: tag.content,}
                                                    )
                                                )
                                            )
                                        )
                                    )
                                ) : (
                                    postPage.React.createElement('p', { className: "h6",}, "No tags found!"  )
                                )
                            )
                        )
                    ) : null
                )
            )
        );
    };

    exports.SearchPage = SearchPage;
    exports.default = SearchPage;

}));
