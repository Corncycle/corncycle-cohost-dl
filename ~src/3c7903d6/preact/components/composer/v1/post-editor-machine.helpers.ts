import missingAttachment from "@/client/images/placeholders/attach_padding.svg";
import { sitemap } from "@/shared/sitemap";
import { AttachmentKind, AttachmentState } from "@/shared/types/attachments";
import { StateFrom } from "xstate";
import { postEditorMachine, Attachment } from "./post-editor-machine";
import { selectStateMatches } from "../../../../lib/xstate-helpers";

type MachineState = StateFrom<typeof postEditorMachine>;

export const selectBlocks = (state: MachineState) =>
    state.context.markdownBlocks;
export const selectCws = (state: MachineState) => state.context.cws;
export const selectEditingCws = (state: MachineState) =>
    state.context.editingCws;

export const selectHeadline = (state: MachineState) => state.context.headline;
export const selectTags = (state: MachineState) => state.context.tags;
export const selectAttachments = (state: MachineState) =>
    state.context.attachments;
export const selectIsEditing = selectStateMatches("editing");

export const selectIsCreatingPost = selectStateMatches("posting.creatingPost");
export const selectIsStartingAttachments = selectStateMatches(
    "posting.uploadingAttachments.startingAttachments"
);
export const selectIsFinishingAttachments = selectStateMatches(
    "posting.uploadingAttachments.finishingAttachments"
);

export function makeSourceURL(attachment: Attachment): string {
    if (
        attachment.state === AttachmentState.Finished &&
        attachment.attachmentId
    ) {
        return sitemap.public
            .redirectToAttachment({
                attachmentId: attachment.attachmentId,
            })
            .toString();
    } else if (attachment.file) {
        return URL.createObjectURL(attachment.file);
    } else
        return sitemap.public.static
            .staticAsset({ path: missingAttachment })
            .toString();
}
