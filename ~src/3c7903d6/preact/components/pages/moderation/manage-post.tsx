import { generatePostAst } from "@/client/lib/markdown/post-rendering";
import sitemap from "@/shared/sitemap";
import {
    isMarkdownStorageBlock,
    StorageBlock,
} from "@/shared/types/post-blocks";
import { PostState } from "@/shared/types/posts";
import {
    WireAuditLogEntryTypes,
    WirePostModelModeratorExtensions,
    WirePostViewModel,
} from "@/shared/types/wire-models";
import { DateTime } from "luxon";
import React, { FunctionComponent, useMemo, useState } from "react";
import { useAsync } from "react-use";
import { PostBody as PostBodyV2 } from "@/client/preact/components/posts/post-body";
import { EditPostForm } from "./manage-post.edit-post-form";
import { WireProjectModel } from "@/shared/types/projects";
import { PostId } from "@/shared/types/ids";

const OptionalBool: FunctionComponent<{ value: boolean | undefined }> = ({
    value,
}) => (value === undefined ? <>❓</> : value ? <>✅</> : <>❌</>);

const PartialPostPreview: FunctionComponent<{
    blocks: StorageBlock[];
    hasCohostPlus: boolean;
    effectiveDate: string | undefined;
}> = ({ blocks, hasCohostPlus, effectiveDate }) => {
    const previewBlocks = useMemo(() => {
        return blocks.filter(isMarkdownStorageBlock);
    }, [blocks]);
    const postAst = useAsync(
        () =>
            generatePostAst(previewBlocks, new Date(), {
                hasCohostPlus,
                renderingContext: "post",
            }),
        [blocks, hasCohostPlus]
    );

    return (
        <div
            data-post-preview
            className="cohost-shadow-light rounded-lg bg-white"
        >
            {postAst.loading ? (
                <div className="text-notBlack">rendering...</div>
            ) : postAst.error ? (
                <div className="text-notBlack">{postAst.error.message}</div>
            ) : (
                <PostBodyV2
                    viewModel={{
                        postId: 0 as PostId,
                        blocks: previewBlocks,
                        astMap: postAst.value!,
                    }}
                    skipCollapse={true}
                    effectiveDate={effectiveDate}
                />
            )}
        </div>
    );
};

const ManagePostPage: FunctionComponent<{
    post: WirePostModelModeratorExtensions;
    viewModel: WirePostViewModel;
    logEntries: WireAuditLogEntryTypes["edit_post"][];
    postingProject: WireProjectModel;
}> = (props) => {
    const { post, logEntries, postingProject, viewModel } = props;
    const postType = useMemo(() => {
        if (post.transparentShareOfPostId) return "transparent share";
        if (post.shareOfPostId) return "contentful share";
        return "original";
    }, [post.shareOfPostId, post.transparentShareOfPostId]);

    const [previewBlocks, setPreviewBlocks] = useState<StorageBlock[]>([]);
    return (
        <div
            className={`cohost-shadow-light dark:cohost-shadow-dark flex min-w-0 max-w-full flex-col gap-4 rounded-lg bg-notWhite
            p-3 text-notBlack`}
        >
            <h1 className="text-4xl font-bold">manage post</h1>
            <em>all times local to your browser</em>

            <div>
                <h2 className="text-2xl font-bold">details</h2>
                <div className="prose">
                    <ul>
                        <li>
                            post id: {post.postId} (
                            <a href={viewModel.singlePostPageUrl} target="post">
                                permalink
                            </a>
                            )
                        </li>
                        <li>type: {postType}</li>
                        <li>
                            published at:{" "}
                            {post.publishedAt
                                ? DateTime.fromISO(
                                      post.publishedAt
                                  ).toLocaleString(DateTime.DATETIME_MED)
                                : "none"}
                        </li>
                        <li>headline: {post.headline}</li>
                        <li>
                            posted by: @{postingProject.handle}
                            <ul>
                                <li>
                                    <a
                                        href={sitemap.public.project
                                            .mainAppProfile({
                                                projectHandle:
                                                    postingProject.handle,
                                            })
                                            .toString()}
                                        target="profile"
                                    >
                                        profile
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href={sitemap.public.moderation
                                            .manageProject({
                                                projectHandle:
                                                    postingProject.handle,
                                            })
                                            .toString()}
                                        target="managePage"
                                    >
                                        manage
                                    </a>
                                </li>
                            </ul>
                        </li>
                        {viewModel.responseToAskId && (
                            <li>
                                response to ask:{" "}
                                <a
                                    href={sitemap.public.moderation
                                        .manageAsk({
                                            askId: viewModel.responseToAskId,
                                        })
                                        .toString()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {viewModel.responseToAskId}
                                </a>
                            </li>
                        )}
                    </ul>
                </div>
            </div>

            {/* audit log */}
            <div className="rounded-lg border p-3">
                <h2 className="text-2xl font-bold">audit log</h2>
                {logEntries.length ? (
                    <div className="relative overflow-auto">
                        <table className="prose w-full prose-tr:border-b prose-td:whitespace-nowrap">
                            <thead>
                                <th>logged at</th>
                                <th>headline</th>
                                <th>blocks</th>
                                <th>adult content</th>
                                <th>adult content override</th>
                                <th>cws</th>
                                <th>state</th>
                                <th>comments locked</th>
                            </thead>
                            {logEntries.map((entry) => (
                                <tr key={entry.entryId}>
                                    <td>
                                        <span>
                                            {DateTime.fromISO(
                                                entry.loggedAt
                                            ).toLocaleString(
                                                DateTime.DATETIME_MED
                                            )}
                                        </span>
                                    </td>
                                    <td>
                                        {JSON.stringify(entry.oldHeadline)}
                                        <br />
                                        ➡️
                                        <br />
                                        {JSON.stringify(entry.newHeadline)}
                                    </td>
                                    <td>
                                        <a
                                            onClick={() =>
                                                setPreviewBlocks(
                                                    entry.oldBlocks
                                                )
                                            }
                                            href="#post-preview"
                                        >
                                            preview old
                                        </a>
                                        <br />
                                        <a
                                            onClick={() =>
                                                setPreviewBlocks(
                                                    entry.newBlocks
                                                )
                                            }
                                            href="#post-preview"
                                        >
                                            preview new
                                        </a>
                                    </td>
                                    <td>
                                        <OptionalBool
                                            value={entry.oldAdultContent}
                                        />{" "}
                                        ➡️{" "}
                                        <OptionalBool
                                            value={entry.newAdultContent}
                                        />
                                    </td>
                                    <td>
                                        <OptionalBool
                                            value={
                                                entry.oldAdultContentOverride
                                            }
                                        />{" "}
                                        ➡️{" "}
                                        <OptionalBool
                                            value={
                                                entry.newAdultContentOverride
                                            }
                                        />
                                    </td>
                                    <td>
                                        <code>
                                            {JSON.stringify(entry.oldCws)}
                                        </code>
                                        <br />
                                        ➡️
                                        <br />
                                        <code>
                                            {JSON.stringify(entry.newCws)}
                                        </code>
                                    </td>
                                    <td>
                                        {PostState[entry.oldState]} ➡️{" "}
                                        {PostState[entry.newState]}
                                    </td>
                                    <td>
                                        <OptionalBool
                                            value={entry.oldCommentsLocked}
                                        />{" "}
                                        ➡️{" "}
                                        <OptionalBool
                                            value={entry.newCommentsLocked}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </table>
                    </div>
                ) : (
                    <p>this post has never been edited</p>
                )}
            </div>

            {/* preview */}
            <div
                className="flex flex-col gap-4 rounded-lg border p-3"
                id="post-preview"
            >
                <h2 className="text-2xl font-bold">preview markdown blocks</h2>
                {!previewBlocks.length ? (
                    <p>nothing to show</p>
                ) : (
                    <>
                        <PartialPostPreview
                            blocks={previewBlocks}
                            hasCohostPlus={post.hasCohostPlus}
                            effectiveDate={post.publishedAt}
                        />
                        <div className="prose">
                            <details>
                                <summary>code</summary>
                                <pre>
                                    <code>
                                        {JSON.stringify(previewBlocks, null, 2)}
                                    </code>
                                </pre>
                            </details>
                        </div>
                    </>
                )}
            </div>

            {/* actions */}
            <div className="rounded-lg border p-3">
                <h2 className="text-2xl font-bold">edit post</h2>
                <EditPostForm post={post} />
            </div>
        </div>
    );
};

export default ManagePostPage;
