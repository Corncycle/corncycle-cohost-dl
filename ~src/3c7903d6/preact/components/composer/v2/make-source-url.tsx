import missingAttachment from "@/client/images/placeholders/attach_padding.svg";
import { AttachmentState } from "@/shared/types/attachments";
import { type Attachment } from "./document-model";
import sitemap from "@/shared/sitemap";

export function makeSourceURL(attachment: Attachment) {
    if (
        attachment &&
        attachment.state === AttachmentState.Finished &&
        attachment.attachmentId
    ) {
        return sitemap.public
            .redirectToAttachment({
                attachmentId: attachment.attachmentId,
            })
            .toString();
    } else if (attachment && attachment.uploadData) {
        return attachment.uploadData.objectURL;
    } else {
        return sitemap.public.static
            .staticAsset({ path: missingAttachment })
            .toString();
    }
}
