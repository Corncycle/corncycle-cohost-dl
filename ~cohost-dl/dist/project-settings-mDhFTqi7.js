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

define(['module', 'exports', './post-page', './styled-input-CUFbgPOn'], (function (module, exports, postPage, styledInput) { 'use strict';

    const sectionBoxClasses =
        "cohost-shadow-light dark:cohost-shadow-dark mx-auto flex max-h-min w-full flex-col gap-4 rounded-lg bg-notWhite text-notBlack px-7 py-8";
    const sectionTitleClasses = "font-atkinson font-bold text-4xl";

    const FrequentlyUsedTagsForm = () => {
        const { data: tagOptionData } =
            postPage.trpc.projects.frequentlyUsedTags.query.useQuery(undefined, {
                suspense: true,
            });

        const { data: project } = postPage.trpc.projects.currentProject.useQuery(undefined, {
            suspense: true,
        });
        const utils = postPage.trpc.useContext();

        const tagOptions = tagOptionData?.tags.map((tag) => tag.content) ?? [];

        const mutateFrequentlyUsedTags =
            postPage.trpc.projects.frequentlyUsedTags.mutation.useMutation();
        const { handleSubmit, control } = postPage.useForm({
            defaultValues: {
                tagsToDisplay: project?.frequentlyUsedTags ?? [],
            },
        });

        const onSubmit = async (values) => {
            await mutateFrequentlyUsedTags.mutateAsync({
                tags: values.tagsToDisplay,
            });
            await utils.projects.currentProject.invalidate();
        };

        return (
            postPage.React.createElement('div', {
                // FIXME: theme forced to light here because we haven't rethemed the rest of the site yet
                'data-theme': "light",
                className: postPage.classNames("co-themed-box", sectionBoxClasses),}

                , postPage.React.createElement('form', {
                    className: "flex flex-col gap-4"  ,
                    onSubmit: handleSubmit(onSubmit),}

                    , postPage.React.createElement('h4', { className: sectionTitleClasses,}, "pinned tags" )

                    , postPage.React.createElement(postPage.InfoBox, { level: "info",}, "You can pin any of your top 15 most used tags to showcase on your page! This gives your readers easy access to a page with just your posts in that tag, as well as a good way to tell other users what sort of things they can expect!"




                    )

                    , postPage.React.createElement('div', { className: "flex flex-col" ,}
                        , postPage.React.createElement(postPage.Controller, {
                            control: control,
                            name: "tagsToDisplay",
                            render: ({ field }) => (
                                postPage.React.createElement(postPage.TokenInput, {
                                    TokenIcon: postPage.ForwardRef,
                                    setTokens: field.onChange,
                                    tokens: field.value,
                                    getSuggestions: false,
                                    placeholder: "Pick some tags!"  ,
                                    customSuggestions: tagOptions,}
                                )
                            ),}
                        )
                    )

                    , postPage.React.createElement('div', { className: "flex w-full flex-row items-center justify-end gap-4 font-bold text-notWhite"       ,}
                        , mutateFrequentlyUsedTags.isSuccess ? (
                            postPage.React.createElement('p', { className: "text-green",}, "saved!")
                        ) : null
                        , mutateFrequentlyUsedTags.isError ? (
                            postPage.React.createElement('p', { className: "text-red",}
                                , mutateFrequentlyUsedTags.error.message
                            )
                        ) : null

                        , postPage.React.createElement(postPage.AuthnButton, {
                            type: "submit",
                            disabled: mutateFrequentlyUsedTags.isLoading,
                            className: "font-bold",}
    , "save tags"

                        )
                    )
                )
            )
        );
    };

    const SettingsRow = ({
        bigLabel,
        smallLabel,
        inputElement,
        infoBoxLevel,
        infoBoxContent,
        customDescription,
        disabled,
    }) => {
        const bigLabelRowSpanClasses = smallLabel ? "row-span-1" : "row-span-2";
        const customDescriptionContent = customDescription ?? null;

        return (
            postPage.React.createElement('div', { className: "grid grid-cols-[1fr_min-content] grid-rows-[min-content] items-center gap-2.5 pt-2.5"     ,}
                , postPage.React.createElement(postPage.React.Fragment, null
                    , postPage.React.createElement('label', {
                        htmlFor: inputElement.props.id,
                        className: postPage.classNames(
                            `col-start-1 row-start-1 font-bold`,
                            bigLabelRowSpanClasses,
                            { "text-gray-300": disabled }
                        ),}

                        , bigLabel
                    )

                    , smallLabel ? (
                        postPage.React.createElement('label', {
                            htmlFor: inputElement.props.id,
                            className: postPage.classNames(
                                "col-start-1 row-start-2 align-middle",
                                { "text-gray-300": disabled }
                            ),}

                            , smallLabel
                        )
                    ) : null

                    , postPage.React.createElement('div', { className: "col-start-2 row-span-2 row-start-1"  ,}
                        , inputElement
                    )

                    , infoBoxLevel ? (
                        postPage.React.createElement(postPage.InfoBox, {
                            level: infoBoxLevel,
                            className: "col-span-2 col-start-1" ,}

                            , infoBoxContent
                        )
                    ) : (
                        customDescriptionContent
                    )

                    , postPage.React.createElement('hr', { className: "col-span-2 col-start-1 w-full border-gray-300"   ,} )
                )
            )
        );
    };

    function beatsFormat(dateTime) {
        return `${dateTime
        .setZone("UTC+1")
        .toLocaleString(postPage.DateTime_1.DATE_MED)} ${postPage.fromDateTime(dateTime, true)}`;
    }







    const UnfriendlyTimestamp

     = ({
        dateISO,
        link,
        className = "block flex-none text-sm text-gray-500 dark:text-gray-300",
    }) => {
        const displayPrefs = postPage.useDisplayPrefs();
        const [luxonDT, setLuxonDT] = postPage.reactExports.useState(postPage.DateTime_1.fromISO(dateISO).toUTC());
        const timestampText = displayPrefs.beatsTimestamps
            ? beatsFormat(luxonDT)
            : luxonDT.toLocaleString(postPage.DateTime_1.DATE_MED_WITH_WEEKDAY);

        postPage.reactExports.useEffect(() => {
            setLuxonDT((current) => current.toLocal());
        }, []);

        return (
            postPage.React.createElement('time', { dateTime: luxonDT.toISO(), className: className,}
                , link ? (
                    postPage.React.createElement('a', { href: link.toString(), className: "hover:underline",}
                        , timestampText
                    )
                ) : (
                    timestampText
                )
            )
        );
    };

    const HandleChangeForm = () => {
        postPage.useTranslation();
        const project = postPage.useCurrentProject();
        const {
            register,
            handleSubmit,
            formState: { errors },
            trigger,
            control,
        } = postPage.useForm({
            defaultValues: {
                handle: project.handle,
            },
            mode: "onBlur",
        });
        postPage.trpc.projects.checkHandle.useMutation();
        const changeHandleMutation = postPage.trpc.projects.changeHandle.useMutation();
        const canChangeHandle = postPage.trpc.projects.canChangeHandle.useQuery(undefined, {
            suspense: true,
        });
        const { beatsTimestamps } = postPage.useDisplayPrefs();

        const onSubmit = async (values) => {
            return changeHandleMutation
                .mutateAsync({
                    handle: values.handle ,
                })
                .then(() => location.reload());
        };

        return (
            postPage.React.createElement('div', { className: sectionBoxClasses,}
                , postPage.React.createElement('form', {
                    className: "flex flex-col gap-4"  ,
                    onSubmit: handleSubmit(onSubmit),}

                    , postPage.React.createElement('h4', { className: sectionTitleClasses,}, "change handle" )

                    , postPage.React.createElement(postPage.InfoBox, { level: "info",}
                        , postPage.React.createElement('div', { className: "prose prose-sm" ,}
                            , postPage.React.createElement('p', null, "You can change your page handle here. Handles must be at least 3 characters long, only contain letters, numbers, and hyphens (\"-\"), and not already be in use."




                            )
                            , postPage.React.createElement('p', null, "You may change your handle up to once every"
                                        , " "
                                , beatsTimestamps ? "1000 beats" : "24 hours", ".", " "
                                , canChangeHandle.data?.canChange === false ? (
                                    postPage.React.createElement(postPage.React.Fragment, null, "You've already changed it once today. Wait until"

                                        , " "
                                        , postPage.React.createElement(UnfriendlyTimestamp, {
                                            dateISO: 
                                                canChangeHandle.data.nextChangeDate
                                            ,
                                            // we have to set this to reset the default classes. we don't need anything special tho.
                                            className: "",}
                                        ), " ", "to change it again."

                                    )
                                ) : null
                            )
                        )
                    )

                    , postPage.React.createElement('div', { className: "flex flex-col" ,}
                        , postPage.React.createElement(SettingsRow, {
                            bigLabel: "new handle" ,
                            inputElement: 
                                postPage.React.createElement('div', { className: "flex flex-row items-center gap-2"   ,}
                                    , postPage.React.createElement('span', { className: "text-xl",}, "@")
                                    , postPage.React.createElement(styledInput.StyledInput, {
                                        trigger: trigger,
                                        name: "handle",
                                        control: control,
                                        type: "text",
                                        rules: {
                                            required: "Handle is required!",
                                        },}
                                    )
                                    , errors.handle ? (
                                        postPage.React.createElement('p', { className: "text-red",}
                                            , errors.handle.message
                                        )
                                    ) : null
                                )
                            ,}
                        )
                    )

                    , postPage.React.createElement('div', { className: "flex w-full flex-row items-center justify-end gap-4 font-bold text-notWhite"       ,}
                        , changeHandleMutation.isSuccess ? (
                            postPage.React.createElement('p', { className: "text-green",}, "saved!")
                        ) : null
                        , changeHandleMutation.isError ? (
                            postPage.React.createElement('p', { className: "text-red",}
                                , changeHandleMutation.error.message
                            )
                        ) : null

                        , postPage.React.createElement(postPage.AuthnButton, {
                            type: "submit",
                            disabled: changeHandleMutation.isLoading,
                            className: "font-bold",}
    , "change handle"

                        )
                    )
                )
            )
        );
    };

    const AccordionButton = (props) => {
        return (
            postPage.React.createElement('button', { className: "flex w-full flex-row justify-between bg-cherry-500 px-3 py-1 font-bold text-notWhite"        ,}
                , props.label

                , postPage.React.createElement(postPage.ForwardRef$1, {
                    className: postPage.classNames("h-6", props.open ? "rotate-180" : ""),}
                )
            )
        );
    };

    const SilencedBlockedProjectCard

     = (props) => {
        const currentProject = postPage.useCurrentProject();
        const unmute = postPage.trpc.relationships.unmute.useMutation();
        const unblock = postPage.trpc.relationships.unblock.useMutation();
        const utils = postPage.trpc.useContext();
        const [isConfirmOpen, setIsConfirmOpen] = postPage.reactExports.useState(false);

        function onClickButton() {
            setIsConfirmOpen(true);
        }

        async function onConfirmUnmute() {
            if (!currentProject) return;

            await unmute.mutateAsync({
                fromProjectId: currentProject.projectId,
                toProjectId: props.project.projectId,
            });
            await utils.relationships.silencedProjects.invalidate();
        }

        async function onConfirmUnblock() {
            if (!currentProject) return;

            await unblock.mutateAsync({
                fromProjectId: currentProject.projectId,
                toProjectId: props.project.projectId,
            });
            await utils.relationships.blockedProjects.invalidate();
        }

        let confirmDialog = null;
        let buttonLabel = "";

        switch (props.button) {
            case "unmute":
                confirmDialog = (
                    postPage.React.createElement(postPage.SimpleModalDialog, {
                        isOpen: isConfirmOpen,
                        title: postPage.t(
                            "client:unsilence-page.confirm-with-handle-title",
                            {
                                defaultValue: "Unsilence @{{handle}}?",
                                handle: props.project.handle,
                            }
                        ),
                        body: postPage.t("client:unsilence-page.confirm-with-handle-body", {
                            defaultValue:
                                "Are you sure you want to unsilence @{{handle}}?",
                            handle: props.project.handle,
                        }),
                        confirm: {
                            label: postPage.t("common:unsilence", "unsilence"),
                        },
                        cancel: {
                            label: postPage.t("common:cancel", "cancel"),
                        },
                        onConfirm: onConfirmUnmute,
                        onCancel: () => setIsConfirmOpen(false),}
                    )
                );
                buttonLabel = "unsilence";
                break;
            case "unblock":
                confirmDialog = (
                    postPage.React.createElement(postPage.SimpleModalDialog, {
                        isOpen: isConfirmOpen,
                        title: postPage.t("client:unblock-page.confirm-with-handle-title", {
                            defaultValue: "Unblock @{{handle}}?",
                            handle: props.project.handle,
                        }),
                        body: postPage.t("client:unblock-page.confirm-with-handle-body", {
                            defaultValue:
                                "Are you sure you want to unblock @{{handle}}?",
                            handle: props.project.handle,
                        }),
                        confirm: {
                            label: postPage.t("common:unblock", "unblock"),
                        },
                        cancel: {
                            label: postPage.t("common:cancel", "cancel"),
                        },
                        onConfirm: onConfirmUnblock,
                        onCancel: () => setIsConfirmOpen(false),}
                    )
                );
                buttonLabel = "unblock";
                break;
        }

        return (
            postPage.React.createElement(postPage.React.Fragment, null
                , confirmDialog
                , postPage.React.createElement('li', { className: "grid-cols-max grid-rows-max grid justify-between border-b-[1px] last:border-b-0"     ,}
                    , postPage.React.createElement('div', { className: "col-start-1 row-start-1" ,}
                        , props.project.displayName ? (
                            postPage.React.createElement(postPage.React.Fragment, null
                                , postPage.React.createElement('span', { className: "font-bold",}
                                    , props.project.displayName
                                ), " "

                            )
                        ) : null, "@"
                        , props.project.handle, " ("
                        , postPage.React.createElement('a', {
                            href: postPage.sitemap.public.project
                                .mainAppProfile({
                                    projectHandle: props.project.handle,
                                })
                                .toString(),
                            className: "underline",}
    , "profile"

                        ), ")"

                    )
                    , postPage.React.createElement(postPage.BasicButton, {
                        extraClasses: "col-start-2 row-start-1 row-span-2 h-10 w-fit self-center"     ,
                        buttonColor: "stroke",
                        onClick: onClickButton,}

                        , buttonLabel
                    )
                    , props.userNote ? (
                        postPage.React.createElement('div', { className: "col-start-1 row-start-2 italic"  ,}, "user note: "
                              , props.userNote
                        )
                    ) : (
                        postPage.React.createElement('div', { className: "col-start-1 row-start-2 italic"  ,}, "(no user note)"

                        )
                    )
                )
            )
        );
    };

    const SilencedAndBlockedForm = () => {
        const silencedProjects =
            postPage.trpc.relationships.silencedProjects.useInfiniteQuery(
                {},
                {
                    suspense: true,
                    staleTime: Infinity,
                    getNextPageParam: (lastPage) => lastPage.nextCursor,
                }
            );
        const blockedProjects = postPage.trpc.relationships.blockedProjects.useInfiniteQuery(
            {},
            {
                suspense: true,
                staleTime: Infinity,
                getNextPageParam: (lastPage) => lastPage.nextCursor,
            }
        );

        const silencedProjectsList = silencedProjects.data
            ? postPage._.concat(
                  ...silencedProjects.data.pages.map((group) => group.projects)
              )
            : [];

        const blockedProjectsList = blockedProjects.data
            ? postPage._.concat(...blockedProjects.data.pages.map((group) => group.projects))
            : [];

        return (
            postPage.React.createElement('div', { className: sectionBoxClasses,}
                , postPage.React.createElement('h4', { className: sectionTitleClasses,}, "silenced and blocked pages"   ), "You can access lists of the pages you've silenced or blocked here, if you want to check or make changes to them."


                , postPage.React.createElement(postPage.ve, null
                    , postPage.React.createElement(postPage.ve.Button, null
                        , ({ open }) => (
                            postPage.React.createElement(AccordionButton, {
                                label: 
                                    open
                                        ? "hide silenced pages"
                                        : "show silenced pages"
                                ,
                                open: open,}
                            )
                        )
                    )
                    , postPage.React.createElement(postPage.ve.Panel, null
                        , postPage.React.createElement('ul', { className: "flex max-h-[50vh] flex-col overflow-y-auto"   ,}
                            , silencedProjectsList.length > 0 ? (
                                silencedProjectsList.map((project) => (
                                    postPage.React.createElement(SilencedBlockedProjectCard, {
                                        key: project.project.projectId,
                                        project: project.project,
                                        userNote: project.userNote,
                                        button: "unmute",}
                                    )
                                ))
                            ) : (
                                postPage.React.createElement('div', null, "You have no pages silenced."    )
                            )

                            , silencedProjects.hasNextPage ? (
                                postPage.React.createElement(postPage.BasicButton, {
                                    buttonSize: "regular",
                                    buttonColor: "stroke",
                                    extraClasses: "w-[50%] mt-4 self-center"  ,
                                    onClick: silencedProjects.fetchNextPage,}
    , "load more"

                                )
                            ) : null
                        )
                    )
                )
                , postPage.React.createElement(postPage.ve, null
                    , postPage.React.createElement(postPage.ve.Button, null
                        , ({ open }) => (
                            postPage.React.createElement(AccordionButton, {
                                label: 
                                    open
                                        ? "hide blocked pages"
                                        : "show blocked pages"
                                ,
                                open: open,}
                            )
                        )
                    )
                    , postPage.React.createElement(postPage.ve.Panel, null
                        , postPage.React.createElement('ul', { className: "flex max-h-[50vh] flex-col overflow-y-auto"   ,}
                            , blockedProjectsList.length > 0 ? (
                                blockedProjectsList.map((project) => (
                                    postPage.React.createElement(SilencedBlockedProjectCard, {
                                        key: project.project.projectId,
                                        project: project.project,
                                        userNote: project.userNote,
                                        button: "unblock",}
                                    )
                                ))
                            ) : (
                                postPage.React.createElement('div', null, "You have no pages blocked."    )
                            )

                            , blockedProjects.hasNextPage ? (
                                postPage.React.createElement(postPage.BasicButton, {
                                    buttonSize: "regular",
                                    buttonColor: "stroke",
                                    extraClasses: "w-[50%] mt-4 self-center"  ,
                                    onClick: blockedProjects.fetchNextPage,}
    , "load more"

                                )
                            ) : null
                        )
                    )
                )
            )
        );
    };

    const ProjectSettingsForm = () => {
        const { data } = postPage.trpc.projects.projectSettings.useQuery(undefined, {
            suspense: true,
        });
        const mutateProjectSettings =
            postPage.trpc.projects.changeProjectSettings.useMutation();
        const { register, handleSubmit, watch } = postPage.useForm({
            defaultValues: {
                private: data.privacy === postPage.ProjectPrivacy.Private,
                adultContent: data.adultContent,
                loggedOutPostVisibility: data.loggedOutPostVisibility,
                asksEnabled: data.asks.enabled,
                asksAllowAnon: data.asks.allowAnon,
                asksRequireLoggedInAnon: data.asks.requireLoggedInAnon,
            },
        });
        const formPrivateValue = watch("private");

        const onSubmit = async (values) => {
            return mutateProjectSettings.mutateAsync({
                privacy: values.private
                    ? postPage.ProjectPrivacy.Private
                    : postPage.ProjectPrivacy.Public,
                adultContent: values.adultContent,
                loggedOutPostVisibility: values.loggedOutPostVisibility,
                asks: {
                    enabled: values.asksEnabled,
                    allowAnon: values.asksAllowAnon,
                    requireLoggedInAnon: values.asksRequireLoggedInAnon,
                },
            });
        };

        const subsectionTitleClasses = "font-atkinson font-bold text-2xl pt-8";

        const loggedOutPostSelectElement = (
            postPage.React.createElement('select', {
                disabled: formPrivateValue,
                ...register("loggedOutPostVisibility"),}

                , postPage.React.createElement('option', { value: "public",}, "all posts" )
                , postPage.React.createElement('option', { value: "none",}, "no posts" )
            )
        );

        return (
            postPage.React.createElement('div', { className: sectionBoxClasses,}
                , postPage.React.createElement('form', {
                    className: "flex flex-col gap-4"  ,
                    onSubmit: handleSubmit(onSubmit),}

                    , postPage.React.createElement('h4', { className: sectionTitleClasses,}, "page settings" )

                    , postPage.React.createElement('div', { className: "flex flex-col" ,}
                        , postPage.React.createElement(SettingsRow, {
                            bigLabel: "private page?" ,
                            inputElement: 
                                postPage.React.createElement('input', {
                                    type: "checkbox",
                                    ...register("private"),
                                    className: "rounded-checkbox",}
                                )
                            ,}
                        )

                        , postPage.React.createElement(SettingsRow, {
                            bigLabel: "18+ content?" ,
                            inputElement: 
                                postPage.React.createElement('input', {
                                    type: "checkbox",
                                    ...register("adultContent"),
                                    className: "rounded-checkbox",}
                                )
                            ,
                            infoBoxLevel: "info",
                            infoBoxContent: 
                                postPage.React.createElement('div', { className: "prose prose-sm" ,}
                                    , postPage.React.createElement('p', null, "This controls the default 18+ content state for any post you make. We recommend that pages which mostly post adult content enable this."




                                    )
                                    , postPage.React.createElement('p', null, "Please note: even if your page is marked as 18+ content, profile information (avatar and header image) must be all-ages appropriate! You can read more in our"



                                             , " "
                                        , postPage.React.createElement('a', {
                                            href: postPage.sitemap.public
                                                .staticContent({
                                                    slug: "community-guidelines",
                                                })
                                                .toString(),}
    , "community guidelines"

                                        ), "."

                                    )
                                )
                            ,}
                        )

                        , formPrivateValue === false ? (
                            postPage.React.createElement(SettingsRow, {
                                bigLabel: "which posts should be visible to users who are logged out?"          ,
                                inputElement: loggedOutPostSelectElement,}
                            )
                        ) : (
                            postPage.React.createElement(SettingsRow, {
                                bigLabel: "which posts should be visible to users who are logged out?"          ,
                                inputElement: loggedOutPostSelectElement,
                                infoBoxLevel: "info",
                                infoBoxContent: 
                                    postPage.React.createElement('div', { className: "prose prose-sm" ,}
                                        , postPage.React.createElement('p', null, "Because this page is private, none of its posts will be visible to users who are logged out."



                                        )
                                    )
                                ,}
                            )
                        )

                        , postPage.React.createElement('h5', { className: subsectionTitleClasses,}, "asks")
                        , postPage.React.createElement(SettingsRow, {
                            bigLabel: "asks enabled?" ,
                            inputElement: 
                                postPage.React.createElement('input', {
                                    type: "checkbox",
                                    className: "rounded-checkbox",
                                    ...register("asksEnabled"),}
                                )
                            ,}
                        )
                        , watch("asksEnabled") ? (
                            postPage.React.createElement(postPage.React.Fragment, null
                                , postPage.React.createElement(SettingsRow, {
                                    bigLabel: "anon asks enabled?"  ,
                                    inputElement: 
                                        postPage.React.createElement('input', {
                                            type: "checkbox",
                                            className: "rounded-checkbox",
                                            ...register("asksAllowAnon"),}
                                        )
                                    ,}
                                )

                                , watch("asksAllowAnon") ? (
                                    postPage.React.createElement(SettingsRow, {
                                        bigLabel: "require anon asks to be logged in?"      ,
                                        inputElement: 
                                            postPage.React.createElement('input', {
                                                type: "checkbox",
                                                className: "rounded-checkbox",
                                                ...register(
                                                    "asksRequireLoggedInAnon"
                                                ),}
                                            )
                                        ,}
                                    )
                                ) : null
                            )
                        ) : null
                    )

                    , postPage.React.createElement('div', { className: "flex w-full flex-row items-center justify-end gap-4 font-bold text-notWhite"       ,}
                        , mutateProjectSettings.isSuccess ? (
                            postPage.React.createElement('p', { className: "text-green",}, "saved!")
                        ) : null
                        , mutateProjectSettings.isError ? (
                            postPage.React.createElement('p', { className: "text-red",}
                                , mutateProjectSettings.error.message
                            )
                        ) : null

                        , postPage.React.createElement(postPage.AuthnButton, {
                            type: "submit",
                            disabled: mutateProjectSettings.isLoading,
                            className: "font-bold",}
    , "save settings"

                        )
                    )
                )
            )
        );
    };

    const FormSubmitButtonRow = (
        props
    ) => {
        return (
            postPage.React.createElement('div', { className: "flex w-full flex-row items-center justify-end gap-4 font-bold text-notWhite"       ,}
                , props.submitMutation.isSuccess ? (
                    postPage.React.createElement('p', { className: "text-green",}, "saved!")
                ) : null
                , props.submitMutation.isError ? (
                    postPage.React.createElement('p', { className: "text-red",}, props.submitMutation.error.message)
                ) : null

                , postPage.React.createElement(postPage.AuthnButton, {
                    type: "submit",
                    disabled: props.submitMutation.isLoading,
                    className: "font-bold",}

                    , props.submitButtonLabel
                )
            )
        );
    };

    class AuthHelpers {
        static async getSalt(email) {
            const url = new URL("/api/v1/login/salt", document.URL);
            url.searchParams.append("email", email);

            const response = await fetch(url.toString()).then((resp) =>
                resp.json().then((data) => data )
            );

            return response.salt;
        }

        static async hashPasswordInWorker(
            email,
            salt,
            password
        ) {
            // run this slow hash function in the background
            // const hashWorker = new Worker("/static/hash-worker.js");
            const hashWorker = new Worker(
                new URL("./hash-worker.ts", new URL(module.uri, document.baseURI).href)
            );

            return new Promise((resolve) => {
                hashWorker.onmessage = (
                    e


                ) => {
                    resolve(e.data.clientHash);
                };

                hashWorker.postMessage({ email, password, salt });
            });
        }
    }

    const InnerScheduleForDeleteForm = () => {
        const userInfo = postPage.useUserInfo();
        const {
            register,
            handleSubmit,
            formState: { errors },
            trigger,
            control,
            watch,
        } = postPage.useForm({
            defaultValues: {
                confirmHandle: "",
                password: "",
                otp: "",
            },
        });
        const scheduleDeletionMutation = postPage.trpc.projects.scheduleDelete.useMutation();
        const confirmHandle = watch("confirmHandle");

        const onSubmit = async (values) => {
            if (!userInfo.email) {
                throw new Error("e-mail is null?");
            }

            const email = userInfo.email;
            const saltResult = await postPage.getVanillaClient().login.getSalt.query({
                email,
            });
            const clientHash = await AuthHelpers.hashPasswordInWorker(
                email,
                saltResult.salt,
                values.password
            );

            await scheduleDeletionMutation.mutateAsync({
                confirmHandle: values.confirmHandle,
                clientHash: clientHash,
                twoFactorToken: values.otp,
            });
        };

        return (
            postPage.React.createElement('div', { className: sectionBoxClasses,}
                , postPage.React.createElement('form', {
                    className: "flex flex-col gap-4"  ,
                    onSubmit: handleSubmit(onSubmit),}

                    , postPage.React.createElement('h4', { className: sectionTitleClasses,}, "delete page" )

                    , postPage.React.createElement('p', { className: "prose",}, "If you'd like to delete this page, fill out the information below. We'll schedule its data to be permanently deleted in 3 days – to give you a chance to change your mind – but with no further action required from you. If you need to delete it sooner than that, please e-mail us at"




                                  , " "
                        , postPage.React.createElement('a', { href: "mailto:support@cohost.org",}, "support@cohost.org"), " ", "and we can help you."

                    )

                    , postPage.React.createElement(SettingsRow, {
                        bigLabel: "confirm page handle"  ,
                        inputElement: 
                            postPage.React.createElement('div', { className: "flex flex-row items-center gap-2"   ,}
                                , postPage.React.createElement('span', { className: "text-xl",}, "@")
                                , postPage.React.createElement(styledInput.StyledInput, {
                                    trigger: trigger,
                                    name: "confirmHandle",
                                    control: control,
                                    type: "text",
                                    showValidity: false,}
                                )
                            )
                        ,}
                    )

                    , postPage.React.createElement(SettingsRow, {
                        bigLabel: "confirm your password"  ,
                        disabled: confirmHandle === "",
                        inputElement: 
                            postPage.React.createElement(styledInput.StyledInput, {
                                trigger: trigger,
                                name: "password",
                                control: control,
                                type: "password",
                                showValidity: false,
                                disabled: confirmHandle === "",}
                            )
                        ,}
                    )

                    , userInfo.twoFactorActive ? (
                        postPage.React.createElement(SettingsRow, {
                            bigLabel: "confirm your 2fa code"   ,
                            disabled: confirmHandle === "",
                            inputElement: 
                                postPage.React.createElement(styledInput.StyledInput, {
                                    trigger: trigger,
                                    name: "otp",
                                    control: control,
                                    type: "text",
                                    showValidity: false,
                                    disabled: confirmHandle === "",}
                                )
                            ,}
                        )
                    ) : null

                    , postPage.React.createElement(FormSubmitButtonRow, {
                        submitMutation: scheduleDeletionMutation,
                        submitButtonLabel: "schedule deletion" ,}
                    )
                )
            )
        );
    };





    const InnerCancelScheduledDeletionForm = () => {
        const { register, handleSubmit } = postPage.useForm(
            {}
        );
        const currentProject = postPage.useCurrentProject();
        const cancelScheduledDeletionMutation =
            postPage.trpc.projects.cancelScheduledDelete.useMutation();

        const onSubmit = async (
            values
        ) => {
            if (values.confirm) {
                await cancelScheduledDeletionMutation.mutateAsync();
            }
        };

        return currentProject ? (
            postPage.React.createElement('div', { className: sectionBoxClasses,}
                , postPage.React.createElement('form', {
                    onSubmit: handleSubmit(onSubmit),
                    className: "flex flex-col gap-4"  ,}

                    , postPage.React.createElement('h4', { className: sectionTitleClasses,}, "cancel scheduled deletion"

                    )

                    , postPage.React.createElement('p', { className: "prose",}, "This page is currently scheduled for deletion. At"
                               , " "
                        , postPage.React.createElement('strong', null
                            , postPage.DateTime_1.fromISO(
                                currentProject.deleteAfter
                            ).toLocaleString(postPage.DateTime_1.DATETIME_MED_WITH_WEEKDAY)
                        ), ", the waiting period will expire and at our next scheduled maintenance less than 24 hours later, its data will be permanently deleted. If you've changed your mind, or didn't intend to request the page's deletion, you can cancel the deletion here."





                    )

                    , postPage.React.createElement(SettingsRow, {
                        bigLabel: "Please check this checkbox to confirm."     ,
                        inputElement: 
                            postPage.React.createElement('input', {
                                type: "checkbox",
                                ...register("confirm", {
                                    required:
                                        "You must check the checkbox to confirm.",
                                }),
                                className: "rounded-checkbox",}
                            )
                        ,}
                    )

                    , postPage.React.createElement(FormSubmitButtonRow, {
                        submitMutation: cancelScheduledDeletionMutation,
                        submitButtonLabel: "cancel deletion" ,}
                    )
                )
            )
        ) : null;
    };

    const ScheduleForDeleteForm = () => {
        const project = postPage.useCurrentProject();

        if (project) {
            if (project.isSelfProject) {
                return (
                    postPage.React.createElement('div', { className: sectionBoxClasses,}
                        , postPage.React.createElement('h4', { className: sectionTitleClasses,}, "delete page" )

                        , postPage.React.createElement('p', { className: "prose",}, "You can't delete this page right now because it's your main page. However, in the"

                                , " "
                            , postPage.React.createElement('a', { href: postPage.sitemap.public.userSettings().toString(),}, "user settings"

                            ), ", you can change your main page to another page you edit, then delete this one."


                        )
                    )
                );
            } else {
                if (project.deleteAfter) {
                    return postPage.React.createElement(InnerCancelScheduledDeletionForm, null );
                } else {
                    return postPage.React.createElement(InnerScheduleForDeleteForm, null );
                }
            }
        } else return null;
    };

    const ProjectSettingsPage = () => {
        postPage.useRequiresLogin();

        const { data: project } = postPage.trpc.projects.currentProject.useQuery(undefined, {
            suspense: true,
        });
        const handle = project ? project.handle : "(unknown)";

        return (
            postPage.React.createElement('div', { className: "container mx-auto flex flex-grow flex-col"    ,}
                , postPage.React.createElement(postPage.Helmet, { title: "page settings" ,} )
                , postPage.React.createElement(postPage.ProfileView, {
                    project: project, // we're loading in a suspense so this will always be defined
                    canAccessPermissions: {
                        canEdit: postPage.AccessResult.Allowed,
                        canInteract: postPage.AccessResult.Allowed,
                        canRead: postPage.AccessResult.Allowed,
                        canShare: postPage.AccessResult.Allowed,
                    },}

                    , postPage.React.createElement('div', { className: "mt-4 flex w-full flex-col gap-6 lg:mt-0"     ,}
                        , postPage.React.createElement(postPage.InfoBox, {
                            level: "info",
                            textSize: "base",
                            className: "not-prose text-notBlack" ,}
    , "you can change settings which apply to @"
                                   , handle, " here. you can also change settings for other pages you edit by changing the active page in the menu."


                        )
                        , postPage.React.createElement(ProjectSettingsForm, null )
                        , postPage.React.createElement(FrequentlyUsedTagsForm, null )
                        , postPage.React.createElement(SilencedAndBlockedForm, null )
                        , postPage.React.createElement(HandleChangeForm, null )
                        , postPage.React.createElement(ScheduleForDeleteForm, null )
                    )
                )
            )
        );
    };

    exports.default = ProjectSettingsPage;

}));
