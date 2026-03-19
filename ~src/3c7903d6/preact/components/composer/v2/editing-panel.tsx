import { tw } from "@/client/lib/tw-tagged-literal";
import sitemap from "@/shared/sitemap";
import React, {
    FunctionComponent,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { useTranslation } from "react-i18next";
import { InfoBox } from "../../elements/info-box";
import { CwsInput } from "./cws-input";
import { HeadlineInput } from "./headline-input";
import { TagsInput } from "./tags-input";
import {
    insertFile,
    selectEditingTransparentShare,
    selectProjectHandle,
    selectShareOfPostId,
} from "./reducer";
import { useAppDispatch, useAppSelector } from "./redux-hooks";
import AttachmentComposer from "./attachment-composer";
import { AttachmentComposerContext } from "./attachment-composer-context";
import { ContentEditor } from "./content-editor";
import { dropTargetForExternal } from "@atlaskit/pragmatic-drag-and-drop/external/adapter";
import invariant from "tiny-invariant";
import {
    containsFiles,
    getFiles,
} from "@atlaskit/pragmatic-drag-and-drop/external/file";

export const EditingPanel: FunctionComponent = () => {
    const { t } = useTranslation();

    const editingTransparentShare = useAppSelector(
        selectEditingTransparentShare
    );
    const shareOfPostId = useAppSelector(selectShareOfPostId);
    const projectHandle = useAppSelector(selectProjectHandle);
    const attachmentComposerRef = useContext(AttachmentComposerContext);

    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const dispatch = useAppDispatch();

    useEffect(() => {
        const element = containerRef.current;
        invariant(element);
        return dropTargetForExternal({
            element,
            canDrop: containsFiles,
            onDrop({ source, self }) {
                const files = getFiles({ source });
                if (files.length === 0) return;

                setIsDragging(false);

                dispatch(
                    insertFile({
                        file: files[0],
                        atPosition: 0,
                    })
                );
            },
            onDrag() {
                setIsDragging(true);
            },
            onDragLeave() {
                setIsDragging(false);
            },
        });
    }, [dispatch]);

    return (
        <div className="relative" ref={containerRef}>
            <div
                className={`absolute inset-0 flex items-center justify-center
                bg-gray-700 bg-opacity-70 text-notWhite ${
                    isDragging ? "block" : "hidden"
                } z-50
                backdrop-blur-sm`}
            >
                RELEASE TO DROP
            </div>
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
                        <ContentEditor />
                        <AttachmentComposer ref={attachmentComposerRef} />
                    </>
                )}
                <TagsInput />
                <CwsInput />
            </div>
        </div>
    );
};
