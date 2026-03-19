import { AttachmentKind } from "@/shared/types/attachments";
import React, { FunctionComponent } from "react";

export type AttachmentLayoutChildComponent<TAttachment> = FunctionComponent<{
    attachment: TAttachment;
    index: number;
    rowLength: number;
    aspectRatio: number | undefined;
    testRowIndex?: number;
}>;

interface AttachmentLayoutProps<T> {
    attachments: T[];
    attachmentKind: (attachment: T) => AttachmentKind;
    attachmentDimensions: (attachment: T) => AttachmentDimensions;
    renderOne: AttachmentLayoutChildComponent<T>;
}

interface AttachmentLayoutRowProps<T> extends AttachmentLayoutProps<T> {
    attachmentIndices: number[];
}

export type AttachmentDimensions =
    | { width: number; height: number }
    | undefined;

export function AttachmentLayoutRow<T>({
    attachments,
    attachmentDimensions,
    renderOne,
    attachmentIndices: indices,
    testRowIndex,
}: AttachmentLayoutRowProps<T> & { testRowIndex?: number }) {
    const largestAttachment = attachments.reduce((prev, curr) => {
        const currDimensions = attachmentDimensions(curr),
            prevDimensions = prev ? attachmentDimensions(prev) : undefined;

        if (
            currDimensions &&
            (!prevDimensions ||
                currDimensions.height * currDimensions.width >
                    prevDimensions.height * prevDimensions.width)
        ) {
            return curr;
        } else {
            return prev;
        }
    });

    const largestAttachmentDimensions = largestAttachment
        ? attachmentDimensions(largestAttachment)
        : undefined;
    let aspectRatio: number | undefined = undefined;

    if (attachments.length > 1) {
        if (
            largestAttachmentDimensions &&
            largestAttachmentDimensions.width &&
            largestAttachmentDimensions.height
        ) {
            aspectRatio =
                largestAttachmentDimensions.width /
                largestAttachmentDimensions.height;
        } else {
            aspectRatio = 16 / 9;
        }
    }

    return (
        <div
            className="flex w-full flex-nowrap content-start justify-between"
            data-testid={
                testRowIndex !== undefined ? `row-${testRowIndex}` : undefined
            }
        >
            {attachments.map((attachment: T, i) =>
                renderOne({
                    attachment,
                    index: indices[i],
                    rowLength: attachments.length,
                    aspectRatio,
                })
            )}
        </div>
    );
}

export function AttachmentLayoutV1<T>({
    attachments,
    attachmentKind,
    attachmentDimensions,
    renderOne,
}: AttachmentLayoutProps<T>) {
    const components: React.ReactElement[] = [];

    // render image attachments
    const imageAttachments: T[] = [];
    const imageAttachmentIndices: number[] = [];

    for (let index = 0; index < attachments.length; index++) {
        if (attachmentKind(attachments[index]) === "image") {
            imageAttachments.push(attachments[index]);
            imageAttachmentIndices.push(index);
        }
    }

    if (imageAttachments.length) {
        if (imageAttachments.length % 2 === 0) {
            // even
            for (let i = 0; i < imageAttachments.length; i += 2) {
                components.push(
                    <AttachmentLayoutRow
                        attachments={imageAttachments.slice(i, i + 2)}
                        attachmentIndices={imageAttachmentIndices.slice(
                            i,
                            i + 2
                        )}
                        attachmentKind={attachmentKind}
                        attachmentDimensions={attachmentDimensions}
                        renderOne={renderOne}
                        key={`image-${i}`}
                    />
                );
            }
        } else if (imageAttachments.length >= 3) {
            // odd, >= 3 (currently only exactly 3, this will change at some point)
            const firstThree = imageAttachments.splice(0, 3);
            const firstThreeIndices = imageAttachmentIndices.splice(0, 3);
            components.push(
                <AttachmentLayoutRow
                    attachments={firstThree}
                    attachmentIndices={firstThreeIndices}
                    attachmentKind={attachmentKind}
                    attachmentDimensions={attachmentDimensions}
                    renderOne={renderOne}
                    key="image-firstThree"
                />
            );
            for (let i = 0; i < imageAttachments.length; i += 2) {
                components.push(
                    <AttachmentLayoutRow
                        attachments={imageAttachments.slice(i, i + 2)}
                        attachmentIndices={imageAttachmentIndices.slice(
                            i,
                            i + 2
                        )}
                        attachmentKind={attachmentKind}
                        attachmentDimensions={attachmentDimensions}
                        renderOne={renderOne}
                        key={`image-rest-${i}`}
                    />
                );
            }
        } else {
            // only one
            components.push(
                <AttachmentLayoutRow
                    attachments={imageAttachments}
                    attachmentIndices={imageAttachmentIndices}
                    attachmentKind={attachmentKind}
                    attachmentDimensions={attachmentDimensions}
                    renderOne={renderOne}
                    key="image-solo"
                />
            );
        }
    }

    // render audio attachments; these can't share a row with each other so
    // rendering them is easier
    const audioAttachments: T[] = [];
    const audioAttachmentIndices: number[] = [];

    for (let index = 0; index < attachments.length; index++) {
        if (attachmentKind(attachments[index]) === "audio") {
            audioAttachments.push(attachments[index]);
            audioAttachmentIndices.push(index);
        }
    }

    components.push(
        ...audioAttachments
            .map((audio, i) =>
                renderOne({
                    attachment: audio,
                    index: audioAttachmentIndices[i],
                    rowLength: 1,
                    aspectRatio: undefined,
                })
            )
            .filter(
                (component): component is React.ReactElement =>
                    component !== null
            )
    );

    return components.length ? (
        <div>
            {/* dumb but throwing this in a div suppresses the between-row gap */}
            {components}
        </div>
    ) : null;
}

function layoutImages<T>(
    accum: { attachment: T; index: number }[],
    attachmentKind: (attachment: T) => "audio" | "image",
    attachmentDimensions: (attachment: T) => AttachmentDimensions,
    renderOne: AttachmentLayoutChildComponent<T>,
    testStartRowIndex: number
): React.ReactElement[] {
    switch (accum.length) {
        case 0:
            return [];
        case 1:
            return [
                <AttachmentLayoutRow
                    attachments={[accum[0].attachment]}
                    attachmentIndices={[accum[0].index]}
                    attachmentKind={attachmentKind}
                    attachmentDimensions={attachmentDimensions}
                    renderOne={renderOne}
                    key={`image-${accum[0].index}`}
                    testRowIndex={testStartRowIndex}
                />,
            ];
        /* n = 2 is handled by the default case */
        case 3:
            return [
                <AttachmentLayoutRow
                    attachments={[
                        accum[0].attachment,
                        accum[1].attachment,
                        accum[2].attachment,
                    ]}
                    attachmentIndices={[
                        accum[0].index,
                        accum[1].index,
                        accum[2].index,
                    ]}
                    attachmentKind={attachmentKind}
                    attachmentDimensions={attachmentDimensions}
                    renderOne={renderOne}
                    key={`images-${accum[0].index}-${accum[1].index}-${accum[2].index}`}
                    testRowIndex={testStartRowIndex}
                />,
            ];
        default:
            return [
                <AttachmentLayoutRow
                    attachments={[accum[0].attachment, accum[1].attachment]}
                    attachmentIndices={[accum[0].index, accum[1].index]}
                    attachmentKind={attachmentKind}
                    attachmentDimensions={attachmentDimensions}
                    renderOne={renderOne}
                    key={`images-${accum[0].index}-${accum[1].index}`}
                    testRowIndex={testStartRowIndex}
                />,
                ...layoutImages(
                    accum.slice(2),
                    attachmentKind,
                    attachmentDimensions,
                    renderOne,
                    testStartRowIndex + 1
                ),
            ];
    }
}

export function AttachmentLayoutV2<T>({
    attachments,
    attachmentKind,
    attachmentDimensions,
    renderOne,
}: AttachmentLayoutProps<T>) {
    const components: React.ReactElement<any, any>[] = [];
    let imagesAccum: { attachment: T; index: number }[] = [];
    let rowIndex = 0;

    for (let index = 0; index < attachments.length; index++) {
        const attachment = attachments[index];

        switch (attachmentKind(attachment)) {
            case "image":
                imagesAccum.push({ attachment, index });
                break;
            case "audio":
                // empty out the image accumulator
                components.push(
                    ...layoutImages(
                        imagesAccum,
                        attachmentKind,
                        attachmentDimensions,
                        renderOne,
                        rowIndex++
                    )
                );
                imagesAccum = [];

                // render the audio attachment
                {
                    const renderedAudio = renderOne({
                        attachment,
                        index,
                        rowLength: 1,
                        aspectRatio: undefined,
                        testRowIndex: rowIndex++,
                    });

                    if (renderedAudio) {
                        components.push(renderedAudio);
                    }
                }
                break;
        }
    }

    // if any images are left in the accumulator, render those out too
    components.push(
        ...layoutImages(
            imagesAccum,
            attachmentKind,
            attachmentDimensions,
            renderOne,
            rowIndex++
        )
    );

    return components.length ? (
        <div>
            {/* dumb but throwing this in a div suppresses the between-row gap */}
            {components}
        </div>
    ) : null;
}
