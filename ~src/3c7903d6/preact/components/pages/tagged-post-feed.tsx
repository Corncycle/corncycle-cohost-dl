import React, {
    FunctionComponent,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import { Helmet } from "react-helmet-async";
import { TagPageOpenGraph } from "../partials/opengraph";
import ProjectPostFeed, { ProjectPostFeedProps } from "./project-post-feed";
import { SidebarMenu } from "../sidebar-menu";
import { ResponsiveFormlet } from "../elements/responsive-formlet";
import { useUserInfo } from "../../providers/user-info-provider";
import { SwitchButton } from "../elements/switch-button";
import sitemap from "@/shared/sitemap";
import { HashtagIcon } from "@heroicons/react/20/solid";
import { TagLinkButton } from "../elements/tag-button";
import { t } from "i18next";
import { TokenInput } from "../token-input";
import { Controller, FieldError, useForm } from "react-hook-form";
import { trpc } from "@/client/lib/trpc";
import { useDynamicTheme } from "../../hooks/dynamic-theme";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import { tw } from "@/client/lib/tw-tagged-literal";
import { toast } from "react-hot-toast";
import TaggedPostFeedHeader from "../partials/tagged-post-feed.header";
import { useFlag } from "@unleash/proxy-client-react";
import { FeatureFlag } from "@/shared/types/feature-flags";
import { DevTool } from "@hookform/devtools";

export type TaggedPostFeedProps = Omit<
    ProjectPostFeedProps,
    "highlightedTags"
> & {
    tagName: string;
    show18PlusPosts: boolean;
    synonymsAndRelatedTags: readonly {
        content: string;
        relationship: "related" | "synonym";
    }[];
};

type RequestTagRelationInputs = {
    relatedTags: string[];
    reason: string;
};

export type ModalTagSuggestionDialogRef = {
    open: () => void;
};

const ModalTagSuggestionDialog = React.forwardRef<
    ModalTagSuggestionDialogRef,
    Pick<TaggedPostFeedProps, "tagName">
>((props, ref) => {
    const dynamicTheme = useDynamicTheme();
    const submitRequestMutation = trpc.tags.submitRelationRequest.useMutation();
    const [dialogRef, setDialogRef] = useState<HTMLDialogElement | null>(null);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { handleSubmit, control, formState, register, reset } =
        useForm<RequestTagRelationInputs>({
            defaultValues: {
                relatedTags: [props.tagName],
                reason: "",
            },
            mode: "onChange",
        });

    useImperativeHandle(ref, () => {
        return {
            open() {
                setIsDialogOpen(true);
            },
        };
    });

    async function onDialogSubmit(values: RequestTagRelationInputs) {
        try {
            await submitRequestMutation.mutateAsync({
                relatedTags: values.relatedTags,
                notes: values.reason,
            });

            toast.success(
                t(
                    "client:tag-relation-request.done",
                    "thanks for the suggestion!  we'll take a look."
                )
            );
            setIsDialogOpen(false);
            reset();
        } catch (e) {
            toast.error(
                t(
                    "client:tag-relation-request.error",
                    "error submitting suggestion.  try again in a moment."
                )
            );
        }
    }

    function onDialogCancel() {
        setIsDialogOpen(false);
        reset();
    }

    useEffect(() => {
        if (isDialogOpen && dialogRef?.open !== true) {
            // if (process.env.NODE_ENV === "production") {
            dialogRef?.showModal();
            // } else {
            //     // show non-modal so we can get to the dev tools
            //     dialogRef?.show();
            // }
        } else if (!isDialogOpen && dialogRef?.open === true) {
            dialogRef?.close();
        }
    }, [dialogRef, isDialogOpen]);

    return (
        <>
            <dialog
                ref={setDialogRef}
                data-theme={dynamicTheme.current}
                className="co-themed-box co-modal-box cohost-shadow-light
            dark:cohost-shadow-dark max-w-sm rounded-lg backdrop:bg-notBlack/90"
                //@ts-expect-error it's real, don't believe their lies
                onCancel={(e: Event) => {
                    e.preventDefault();
                    onDialogCancel();
                }}
            >
                <div className="co-report-like-title flex flex-row rounded-t-lg p-3">
                    <button className="h-6 w-6" onClick={onDialogCancel}>
                        <ChevronLeftIcon className="h-6 w-6" />
                    </button>

                    <div className="text-xl font-bold leading-6">
                        {t(
                            "client:tag-relation-request.dialog-title",
                            "send a tag suggestion"
                        )}
                    </div>
                </div>

                <form
                    className="flex flex-col p-3"
                    onSubmit={handleSubmit(onDialogSubmit)}
                >
                    <p className="co-ui-text font-bold">
                        which tags should be associated with each other?
                    </p>
                    <Controller
                        control={control}
                        name="relatedTags"
                        rules={{
                            validate: (tags) => {
                                return tags.length === 2
                                    ? true
                                    : "must choose exactly 2 tags!";
                            },
                        }}
                        render={({ field }) => (
                            <TokenInput
                                TokenIcon={HashtagIcon}
                                className="co-border-accent-primary rounded border p-2"
                                tokens={field.value}
                                setTokens={field.onChange}
                                getSuggestions={true}
                            />
                        )}
                    />
                    {formState.errors.relatedTags && (
                        <p className="text-red">
                            {
                                (
                                    formState.errors
                                        .relatedTags as unknown as FieldError
                                ).message
                            }
                        </p>
                    )}

                    <hr className="co-hairline my-3" />

                    <p className="co-ui-text font-bold">
                        why should these tags be associated?
                    </p>
                    <p className="co-ui-text text-xs">
                        Use the form below to provide more context.
                    </p>
                    <textarea
                        className="co-editable-body"
                        {...register("reason")}
                    />

                    <div className="mt-4 flex flex-row justify-end gap-2">
                        <button
                            type="submit"
                            disabled={!formState.isValid}
                            className={tw`co-filled-button rounded-lg px-3 py-2 font-bold`}
                        >
                            {t(
                                "client:tag-relation-request.submit",
                                "submit suggestion"
                            )}
                        </button>
                    </div>
                </form>
            </dialog>

            {process.env.NODE_ENV !== "production" ? (
                <DevTool control={control} />
            ) : null}
        </>
    );
});
ModalTagSuggestionDialog.displayName = "modal-tag-suggestion-dialog";

export const TaggedPostFeed: FunctionComponent<TaggedPostFeedProps> = (
    props
) => {
    const suggestionFormRef = useRef<ModalTagSuggestionDialogRef>(null);
    const userInfo = useUserInfo();
    const featureFlagEnabled = useFlag(
        FeatureFlag.Enum["tag-relation-request-ui"]
    );
    const relatedTags = props.synonymsAndRelatedTags.filter(
        (synrel) => synrel.relationship === "related"
    );
    const synonyms = props.synonymsAndRelatedTags
        .filter((synrel) => synrel.relationship === "synonym")
        .map((syn) => syn.content);

    const showRelatedTagsFormlet =
        relatedTags.length > 0 || (userInfo.loggedIn && featureFlagEnabled);

    return (
        <>
            <Helmet title={`#${props.tagName}`} />

            <ModalTagSuggestionDialog
                ref={suggestionFormRef}
                tagName={props.tagName}
            />

            <main className="container mx-auto grid w-full grid-cols-1 gap-x-16 gap-y-8 pb-20 pt-8 lg:grid-cols-4 lg:pt-16">
                <SidebarMenu />

                {/* right rail */}
                <div className="flex flex-col gap-y-8 lg:order-3">
                    {userInfo.loggedIn ? (
                        <ResponsiveFormlet title="view settings">
                            <div className="mx-auto my-4 flex w-full flex-col items-center">
                                <SwitchButton
                                    label="show 18+ posts"
                                    buttonSize="regular"
                                    onChange={() =>
                                        location.assign(
                                            sitemap.public
                                                .tags({
                                                    tagSlug: props.tagName,
                                                    show18PlusPosts:
                                                        !props.show18PlusPosts,
                                                })
                                                .toString()
                                        )
                                    }
                                    initial={props.show18PlusPosts}
                                />
                            </div>
                        </ResponsiveFormlet>
                    ) : null}

                    {showRelatedTagsFormlet ? (
                        <ResponsiveFormlet title="related tags">
                            <div className="flex flex-col items-center pt-2">
                                {relatedTags.length > 0 ? (
                                    <>
                                        <div className="flex flex-row flex-wrap gap-x-2.5 gap-y-3 p-3">
                                            {relatedTags.map((tag) => (
                                                <TagLinkButton
                                                    key={tag.content}
                                                    TagIcon={HashtagIcon}
                                                    MouseoverTagIcon={null}
                                                    tagText={tag.content}
                                                    href={sitemap.public
                                                        .tags({
                                                            tagSlug:
                                                                tag.content,
                                                            show18PlusPosts:
                                                                props.show18PlusPosts,
                                                        })
                                                        .toString()}
                                                />
                                            ))}
                                        </div>

                                        {userInfo.loggedIn &&
                                        featureFlagEnabled ? (
                                            <button
                                                className="co-link-button-disabled mb-1 text-sm underline"
                                                onClick={() =>
                                                    suggestionFormRef.current?.open()
                                                }
                                            >
                                                suggest related tag
                                            </button>
                                        ) : null}
                                    </>
                                ) : (
                                    <>
                                        {userInfo.loggedIn &&
                                        featureFlagEnabled ? (
                                            <button
                                                className="co-link-button mb-1 text-sm underline"
                                                onClick={() =>
                                                    suggestionFormRef.current?.open()
                                                }
                                            >
                                                no tags yet! suggest related
                                                tag?
                                            </button>
                                        ) : null}
                                    </>
                                )}
                            </div>
                        </ResponsiveFormlet>
                    ) : null}
                </div>

                {/* main content box */}
                <section className="order-3 col-span-1 lg:order-2 lg:col-span-2">
                    <ProjectPostFeed
                        bare={true}
                        highlightedTags={synonyms}
                        {...props}
                    >
                        <TagPageOpenGraph tagName={props.tagName} />
                        <TaggedPostFeedHeader
                            tagName={props.tagName}
                            synonymsAndRelatedTags={
                                props.synonymsAndRelatedTags
                            }
                            modalSuggestionDialogRef={suggestionFormRef}
                        />
                    </ProjectPostFeed>
                </section>
            </main>
        </>
    );
};

export default TaggedPostFeed;
TaggedPostFeed.displayName = "tagged-post-feed";
