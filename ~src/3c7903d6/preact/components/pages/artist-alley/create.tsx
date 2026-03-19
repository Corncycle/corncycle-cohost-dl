import { trpc } from "@/client/lib/trpc";
import {
    useCurrentProject,
    useHasCohostPlus,
} from "@/client/preact/hooks/data-loaders";
import { useDynamicTheme } from "@/client/preact/hooks/dynamic-theme";
import { useSiteConfig } from "@/client/preact/providers/site-config-provider";
import { useRequiresLogin } from "@/client/preact/providers/user-info-provider";
import { sitemap } from "@/shared/sitemap";
import { WireArtistAlley } from "@/shared/types/artist-alley";
import { ArtistAlleyAdId } from "@/shared/types/ids";
import { isValidAttachmentContentType } from "@/shared/util/site-config";
import { validateUrl } from "@/shared/util/validate-url";
import { ArrowUpTrayIcon } from "@heroicons/react/20/solid";
import { DevTool } from "@hookform/devtools";
import axios from "axios";
import normalizeUrl from "normalize-url";
import React, { useCallback } from "react";
import { Helmet } from "react-helmet-async";
import {
    Controller,
    FieldError,
    SubmitHandler,
    useForm,
} from "react-hook-form";
import { z } from "zod";
import { ArtistAlleyListing } from "../../artist-alley/artist-alley-listing";
import { DropZone } from "../../elements/drop-zone";
import { InfoBox } from "../../elements/info-box";
import { StyledInput } from "../../elements/styled-input";
import { TokenMultiSelect } from "../../elements/token-multi-select";
import { ControllableExpandingTextArea } from "../../expanding-text-area";
import { FilePicker } from "../../file-selector";
import LazyDnD from "../../lazy-dnd";
import { SidebarMenu } from "../../sidebar-menu";

const BODY_LIMIT = 280;

const InputRow: React.FC<
    React.PropsWithChildren<{ label: string; smallLabel?: React.ReactNode }>
> = ({ label, children, smallLabel }) => {
    return (
        <label className="flex flex-col gap-1">
            <span className="font-bold">{label}</span>
            {children}
            {smallLabel ? <span className="text-sm">{smallLabel}</span> : null}
        </label>
    );
};

type Inputs = {
    body: string;
    adult: boolean;
    ctaText: string;
    ctaLink: string;
    attachmentFiles: File[] | undefined;
    attachmentAltText: string | undefined;
    categories: string[];
    notes: string;
    // we want it to be a number but. browsers
    numWeeks: string;
};
export const ArtistAlleyCreatePage: React.FC = () => {
    useRequiresLogin();

    const createListingMutation = trpc.artistAlley.createListing.useMutation();

    const {
        control,
        register,
        handleSubmit,
        trigger,
        watch,
        setValue,
        setError,
        formState,
        clearErrors,
        getValues,
    } = useForm<Inputs>({
        defaultValues: {
            adult: false,
            body: "",
            ctaLink: "",
            ctaText: "",
            attachmentFiles: undefined,
            attachmentAltText: "",
            categories: [],
            notes: "",
            numWeeks: "1",
        },
    });

    const [allCategories] = trpc.artistAlley.getCategories.useSuspenseQuery();

    const bodyLength = watch("body").length;

    const onSubmit: SubmitHandler<Inputs> = useCallback(
        async (data) => {
            let attachment = undefined;

            if (data.attachmentFiles && data.attachmentFiles[0]) {
                console.log(data.attachmentFiles);
                const file = data.attachmentFiles[0];
                attachment = {
                    filename: file.name,
                    contentLength: file.size,
                    contentType: file.type,
                    altText: data.attachmentAltText ?? "",
                };
            }

            const initialResult = await createListingMutation.mutateAsync({
                body: data.body,
                adult: data.adult,
                cta: {
                    text: data.ctaText,
                    link: data.ctaLink,
                },
                categories: data.categories,
                numWeeks: parseInt(data.numWeeks),
                attachment,
                notes: data.notes,
            });

            if (initialResult.attachmentDetails && data.attachmentFiles) {
                const file = data.attachmentFiles[0];
                const formData = new FormData();
                for (const name in initialResult.attachmentDetails
                    .requiredFields) {
                    formData.append(
                        name,
                        initialResult.attachmentDetails.requiredFields[name]
                    );
                }
                formData.append("file", file);
                formData.append("Content-Type", file.type);
                await axios.post(
                    initialResult.attachmentDetails.url,
                    formData,
                    {
                        withCredentials: false,
                    }
                );
            }

            window.location.href = initialResult.stripeRedirectUrl;
        },
        [createListingMutation]
    );

    const previewAttachment = watch("attachmentFiles")?.[0];

    const currentProject = useCurrentProject();
    const objectURL = previewAttachment
        ? URL.createObjectURL(previewAttachment)
        : "";

    const previewListing: WireArtistAlley = {
        adultContent: watch("adult", false),
        attachment: previewAttachment
            ? {
                  altText: watch("attachmentAltText") ?? "",
                  fileURL: objectURL,
                  previewURL: objectURL,
              }
            : null,
        body: watch("body"),
        categories: watch("categories"),
        createdAt: new Date().toISOString(),
        cta: {
            link: watch("ctaLink"),
            text: watch("ctaText"),
        },
        expiresAt: new Date().toISOString(),
        projectId: currentProject!.projectId,
        id: ArtistAlleyAdId.parse("1"),
    };

    const theme = useDynamicTheme();

    const siteConfig = useSiteConfig();
    const hasCohostPlus = useHasCohostPlus();
    const maxSize = hasCohostPlus
        ? siteConfig.limits.attachmentSize.cohostPlus
        : siteConfig.limits.attachmentSize.normal;

    const validateAttachment = useCallback(
        (fileList: File[] | undefined) => {
            if (fileList === undefined) {
                return true;
            }

            console.log(fileList);

            if (!fileList.length) {
                return true;
            } else if (fileList.length > 1) {
                return `You can only choose one image!`;
            } else if (fileList[0].size > maxSize) {
                return `image must be less than ${Math.round(
                    maxSize / 1024 / 1024
                )}mb!`;
            }

            const contentTypeValidationResult = isValidAttachmentContentType(
                siteConfig,
                fileList[0].type
            );
            if (
                !contentTypeValidationResult.valid ||
                contentTypeValidationResult.kind !== "image"
            ) {
                return `must be an image!`;
            }

            return true;
        },
        [maxSize, siteConfig]
    );

    const handleFileDrop = useCallback(
        (files: File[]) => {
            const validationResult = validateAttachment(files);

            if (validationResult !== true) {
                setError("attachmentFiles", {
                    message: validationResult,
                    type: "custom",
                });
                return;
            }

            clearErrors("attachmentFiles");
            setValue("attachmentFiles", files);
        },
        [clearErrors, setError, setValue, validateAttachment]
    );

    return (
        <div className="container mx-auto mt-12 grid grid-cols-1 gap-16 lg:grid-cols-4">
            <Helmet title="create a listing - artist alley" />
            <SidebarMenu />
            <LazyDnD>
                <DropZone
                    handleFileDrop={handleFileDrop}
                    className="col-span-1 lg:col-span-2"
                >
                    <div
                        className="co-themed-box co-settings flex flex-col gap-3 rounded-lg p-3"
                        data-theme={theme.current}
                    >
                        <h1 className="co-settings-header">create a listing</h1>

                        <InfoBox level="post-box-info">
                            <div className="co-prose prose prose-sm">
                                <p>
                                    artist alley listings are subject to the{" "}
                                    <a
                                        href={sitemap.public
                                            .staticContent({
                                                slug: "community-guidelines",
                                            })
                                            .toString()}
                                    >
                                        standard cohost community guidelines
                                    </a>
                                    , as well as{" "}
                                    <a href="https://help.antisoftware.club/support/solutions/articles/62000231419-artist-alley-community-guidelines">
                                        an additional set specific to listings
                                    </a>
                                    .
                                </p>
                            </div>
                        </InfoBox>

                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="flex flex-col gap-3"
                        >
                            <InputRow
                                label="listing image"
                                smallLabel={
                                    <>
                                        not required, but definitely
                                        recommended. this will be displayed at a
                                        resolution of 300x250. for best results
                                        on high-density screens, we recommend
                                        your image be at least 600x500.
                                    </>
                                }
                            >
                                <Controller
                                    control={control}
                                    name="attachmentFiles"
                                    render={({ field, fieldState }) => (
                                        <FilePicker
                                            onFilesPicked={(fileList) => {
                                                const validationResult =
                                                    validateAttachment(
                                                        Array.from(fileList)
                                                    );

                                                if (validationResult !== true) {
                                                    setError(
                                                        "attachmentFiles",
                                                        {
                                                            message:
                                                                validationResult,
                                                            type: "custom",
                                                        }
                                                    );
                                                    return;
                                                }

                                                clearErrors("attachmentFiles");
                                                field.onChange(fileList);
                                            }}
                                        >
                                            <button
                                                type="button"
                                                className="co-filled-button flex w-max flex-row items-center gap-1 rounded-lg px-3 py-2.5"
                                            >
                                                <ArrowUpTrayIcon className="inline-block h-5 w-5" />
                                                {previewAttachment
                                                    ? "replace image"
                                                    : "choose image"}
                                            </button>
                                        </FilePicker>
                                    )}
                                />
                                {previewAttachment ? (
                                    <button
                                        type="button"
                                        className="underline"
                                        onClick={(e) => {
                                            setValue(
                                                "attachmentFiles",
                                                undefined
                                            );
                                            setValue(
                                                "attachmentAltText",
                                                undefined
                                            );
                                            clearErrors([
                                                "attachmentFiles",
                                                "attachmentAltText",
                                            ]);
                                            e.preventDefault();
                                        }}
                                    >
                                        remove image
                                    </button>
                                ) : null}
                                {formState.errors.attachmentFiles && (
                                    <span className="text-red">
                                        {
                                            // genuinely unsure why the typing is convinced this is an array
                                            (
                                                formState.errors
                                                    .attachmentFiles as unknown as
                                                    | FieldError
                                                    | undefined
                                            )?.message
                                        }
                                    </span>
                                )}
                            </InputRow>
                            {previewAttachment ? (
                                <InputRow
                                    label="alt text"
                                    smallLabel="required if you're uploading an image"
                                >
                                    <StyledInput
                                        control={control}
                                        name="attachmentAltText"
                                        trigger={trigger}
                                        type="text"
                                        style="dynamic"
                                        placeholder="it's a picture of eggbug"
                                        rules={{
                                            validate: {
                                                required: (value) => {
                                                    if (
                                                        !value &&
                                                        getValues(
                                                            "attachmentFiles"
                                                        )?.length
                                                    ) {
                                                        return "alt text is required";
                                                    }
                                                    return true;
                                                },
                                            },
                                        }}
                                    />
                                    {formState.errors.attachmentAltText && (
                                        <span className="text-red">
                                            {
                                                formState.errors
                                                    .attachmentAltText?.message
                                            }
                                        </span>
                                    )}
                                </InputRow>
                            ) : null}

                            <hr />

                            <InputRow label="body">
                                <div className="flex flex-row items-start">
                                    <ControllableExpandingTextArea
                                        control={control}
                                        name="body"
                                        minRows={4}
                                        autoComplete="off"
                                        placeholder="body goes here"
                                        className="co-styled-input rounded-lg border-2"
                                        rules={{
                                            maxLength: {
                                                message: `must be under ${BODY_LIMIT} characters`,
                                                value: BODY_LIMIT,
                                            },
                                            required: {
                                                message: "required",
                                                value: true,
                                            },
                                        }}
                                    />
                                    {bodyLength >= BODY_LIMIT * 0.75 ? (
                                        <span
                                            className={`flex-shrink-0 p-2 tabular-nums ${
                                                bodyLength > BODY_LIMIT
                                                    ? "text-red"
                                                    : "text-gray-600"
                                            }`}
                                        >
                                            {BODY_LIMIT - bodyLength}
                                        </span>
                                    ) : null}
                                </div>
                                {formState.errors.body && (
                                    <span className="text-red">
                                        {formState.errors.body?.message}
                                    </span>
                                )}
                                <InfoBox level="post-box-info">
                                    supports most markdown! does not support
                                    HTML, headers, or images. max 280
                                    characters.
                                </InfoBox>
                            </InputRow>

                            <hr />

                            <InputRow
                                label="button text"
                                smallLabel="35 characters max"
                            >
                                <StyledInput
                                    control={control}
                                    name="ctaText"
                                    trigger={trigger}
                                    type="text"
                                    style="dynamic"
                                    placeholder="it's eggbug"
                                    rules={{
                                        minLength: 1,
                                        maxLength: {
                                            message:
                                                "must be under 35 characters",
                                            value: 35,
                                        },
                                        required: {
                                            message: "required",
                                            value: true,
                                        },
                                    }}
                                />
                                {formState.errors.ctaText && (
                                    <span className="text-red">
                                        {formState.errors.ctaText.message}
                                    </span>
                                )}
                            </InputRow>
                            <InputRow
                                label="button link"
                                smallLabel="it's gotta be a URL"
                            >
                                <StyledInput
                                    control={control}
                                    name="ctaLink"
                                    trigger={trigger}
                                    type="text"
                                    style="dynamic"
                                    placeholder="https://cohost.org/eggbug"
                                    rules={{
                                        required: {
                                            message: "required",
                                            value: true,
                                        },
                                        validate: (value) => {
                                            try {
                                                const parseResult = z
                                                    .string()
                                                    .url()
                                                    .safeParse(value);

                                                if (!parseResult.success) {
                                                    return "invalid URL";
                                                }

                                                const result = validateUrl(
                                                    normalizeUrl(
                                                        parseResult.data,
                                                        {
                                                            stripAuthentication:
                                                                true,
                                                            // not removing query parameters here so people can set their own
                                                            // UTM/etc. params
                                                            stripWWW: false,
                                                        }
                                                    )
                                                );

                                                if (!result.valid) {
                                                    return "invalid URL";
                                                }

                                                return true;
                                            } catch (e) {
                                                return "invalid URL";
                                            }
                                        },
                                    }}
                                />
                                {formState.errors.ctaLink && (
                                    <span className="text-red">
                                        {formState.errors.ctaLink.message}
                                    </span>
                                )}
                            </InputRow>

                            <hr />

                            <InputRow label="listing categories">
                                <InfoBox level="post-box-info">
                                    these are the categories you ad will appear
                                    in. choose however many you want, but you
                                    need at least one.
                                </InfoBox>
                                <TokenMultiSelect
                                    control={control}
                                    name="categories"
                                    options={allCategories}
                                    rules={{
                                        validate: (value) => {
                                            value = value as string[];

                                            if (value.length === 0) {
                                                return "you need at least one category";
                                            }
                                        },
                                    }}
                                />
                                {formState.errors.categories && (
                                    <span className="text-red">
                                        {
                                            (
                                                formState.errors
                                                    .categories as unknown as FieldError
                                            ).message
                                        }
                                    </span>
                                )}
                            </InputRow>

                            <hr />

                            <label className="flex flex-row items-center justify-between">
                                <span className="font-bold">
                                    this listing contains 18+ content
                                </span>
                                <input
                                    type="checkbox"
                                    {...register("adult")}
                                    className="rounded-checkbox"
                                />
                            </label>

                            <hr />

                            <label className="flex flex-row items-center justify-between">
                                <div className="flex flex-col gap-2">
                                    <span className="font-bold">
                                        how many weeks should this listing run?
                                    </span>
                                    <span className="text-sm">
                                        listings are $10/week
                                    </span>
                                </div>
                                <StyledInput
                                    type="number"
                                    style="dynamic"
                                    control={control}
                                    trigger={trigger}
                                    rules={{
                                        min: 1,
                                        max: 4,
                                        required: true,
                                    }}
                                    name="numWeeks"
                                    min={1}
                                    max={4}
                                    step={1}
                                />
                            </label>

                            <hr />

                            <InputRow label="anything else to tell us?">
                                <InfoBox level="post-box-info">
                                    <div className="co-prose prose prose-sm">
                                        <p>
                                            you can put any notes you want us to
                                            see here. these won't be publicly
                                            visible, but can be helpful for us
                                            during review.
                                        </p>
                                        <p>
                                            we would especially appreciate any
                                            categories you think this listing
                                            fits in to that we don't already
                                            have! if we decide to add them,
                                            we'll apply them to your listing
                                            automatically.
                                        </p>
                                    </div>
                                </InfoBox>
                                <ControllableExpandingTextArea
                                    minRows={3}
                                    control={control}
                                    name="notes"
                                    autoComplete="off"
                                    placeholder="thank you for inventing eggbug"
                                    className="co-styled-input rounded-lg border-2"
                                />
                            </InputRow>
                            <button
                                className="co-filled-button w-max self-end rounded-lg px-3 py-2.5 font-bold"
                                type="submit"
                                disabled={formState.isSubmitting}
                            >
                                continue to payment
                            </button>
                        </form>
                        {process.env.NODE_ENV === "development" ? (
                            <DevTool control={control} />
                        ) : null}
                    </div>
                </DropZone>
            </LazyDnD>
            <div>
                <div
                    className="co-settings co-themed-box flex flex-col gap-4 rounded-lg p-3"
                    data-theme={theme.current}
                >
                    <h2 className="co-settings-header">preview</h2>
                    <InfoBox level="post-box-info">
                        this is what your listing will look like to others!
                    </InfoBox>
                    <div className="mx-auto w-full max-w-[300px]">
                        <ArtistAlleyListing
                            listing={previewListing}
                            project={currentProject!}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtistAlleyCreatePage;
