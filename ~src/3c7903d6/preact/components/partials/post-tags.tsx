import { tw } from "@/client/lib/tw-tagged-literal";
import sitemap, { patterns } from "@/shared/sitemap";
import { ProjectHandle } from "@/shared/types/ids";
import React, {
    FunctionComponent,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useMatch } from "react-router-dom";
import { useBookmarkedTags } from "../../hooks/data-loaders";

type PostTagsProps = {
    tags: string[];
    highlightedTags: readonly string[];
};

type PageType =
    | "profile"
    | "singlePost"
    | "tag"
    | "projectTag"
    | "bookmarked"
    | false;
const usePageType = (): {
    pageType: PageType;
    handle: ProjectHandle | undefined;
    tagSlug: string | undefined;
} => {
    const isProfilePage = useMatch(patterns.public.project.mainAppProfile);
    const isSinglePostPage = useMatch(
        patterns.public.project.singlePost.published
    );
    const isTagPage = useMatch(patterns.public.tags);
    const isProjectTagPage = useMatch(patterns.public.project.tags);
    const isBookmarkedTagPage = useMatch(patterns.public.bookmarkedTagFeed);

    if (isProfilePage) {
        return {
            pageType: "profile",
            handle: isProfilePage.params.projectHandle as ProjectHandle,
            tagSlug: undefined,
        };
    } else if (isSinglePostPage) {
        return {
            pageType: "singlePost",
            handle: isSinglePostPage.params.projectHandle as ProjectHandle,
            tagSlug: undefined,
        };
    } else if (isTagPage) {
        return {
            pageType: "tag",
            handle: undefined,
            tagSlug: isTagPage.params.tagSlug,
        };
    } else if (isProjectTagPage) {
        return {
            pageType: "projectTag",
            handle: isProjectTagPage.params.projectHandle as ProjectHandle,
            tagSlug: isProjectTagPage.params.tagSlug,
        };
    } else if (isBookmarkedTagPage) {
        return {
            pageType: "bookmarked",
            handle: undefined,
            tagSlug: undefined,
        };
    }

    return { pageType: false, handle: undefined, tagSlug: undefined };
};

export const PostTags: FunctionComponent<PostTagsProps> = ({
    tags,
    highlightedTags,
}) => {
    const { t } = useTranslation();

    const tagListRef = useRef<HTMLDivElement>(null);

    // default expanded to `false` so that the max height gets set correctly and
    // we can actually run layout correctly.
    const [expanded, setExpanded] = useState(false);
    const hasRunLayout = useRef(false);
    const toggleExpanded = () => setExpanded(!expanded);
    const page = usePageType();
    const bookmarkedTags =
        useBookmarkedTags([], page.pageType === "bookmarked").data?.tags ?? [];

    useEffect(() => {
        if (!hasRunLayout.current && tagListRef.current) {
            setExpanded(
                tagListRef.current.scrollHeight <=
                    tagListRef.current.clientHeight
            );
            hasRunLayout.current = true;
        }
    }, [tagListRef]);

    // FIXME: despite our best efforts, it's possible for empty tags to sneak
    // into the db; until we have a permanent fix, filter out any empty tags
    // attached to this post and don't attempt to render them, which causes
    // path-to-regex to choke
    const filteredTags = tags.filter((tag) => tag != "");

    return filteredTags.length ? (
        <div className="w-full max-w-full p-3">
            <div
                ref={tagListRef}
                className={tw`co-tags relative w-full overflow-y-hidden break-words leading-none ${
                    expanded ? "" : "max-h-[60px]" // line-height is 20px, gets us 3 lines
                }`}
            >
                <div>
                    {filteredTags.map((tag) => (
                        <a
                            key={tag}
                            className={`mr-2 inline-block text-sm hover:underline ${
                                // bold bookmarked tags when we're on the feed
                                highlightedTags.includes(tag) ? "font-bold" : ""
                            } ${
                                // bold the current tag if we're on a tag page
                                page.tagSlug === tag ? "font-bold" : ""
                            }`}
                            href={
                                page.handle
                                    ? sitemap.public.project
                                          .tags({
                                              tagSlug: tag,
                                              projectHandle: page.handle,
                                          })
                                          .toString()
                                    : sitemap.public
                                          .tags({ tagSlug: tag })
                                          .toString()
                            }
                        >
                            #{tag}
                        </a>
                    ))}
                </div>
                {!expanded ? (
                    <div className="absolute bottom-0 right-2 flex h-5">
                        <span className="co-from-body inline-block h-full bg-gradient-to-l pl-4" />
                        <button
                            onClick={toggleExpanded}
                            className="co-tags co-opaque inline-block cursor-pointer text-sm font-bold hover:underline"
                        >
                            {t("client:post-preview.expand-tags", "see all")}
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    ) : null;
};
