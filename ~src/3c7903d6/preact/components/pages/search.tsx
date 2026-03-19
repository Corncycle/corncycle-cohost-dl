import sitemap from "@/shared/sitemap";
import React, {
    FunctionComponent,
    Suspense,
    useCallback,
    useState,
    useTransition,
} from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import { useProjectSearch, useTagSearch } from "../../hooks/search";
import { ProjectCard } from "../partials/project-card";
import { BookmarkTagButton } from "../partials/tagged-post-feed.header";
import { SidebarMenu } from "../sidebar-menu";

export const SearchPage: FunctionComponent = () => {
    return (
        <main className="w-full pt-16">
            <div className="container mx-auto grid grid-cols-1 gap-16 lg:grid-cols-4">
                <SidebarMenu />
                <section className="col-span-1 flex flex-col gap-12 lg:col-span-2">
                    <div className="rounded-lg bg-notWhite p-3 text-notBlack">
                        <Suspense>
                            <SearchResults />
                        </Suspense>
                    </div>
                </section>
            </div>
        </main>
    );
};

const SearchResults: FunctionComponent = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [query, setQuery] = useState<string>(
        () => searchParams.get("q") ?? ""
    );
    const [searchToken, setSearchToken] = useState<string>(() => query);
    const [, startTransition] = useTransition();

    const projectResults = useProjectSearch(searchToken, {});
    const tagResults = useTagSearch(searchToken);

    const onChangeQuery = useCallback<
        React.ChangeEventHandler<HTMLInputElement>
    >(
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
        <>
            <Helmet title={`search: ${query}`} />
            <div className="flex flex-col gap-4">
                <h1 className="h2">search</h1>
                {/* if we've got js, that's great! we're updating on keystrokes
                anyway. if we don't, the form should still work by changing the
                query string. */}
                <form method="get" onSubmit={(e) => e.preventDefault()}>
                    <input
                        type="text"
                        name="q"
                        placeholder="search for pages and tags!"
                        className="w-full"
                        value={query}
                        onChange={onChangeQuery}
                    />
                </form>

                {!searchToken || searchToken.length < 3 ? (
                    <p className="h5">enter a query to see results!</p>
                ) : null}

                {searchToken && searchToken.length >= 3 ? (
                    <>
                        <div className="mt-4">
                            <h2 className="h5">pages</h2>
                            <div className="flex w-full flex-col gap-4">
                                {projectResults.projects?.length ? (
                                    projectResults.projects?.map((project) => (
                                        <ProjectCard
                                            project={project}
                                            key={project.projectId}
                                        />
                                    ))
                                ) : (
                                    <p className="h6">No pages found!</p>
                                )}
                            </div>
                        </div>

                        <hr className="my-4" />

                        <div>
                            <h2 className="h5">tags</h2>
                            {tagResults.suggestions?.result.length ? (
                                <div className="mt-4 flex flex-col gap-2">
                                    {tagResults.suggestions?.result?.map(
                                        (tag) => (
                                            <div
                                                key={tag.content}
                                                className="flex flex-row justify-between gap-3"
                                            >
                                                <a
                                                    href={sitemap.public
                                                        .tags({
                                                            tagSlug:
                                                                tag.content,
                                                        })
                                                        .toString()}
                                                    className="underline before:content-['#']"
                                                >
                                                    {tag.content}
                                                </a>
                                                <BookmarkTagButton
                                                    tagName={tag.content}
                                                />
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : (
                                <p className="h6">No tags found!</p>
                            )}
                        </div>
                    </>
                ) : null}
            </div>
        </>
    );
};

export default SearchPage;
