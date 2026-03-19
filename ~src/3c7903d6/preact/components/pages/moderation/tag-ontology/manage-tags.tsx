import { trpc } from "@/client/lib/trpc";
import { TagId } from "@/shared/types/ids";
import _ from "lodash";
import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useState,
    useTransition,
} from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { BasicButton } from "../../../elements/basic-button";
import { Button } from "../../../elements/button";
import { TokenInput } from "../../../token-input";
import { HashtagIcon } from "@heroicons/react/20/solid";
import { useSearchParams } from "react-router-dom";
import sitemap from "@/shared/sitemap";

type SearchInputs = {
    content: string;
};

type AddRelatedTagsByContentInputs = {
    relatedTags: string[];
};

type AddRelatedByIdInputs = {
    relatedTagId: TagId;
};

type SetPrimaryByContentInputs = {
    primaryTag: string[];
};

type SetPrimaryByIdInputs = {
    primaryTagId: TagId;
};

type AddSynonymsByContentInputs = {
    synonyms: string[];
};

type AddSynonymByIdInputs = {
    synonymTagId: TagId;
};

const TagSearch: FunctionComponent<{
    onTagSelected: (tagId: TagId) => void;
}> = ({ onTagSelected }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchToken, setSearchToken] = useState<string>(
        () => searchParams.get("content") ?? ""
    );

    const { data: searchResults } = trpc.moderation.tag.search.useQuery(
        { query: searchToken },
        {
            suspense: true,
            enabled: !!searchToken,
        }
    );

    const [, startTransition] = useTransition();

    const { register: registerSearch, handleSubmit: handleSubmitSearch } =
        useForm<SearchInputs>({
            defaultValues: {
                content: searchToken,
            },
        });

    const onSearch: SubmitHandler<SearchInputs> = (data) => {
        startTransition(() => {
            setSearchToken(data.content);
            setSearchParams(
                (params) => {
                    params.set("content", data.content);
                    return params;
                },
                {
                    replace: true,
                }
            );
        });
    };

    return (
        <>
            <form onSubmit={handleSubmitSearch(onSearch)}>
                search for tags by content:
                <input type="text" {...registerSearch("content")} />
                <BasicButton
                    type="submit"
                    buttonSize="regular"
                    buttonColor="cherry"
                >
                    submit
                </BasicButton>
            </form>

            {searchResults ? (
                <table className="prose">
                    <thead>
                        <tr>
                            <td>
                                <strong>tag ID</strong>
                            </td>
                            <td>
                                <strong>tag content</strong>
                            </td>
                            <td>
                                <strong>primary synonym</strong>
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        {searchResults.map((tag) => (
                            <tr key={tag.tagId}>
                                <td>
                                    <Button
                                        onClick={() => onTagSelected(tag.tagId)}
                                        buttonStyle="pill"
                                        color="cherry"
                                    >
                                        {tag.tagId}
                                    </Button>
                                </td>
                                <td>
                                    <a
                                        href={sitemap.public
                                            .tags({ tagSlug: tag.content })
                                            .toString()}
                                        target="_blank"
                                        rel="noopener"
                                    >
                                        #{tag.content}
                                    </a>
                                </td>
                                <td>
                                    <a
                                        href={sitemap.public
                                            .tags({
                                                tagSlug:
                                                    tag.primarySynonymContent,
                                            })
                                            .toString()}
                                        target="_blank"
                                        rel="noopener"
                                    >
                                        #{tag.primarySynonymContent}
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : null}
        </>
    );
};

const TagDetails: FunctionComponent<{
    tagId: TagId;
    onTagSelected: (tagId: TagId) => void;
}> = ({ tagId, onTagSelected }) => {
    const { data: tagDetails } = trpc.moderation.tag.getById.useQuery(
        { tagId },
        {
            suspense: true,
            enabled: !!tagId,
        }
    );
    const resetPrimarySynonymMutation =
        trpc.moderation.tag.resetPrimarySynonym.useMutation();

    const synonymsAndRelatedTags = tagDetails
        ? _(tagDetails.relatedTags)
              .filter((tag) => tag.tagId !== tagDetails.tagId)
              .groupBy((tag) => tag.relationship)
              .value()
        : {};
    const synonyms = synonymsAndRelatedTags["synonym"] ?? [];
    const relatedTags = synonymsAndRelatedTags["related"] ?? [];

    if (!tagDetails) {
        return null;
    }

    return (
        <>
            <h2 className="text-3xl">
                manage tag ID {tagDetails.tagId} (#
                {tagDetails.content})
            </h2>

            <table>
                <tbody>
                    <tr>
                        <td>tag ID</td>
                        <td>{tagDetails.tagId}</td>
                    </tr>
                    <tr>
                        <td>tag content</td>
                        <td>
                            <a
                                href={sitemap.public
                                    .tags({ tagSlug: tagDetails.content })
                                    .toString()}
                                target="_blank"
                                rel="noopener"
                            >
                                {tagDetails.content}
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td>primary synonym</td>
                        <td>
                            {tagDetails.primarySynonym ? (
                                <Button
                                    onClick={() =>
                                        onTagSelected(
                                            tagDetails.primarySynonym!.tagId
                                        )
                                    }
                                    buttonStyle="pill"
                                    color="cherry"
                                >
                                    {tagDetails.primarySynonym.tagId} (#
                                    {tagDetails.primarySynonym.content})
                                </Button>
                            ) : (
                                "\u2014"
                            )}
                            &nbsp;
                            {tagDetails.primarySynonym?.tagId !==
                            tagDetails.tagId ? (
                                <Button
                                    onClick={() => {
                                        resetPrimarySynonymMutation.mutate({
                                            tagId,
                                        });
                                        location.reload();
                                    }}
                                    buttonStyle="pill"
                                    color="red"
                                >
                                    reset
                                </Button>
                            ) : null}
                        </td>
                    </tr>
                    <tr>
                        <td>other synonyms</td>
                        <td>
                            <ul>
                                {synonyms.length > 0
                                    ? synonyms.map((tag) => (
                                          <li key={tag.tagId}>
                                              <Button
                                                  onClick={() =>
                                                      onTagSelected(tag.tagId)
                                                  }
                                                  buttonStyle="pill"
                                                  color="cherry"
                                              >
                                                  {tag.tagId} (#
                                                  {tag.content})
                                              </Button>
                                          </li>
                                      ))
                                    : "\u2014"}
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td>related tags</td>
                        <td>
                            <ul>
                                {relatedTags.length > 0
                                    ? relatedTags.map((tag) => (
                                          <li key={tag.tagId}>
                                              <Button
                                                  onClick={() =>
                                                      onTagSelected(tag.tagId)
                                                  }
                                                  buttonStyle="pill"
                                                  color="cherry"
                                              >
                                                  {tag.tagId} (#
                                                  {tag.content})
                                              </Button>
                                          </li>
                                      ))
                                    : "\u2014"}
                            </ul>
                        </td>
                    </tr>
                </tbody>
            </table>

            <hr />

            <h2>modify by content</h2>

            <SetPrimarySynonymByContentForm
                tagId={tagDetails.tagId}
                tagContent={tagDetails.content}
            />

            <hr />

            <AddSynonymsByContentForm
                tagId={tagId}
                tagContent={tagDetails.content}
            />

            <hr />

            <AddRelatedTagsByContentForm
                tagId={tagId}
                tagContent={tagDetails.content}
            />

            <hr />

            <details>
                <summary>
                    <h2 className="inline-block">modify by ID</h2>
                </summary>

                <SetPrimarySynonymByIdForm
                    tagId={tagDetails.tagId}
                    tagContent={tagDetails.content}
                />

                <hr />

                <AddSynonymByIdForm
                    tagId={tagId}
                    tagContent={tagDetails.content}
                />

                <hr />

                <AddRelatedTagByIdForm
                    tagId={tagId}
                    tagContent={tagDetails.content}
                />
            </details>
        </>
    );
};

const SetPrimarySynonymByContentForm: FunctionComponent<{
    tagId: TagId;
    tagContent: string;
}> = ({ tagId, tagContent }) => {
    const utils = trpc.useContext();

    const createSynonymMutation = trpc.moderation.tag.createSynonym.useMutation(
        {}
    );

    const { handleSubmit: handleSubmitSetPrimary, control: controlSetPrimary } =
        useForm<SetPrimaryByContentInputs>({
            defaultValues: {
                primaryTag: [],
            },
        });

    const onSetPrimary: SubmitHandler<SetPrimaryByContentInputs> = async (
        data
    ) => {
        const primarySynonym = await utils.moderation.tag.getByContent.fetch({
            content: data.primaryTag[0],
        });

        await createSynonymMutation.mutateAsync({
            primarySynonymId: primarySynonym.tagId,
            otherTagId: tagId,
        });

        location.reload();
    };

    return (
        <form onSubmit={handleSubmitSetPrimary(onSetPrimary)}>
            <h3 className="text-xl">set new primary tag for #{tagContent}</h3>

            <p>uses the first tag</p>
            <div className="not-prose flex flex-col rounded-lg border border-gray-500 p-3">
                <Controller
                    control={controlSetPrimary}
                    name="primaryTag"
                    render={({ field }) => (
                        <TokenInput
                            TokenIcon={HashtagIcon}
                            setTokens={field.onChange}
                            tokens={field.value}
                            getSuggestions={true}
                            placeholder="Pick a tag!"
                        />
                    )}
                />
            </div>

            <BasicButton
                type="submit"
                buttonSize="regular"
                buttonColor="cherry"
            >
                set
            </BasicButton>
        </form>
    );
};

const SetPrimarySynonymByIdForm: FunctionComponent<{
    tagId: TagId;
    tagContent: string;
}> = ({ tagId, tagContent }) => {
    const createSynonymMutation = trpc.moderation.tag.createSynonym.useMutation(
        {}
    );

    const { handleSubmit: handleSubmitSetPrimary, register } =
        useForm<SetPrimaryByIdInputs>({
            defaultValues: {
                primaryTagId: "" as TagId,
            },
        });

    const onSetPrimary: SubmitHandler<SetPrimaryByIdInputs> = async (data) => {
        await createSynonymMutation.mutateAsync({
            primarySynonymId: data.primaryTagId as TagId,
            otherTagId: tagId,
        });

        location.reload();
    };

    return (
        <form onSubmit={handleSubmitSetPrimary(onSetPrimary)}>
            <h3 className="text-xl">set new primary tag for #{tagContent}</h3>

            <div className="not-prose flex flex-col rounded-lg border border-gray-500 p-3">
                <label>
                    primary tag ID
                    <input type="number" {...register("primaryTagId")} />
                </label>
            </div>

            <BasicButton
                type="submit"
                buttonSize="regular"
                buttonColor="cherry"
            >
                set
            </BasicButton>
        </form>
    );
};

const AddSynonymsByContentForm: FunctionComponent<{
    tagId: TagId;
    tagContent: string;
}> = ({ tagId, tagContent }) => {
    const createSynonymMutation = trpc.moderation.tag.createSynonym.useMutation(
        {}
    );

    const utils = trpc.useContext();

    const {
        handleSubmit: handleSubmitAddSynonyms,
        control: controlAddSynonyms,
    } = useForm<AddSynonymsByContentInputs>({
        defaultValues: {
            synonyms: [],
        },
    });

    const onAddSynonyms: SubmitHandler<AddSynonymsByContentInputs> = async (
        data
    ) => {
        await Promise.all(
            data.synonyms.map((content) =>
                utils.moderation.tag.getByContent
                    .fetch({ content })
                    .then((tag) =>
                        createSynonymMutation.mutateAsync({
                            primarySynonymId: tagId,
                            otherTagId: tag.tagId,
                        })
                    )
            )
        );

        location.reload();
    };

    return (
        <form onSubmit={handleSubmitAddSynonyms(onAddSynonyms)}>
            <h3 className="text-xl">add child synonyms for #{tagContent}</h3>

            <div className="not-prose flex flex-col rounded-lg border border-gray-500 p-3">
                <Controller
                    control={controlAddSynonyms}
                    name="synonyms"
                    render={({ field }) => (
                        <TokenInput
                            TokenIcon={HashtagIcon}
                            setTokens={field.onChange}
                            tokens={field.value}
                            getSuggestions={true}
                            placeholder="Pick a tag!"
                        />
                    )}
                />
            </div>

            <BasicButton
                type="submit"
                buttonSize="regular"
                buttonColor="cherry"
            >
                add
            </BasicButton>
        </form>
    );
};

const AddSynonymByIdForm: FunctionComponent<{
    tagId: TagId;
    tagContent: string;
}> = ({ tagId, tagContent }) => {
    const createSynonymMutation = trpc.moderation.tag.createSynonym.useMutation(
        {}
    );

    const { handleSubmit: handleSubmitAddSynonyms, register } =
        useForm<AddSynonymByIdInputs>({
            defaultValues: {
                synonymTagId: "" as TagId,
            },
        });

    const onAddSynonyms: SubmitHandler<AddSynonymByIdInputs> = async (data) => {
        await createSynonymMutation.mutateAsync({
            primarySynonymId: tagId,
            otherTagId: data.synonymTagId as TagId,
        });

        location.reload();
    };

    return (
        <form onSubmit={handleSubmitAddSynonyms(onAddSynonyms)}>
            <h3 className="text-xl">add child synonym for #{tagContent}</h3>

            <div className="not-prose flex flex-col rounded-lg border border-gray-500 p-3">
                <label>
                    child synonym tag ID
                    <input type="number" {...register("synonymTagId")} />
                </label>
            </div>

            <BasicButton
                type="submit"
                buttonSize="regular"
                buttonColor="cherry"
            >
                add
            </BasicButton>
        </form>
    );
};

const AddRelatedTagsByContentForm: FunctionComponent<{
    tagId: TagId;
    tagContent: string;
}> = ({ tagId, tagContent }) => {
    const createRelationMutation =
        trpc.moderation.tag.createRelation.useMutation({});

    const utils = trpc.useContext();

    const { handleSubmit, control } = useForm<AddRelatedTagsByContentInputs>({
        defaultValues: {
            relatedTags: [],
        },
    });

    const onAddRelatedTags: SubmitHandler<
        AddRelatedTagsByContentInputs
    > = async (data) => {
        await Promise.all(
            data.relatedTags.map((content) =>
                utils.moderation.tag.getByContent
                    .fetch({ content })
                    .then((tag) =>
                        createRelationMutation.mutateAsync({
                            tagIdA: tagId,
                            tagIdB: tag.tagId,
                        })
                    )
            )
        );

        location.reload();
    };

    return (
        <form onSubmit={handleSubmit(onAddRelatedTags)}>
            <h3 className="text-xl">add a related tag to #{tagContent}</h3>

            <div className="not-prose flex flex-col rounded-lg border border-gray-500 p-3">
                <Controller
                    control={control}
                    name="relatedTags"
                    render={({ field }) => (
                        <TokenInput
                            TokenIcon={HashtagIcon}
                            setTokens={field.onChange}
                            tokens={field.value}
                            getSuggestions={true}
                            placeholder="Pick a tag!"
                        />
                    )}
                />
            </div>
            <BasicButton
                type="submit"
                buttonSize="regular"
                buttonColor="cherry"
            >
                add
            </BasicButton>
        </form>
    );
};

const AddRelatedTagByIdForm: FunctionComponent<{
    tagId: TagId;
    tagContent: string;
}> = ({ tagId, tagContent }) => {
    const createRelationMutation =
        trpc.moderation.tag.createRelation.useMutation({});

    const { handleSubmit, register } = useForm<AddRelatedByIdInputs>({
        defaultValues: {
            relatedTagId: "" as TagId,
        },
    });

    const onAddRelatedTags: SubmitHandler<AddRelatedByIdInputs> = async (
        data
    ) => {
        await createRelationMutation.mutateAsync({
            tagIdA: tagId,
            tagIdB: data.relatedTagId as TagId,
        });

        location.reload();
    };

    return (
        <form onSubmit={handleSubmit(onAddRelatedTags)}>
            <h3 className="text-xl">add a related tag to #{tagContent}</h3>

            <div className="not-prose flex flex-col rounded-lg border border-gray-500 p-3">
                <label>
                    related tag ID
                    <input type="number" {...register("relatedTagId")} />
                </label>
            </div>
            <BasicButton
                type="submit"
                buttonSize="regular"
                buttonColor="cherry"
            >
                add
            </BasicButton>
        </form>
    );
};

export const TagOntologyManageTagsPage: FunctionComponent = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [detailsTagId, setDetailsTagId] = useState<TagId>(
        () => (searchParams.get("tagId") ?? "") as TagId
    );

    const [, startTransition] = useTransition();

    const onSelectTagId = useCallback(
        (tagId: TagId) => {
            startTransition(() => {
                setDetailsTagId(tagId);
                setSearchParams(
                    (params) => {
                        params.set("tagId", tagId);
                        return params;
                    },
                    {
                        replace: true,
                    }
                );
            });
        },
        [setSearchParams]
    );

    return (
        <div
            className="cohost-shadow-light dark:cohost-shadow-dark container
                mx-auto mt-12 flex flex-col gap-4 rounded-lg bg-notWhite p-3 text-notBlack"
        >
            <div className="prose">
                <h1 className="text-4xl">manage tags</h1>

                <TagSearch onTagSelected={onSelectTagId} />

                <hr />

                <TagDetails
                    tagId={detailsTagId}
                    onTagSelected={onSelectTagId}
                />
            </div>
        </div>
    );
};

export default TagOntologyManageTagsPage;
