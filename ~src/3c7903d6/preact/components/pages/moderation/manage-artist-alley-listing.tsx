import { ModWireArtistAlley } from "@/shared/types/artist-alley";
import { WireProjectModelModeratorExtensions } from "@/shared/types/projects";
import { WireUserModel } from "@/shared/types/wire-models";
import React, { FunctionComponent, useCallback } from "react";
import { ArtistAlleyListing } from "../../artist-alley/artist-alley-listing";
import sitemap from "@/shared/sitemap";
import { trpc } from "@/client/lib/trpc";
import { SubmitHandler, useForm } from "react-hook-form";
import { ControllableExpandingTextArea } from "../../expanding-text-area";
import { StyledInput } from "../../elements/styled-input";
import { TokenMultiSelect } from "../../elements/token-multi-select";
import { useDynamicTheme } from "@/client/preact/hooks/dynamic-theme";

type ManageArtistAlleyListingPageProps = {
    project: WireProjectModelModeratorExtensions;
    user: WireUserModel;
    listing: ModWireArtistAlley;
};

type Inputs = {
    body: string;
    adult: boolean;
    ctaText: string;
    ctaLink: string;
    categories: string[];
};

export const ManageArtistAlleyListingPage: FunctionComponent<
    ManageArtistAlleyListingPageProps
> = ({ project, user, listing }) => {
    const updateListingMutation =
        trpc.artistAlley.moderator.updateListing.useMutation();
    const allCategories = trpc.artistAlley.getCategories.useQuery();

    const {
        control,
        register,
        handleSubmit,
        trigger,
        watch,
        setValue,
        setError,
        formState,
        clearErrors,
        getValues,
    } = useForm<Inputs>({
        defaultValues: {
            body: listing.body,
            adult: listing.adultContent,
            ctaText: listing.cta.text,
            ctaLink: listing.cta.link,
            categories: listing.categories,
        },
    });

    const onSubmit: SubmitHandler<Inputs> = useCallback(
        async (data) => {
            await updateListingMutation.mutateAsync({
                id: listing.id,
                body: data.body,
                adult: data.adult,
                ctaText: data.ctaText,
                ctaLink: data.ctaLink,
                categories: data.categories,
            });

            location.reload();
        },
        [updateListingMutation]
    );

    const theme = useDynamicTheme();

    return (
        <div
            className="co-themed-box co-settings container mx-auto mt-12 flex flex-col gap-4 rounded-lg p-3"
            data-theme={theme.current}
        >
            <h1 className="text-4xl font-bold">manage artist alley listing</h1>

            <div className="co-prose prose flex w-full flex-row gap-4 p-3">
                <div>
                    <div className="w-[300px] max-w-[300px]">
                        <ArtistAlleyListing
                            listing={listing}
                            project={project}
                        />
                    </div>

                    <div className="flex-shrink">
                        <ul>
                            <li>
                                user: {user.email} (
                                <a
                                    href={sitemap.public.moderation
                                        .manageUser({
                                            userId: user.userId,
                                        })
                                        .toString()}
                                >
                                    manage
                                </a>
                                )
                            </li>
                            <li>
                                project: {project.handle} (
                                <a
                                    href={sitemap.public.moderation
                                        .manageProject({
                                            projectHandle: project.handle,
                                        })
                                        .toString()}
                                >
                                    manage
                                </a>
                                )
                            </li>
                            <li>listing: {listing.id}</li>
                            <li>created at: {listing.createdAt}</li>
                            <li>num weeks: {listing.numWeeks}</li>
                            <li>status: {listing.status}</li>
                            <li>
                                payment status:{" "}
                                <a
                                    href={`https://dashboard.stripe.com/payments/${listing.stripePaymentIntentId}`}
                                >
                                    {listing.paymentStatus}
                                </a>
                            </li>
                            <li>
                                notes:
                                <br />
                                <blockquote>{listing.notes}</blockquote>
                            </li>
                        </ul>
                    </div>
                </div>

                <div>
                    <h4 className="h4">edit listing</h4>

                    <form
                        className="flex flex-col gap-4"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <label>
                            body
                            <ControllableExpandingTextArea
                                control={control}
                                name="body"
                                minRows={4}
                                autoComplete="off"
                                className="co-styled-input rounded-lg border-2"
                            />
                        </label>

                        <label>
                            CTA text
                            <StyledInput
                                control={control}
                                name="ctaText"
                                trigger={trigger}
                                type="text"
                                style="dynamic"
                            />
                        </label>

                        <label>
                            CTA link
                            <StyledInput
                                control={control}
                                name="ctaLink"
                                trigger={trigger}
                                type="text"
                                style="dynamic"
                            />
                        </label>

                        <label>
                            categories
                            <TokenMultiSelect
                                control={control}
                                name="categories"
                                options={allCategories.data ?? []}
                            />
                        </label>

                        <label>
                            adult content
                            <input
                                type="checkbox"
                                {...register("adult")}
                                className="rounded-checkbox ml-3"
                            />
                        </label>

                        <button
                            className="co-filled-button rounded-lg px-3 py-2.5 font-bold"
                            type="submit"
                            disabled={formState.isSubmitting}
                        >
                            submit edits
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

ManageArtistAlleyListingPage.displayName =
    "moderation/manage-artist-alley-listing";
export default ManageArtistAlleyListingPage;
