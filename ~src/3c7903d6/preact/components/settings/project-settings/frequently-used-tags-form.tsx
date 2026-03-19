import { trpc } from "@/client/lib/trpc";
import { HashtagIcon } from "@heroicons/react/20/solid";
import React, { FunctionComponent } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { InfoBox } from "../../elements/info-box";
import { sectionBoxClasses, sectionTitleClasses } from "../shared";
import { TokenInput } from "../../token-input";
import { AuthnButton } from "../../partials/authn-button";
import classNames from "classnames";

type Inputs = {
    tagsToDisplay: string[];
};

export const FrequentlyUsedTagsForm: FunctionComponent = () => {
    const { data: tagOptionData } =
        trpc.projects.frequentlyUsedTags.query.useQuery(undefined, {
            suspense: true,
        });

    const { data: project } = trpc.projects.currentProject.useQuery(undefined, {
        suspense: true,
    });
    const utils = trpc.useContext();

    const tagOptions = tagOptionData?.tags.map((tag) => tag.content) ?? [];

    const mutateFrequentlyUsedTags =
        trpc.projects.frequentlyUsedTags.mutation.useMutation();
    const { handleSubmit, control } = useForm<Inputs>({
        defaultValues: {
            tagsToDisplay: project?.frequentlyUsedTags ?? [],
        },
    });

    const onSubmit: SubmitHandler<Inputs> = async (values) => {
        await mutateFrequentlyUsedTags.mutateAsync({
            tags: values.tagsToDisplay,
        });
        await utils.projects.currentProject.invalidate();
    };

    return (
        <div
            // FIXME: theme forced to light here because we haven't rethemed the rest of the site yet
            data-theme="light"
            className={classNames("co-themed-box", sectionBoxClasses)}
        >
            <form
                className="flex flex-col gap-4"
                onSubmit={handleSubmit(onSubmit)}
            >
                <h4 className={sectionTitleClasses}>pinned tags</h4>

                <InfoBox level="info">
                    You can pin any of your top 15 most used tags to showcase on
                    your page! This gives your readers easy access to a page
                    with just your posts in that tag, as well as a good way to
                    tell other users what sort of things they can expect!
                </InfoBox>

                <div className="flex flex-col">
                    <Controller
                        control={control}
                        name="tagsToDisplay"
                        render={({ field }) => (
                            <TokenInput
                                TokenIcon={HashtagIcon}
                                setTokens={field.onChange}
                                tokens={field.value}
                                getSuggestions={false}
                                placeholder="Pick some tags!"
                                customSuggestions={tagOptions}
                            />
                        )}
                    />
                </div>

                <div className="flex w-full flex-row items-center justify-end gap-4 font-bold text-notWhite">
                    {mutateFrequentlyUsedTags.isSuccess ? (
                        <p className="text-green">saved!</p>
                    ) : null}
                    {mutateFrequentlyUsedTags.isError ? (
                        <p className="text-red">
                            {mutateFrequentlyUsedTags.error.message}
                        </p>
                    ) : null}

                    <AuthnButton
                        type="submit"
                        disabled={mutateFrequentlyUsedTags.isLoading}
                        className="font-bold"
                    >
                        save tags
                    </AuthnButton>
                </div>
            </form>
        </div>
    );
};
