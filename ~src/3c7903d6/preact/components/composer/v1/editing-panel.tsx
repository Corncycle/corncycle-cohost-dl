import { postEditorMachine } from "./post-editor-machine";
import { tw } from "@/client/lib/tw-tagged-literal";
import sitemap from "@/shared/sitemap";
import { useSelector } from "@xstate/react";
import React, { FunctionComponent, useCallback, useContext } from "react";
import { StateFrom } from "xstate";
import { InfoBox } from "../../elements/info-box";
import { PreviewsFromAttachments } from "./attachment-preview";
import { BodyInput } from "./body-input";
import { CwsInput } from "./cws-input";
import { DropZone } from "../../elements/drop-zone";
import { HeadlineInput } from "./headline-input";
import { PostComposerContext } from "./post-composer-context";
import { TagsInput } from "./tags-input";

const selectEditingTransparentShare = (
    state: StateFrom<typeof postEditorMachine>
) => state.context.editingTransparentShare;
const selectShareOfPostId = (state: StateFrom<typeof postEditorMachine>) =>
    state.context.shareOfPostId;
const selectProjectHandle = (state: StateFrom<typeof postEditorMachine>) =>
    state.context.projectHandle;

export const EditingPanel: FunctionComponent<{
    textAreaRef: React.RefObject<HTMLTextAreaElement>;
}> = ({ textAreaRef }) => {
    const service = useContext(PostComposerContext);
    const { send } = service;

    const editingTransparentShare = useSelector(
        service,
        selectEditingTransparentShare
    );
    const shareOfPostId = useSelector(service, selectShareOfPostId);
    const projectHandle = useSelector(service, selectProjectHandle);

    const handleFileDrop = useCallback(
        (files: File[]) => {
            files.forEach((file) => send({ type: "SELECT_FILE", file }));
        },
        [send]
    );

    return (
        <DropZone handleFileDrop={handleFileDrop}>
            <div className="flex flex-col gap-3 py-3">
                {editingTransparentShare && shareOfPostId ? (
                    <InfoBox className="!m-3 !w-auto" level="post-box-info">
                        <div className={tw`co-prose prose prose-sm`}>
                            <p>
                                Shares without content can't have content added
                                after posting. You <b>can</b> edit the tags.
                            </p>
                            <p>
                                If you want, you can{" "}
                                <a
                                    href={sitemap.public.project
                                        .composePost({
                                            projectHandle: projectHandle,
                                            shareOfPostId: shareOfPostId,
                                        })
                                        .toString()}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    share this post again
                                </a>{" "}
                                and add your content there.
                            </p>
                        </div>
                    </InfoBox>
                ) : (
                    <>
                        <HeadlineInput />
                        <PreviewsFromAttachments canRemove={true} />
                        <BodyInput textAreaRef={textAreaRef} />
                    </>
                )}
                <TagsInput />
                <CwsInput />
            </div>
        </DropZone>
    );
};
