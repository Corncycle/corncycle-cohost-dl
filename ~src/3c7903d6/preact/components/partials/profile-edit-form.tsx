import { trpc } from "@/client/lib/trpc";
import { Button } from "@/client/preact/components/elements/button";
import { StyledInput } from "@/client/preact/components/elements/styled-input";
import { StyledSelect } from "@/client/preact/components/elements/styled-select";
import { ExpandingTextArea } from "@/client/preact/components/expanding-text-area";
import { FilePicker } from "@/client/preact/components/file-selector";
import sitemap from "@/shared/sitemap";
import {
    AvatarShape,
    WireProjectModel,
    ContactCardRow,
} from "@/shared/types/projects";
import {
    ChevronDoubleLeftIcon,
    PencilIcon,
    PlusIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import React, { FunctionComponent, useCallback, useEffect } from "react";
import {
    Controller,
    SubmitHandler,
    useFieldArray,
    useForm,
    Validate,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import useBeforeUnload from "../../hooks/use-before-unload";
import { ProfileEditInput } from "./profile-edit-input";
import loadable from "@loadable/component";

const DevTool = loadable(() => import("@hookform/devtools"), {
    resolveComponent: (mod) => mod.DevTool,
});

type ProfileEditFormProps = {
    project: WireProjectModel;
    updatePendingProject: (data: Partial<WireProjectModel>) => void;
};

type Inputs = {
    displayName: string;
    dek: string;
    avatar: FileList;
    header: FileList | undefined;
    removeHeader: boolean;
    description: string;
    pronouns: string;
    url: string;
    avatarShape: AvatarShape;
    contactCard: ContactCardRow[];
};

const MAX_AVATAR_SIZE = 200 * 1024;
const MAX_HEADER_SIZE = 1024 * 1024;

const fileValidatorFactory: (
    name: string,
    maxSize: number
) => Validate<FileList | undefined> = (name, maxSize) => (fileList) => {
    if (fileList === undefined) {
        return true;
    }
    if (!(fileList instanceof FileList)) {
        console.log(fileList);
        return "this isn't a filelist???? how did you get here";
    }
    if (!fileList.length) {
        return true;
    } else if (fileList.length > 1) {
        return `You can only choose one file as your ${name}!`;
    } else if (fileList[0].size > maxSize) {
        return `${name} must be less than ${Math.round(maxSize / 1024)}kb!`;
    } else if (!fileList[0].type.startsWith("image/")) {
        return `${name} must be an image!`;
    }

    return true;
};

export const ProfileEditForm: FunctionComponent<ProfileEditFormProps> = ({
    project,
    updatePendingProject,
}) => {
    const { t } = useTranslation();
    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isDirty, isSubmitSuccessful },
        control,
        watch,
        resetField,
        setValue,
        trigger,
        reset,
    } = useForm<Inputs>({
        defaultValues: {
            displayName: project.displayName ?? "",
            dek: project.dek ?? "",
            description: project.description ?? "",
            pronouns: project.pronouns ?? "",
            url: project.url ?? "",
            contactCard: project.contactCard ?? [],
            avatarShape: project.avatarShape ?? "circle",
            removeHeader: false,
        },
        mode: "all",
    });
    const {
        fields: contactCardRows,
        append: appendContactCardRow,
        remove: removeContactCardRow,
    } = useFieldArray({
        control,
        name: "contactCard",
    });

    const avatarShapes = trpc.projects.eligibleAvatarShapes.useQuery(
        undefined,
        {
            suspense: true,
        }
    );

    watch(
        (
            {
                displayName,
                description,
                dek,
                header,
                removeHeader,
                pronouns,
                url,
                avatar,
                avatarShape,
                contactCard,
            },
            { name }
        ) => {
            const pendingProject: Partial<WireProjectModel> = {
                displayName,
                description,
                dek,
                pronouns,
                url,
                avatarShape,
            };

            if (name?.startsWith("contactCard")) {
                if (contactCard) {
                    pendingProject.contactCard = contactCard.filter(
                        (row) =>
                            row && row?.service && row?.value && row?.visibility
                    ) as ContactCardRow[];
                }
            } else {
                switch (name) {
                    case "displayName":
                        pendingProject.displayName = displayName;
                        break;
                    case "description":
                        pendingProject.description = description;
                        break;
                    case "dek":
                        pendingProject.dek = dek;
                        break;
                    case "pronouns":
                        pendingProject.pronouns = pronouns;
                        break;
                    case "url":
                        pendingProject.url = url;
                        break;
                    case "avatarShape":
                        pendingProject.avatarShape = avatarShape;
                        break;
                    case "avatar": {
                        const avatarFile = avatar?.item(0);
                        if (avatarFile) {
                            pendingProject.avatarURL =
                                URL.createObjectURL(avatarFile);
                        }
                        break;
                    }
                }

                // special handling for header image
                const headerFile = header?.item(0);
                if (removeHeader) {
                    pendingProject.headerURL = undefined;
                } else if (headerFile) {
                    pendingProject.headerURL = URL.createObjectURL(headerFile);
                }
            }

            updatePendingProject(pendingProject);
        }
    );

    const removeHeaderImage = useCallback<
        React.MouseEventHandler<EventTarget>
    >(() => {
        setValue("header", undefined);
        setValue("removeHeader", true);
        void trigger("header");
        void trigger("removeHeader");
    }, [setValue, trigger]);

    const onSubmit: SubmitHandler<Inputs> = async (values) => {
        const {
            displayName,
            dek,
            description,
            url,
            pronouns,
            avatar,
            header,
            removeHeader,
            avatarShape,
            contactCard,
        } = values;

        const newVersionForm = new FormData();
        newVersionForm.append("displayName", displayName);
        newVersionForm.append("dek", dek);
        newVersionForm.append("description", description);
        newVersionForm.append("url", url);
        newVersionForm.append("pronouns", pronouns);
        newVersionForm.append("avatarShape", avatarShape);
        newVersionForm.append("removeHeader", removeHeader.toString());
        newVersionForm.append("contactCard", JSON.stringify(contactCard));

        if (avatar?.length === 1) {
            newVersionForm.append("avatar", avatar[0]);
        }

        if (header?.length === 1) {
            newVersionForm.append("header", header[0]);
        }

        try {
            // new version request
            await axios.post(
                sitemap.public.apiV1.updateProject().toString(),
                newVersionForm,
                {
                    responseType: "json",
                }
            );
            reset(values); // make the form state Not Be Dirty anymore, keep the actual values so there's no visual flash.
        } catch (e) {
            console.error(e);
            return;
        }
    };

    useEffect(() => {
        register("header", {
            validate: fileValidatorFactory("header", MAX_HEADER_SIZE),
        });
        register("avatar", {
            validate: fileValidatorFactory("avatar", MAX_AVATAR_SIZE),
        });
    }, [register]);

    useBeforeUnload(() => {
        return isDirty;
    });

    useEffect(() => {
        if (isSubmitSuccessful) {
            location.replace(
                sitemap.public.project.mainAppProfile({
                    projectHandle: project.handle,
                })
            );
        }
    }, [isSubmitSuccessful, project.handle]);

    useEffect(() => {
        if (!isValid) {
            Object.keys(errors).forEach((errorField) => {
                resetField(errorField as keyof Inputs, { keepError: true });
            });
        }
    }, [errors, isValid, resetField]);

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto w-full min-w-min bg-notBlack p-3 text-notWhite lg:max-w-xs"
        >
            <div className="mb-3 flex flex-row items-center justify-between gap-6">
                <a
                    href={sitemap.public.project
                        .mainAppProfile({
                            projectHandle: project.handle,
                        })
                        .toString()}
                    className="flex items-center gap-1 text-mango hover:underline"
                >
                    <ChevronDoubleLeftIcon className="h-6 w-6" />
                    Back
                </a>

                <Button type="submit" buttonStyle="pill" color="mango">
                    save changes
                </Button>
            </div>
            <section className="flex flex-col gap-2">
                <label className="flex flex-col gap-0">
                    <span className="font-atkinson text-lg font-bold">
                        display name
                    </span>

                    <ProfileEditInput
                        type="text"
                        control={control}
                        name="displayName"
                        maxLength={70}
                        rules={{
                            maxLength: 70,
                        }}
                        autoComplete="off"
                    />
                </label>

                <label className="flex flex-col gap-0">
                    <span className="font-atkinson text-lg font-bold">
                        headline
                    </span>

                    <ProfileEditInput
                        type="text"
                        control={control}
                        name="dek"
                        maxLength={35}
                        rules={{
                            maxLength: 35,
                        }}
                        autoComplete="off"
                    />
                </label>
                <label className="flex flex-col gap-0">
                    <span className="font-atkinson text-lg font-bold">
                        pronouns
                    </span>
                    <ProfileEditInput
                        type="text"
                        control={control}
                        name="pronouns"
                        maxLength={35}
                        rules={{
                            maxLength: 35,
                        }}
                        autoComplete="off"
                    />
                </label>
                <label className="flex flex-col gap-0">
                    <span className="font-atkinson text-lg font-bold">
                        link
                    </span>
                    <ProfileEditInput
                        type="text"
                        control={control}
                        name="url"
                        autoComplete="off"
                    />
                </label>
                {/*
                 * (it has an associated control, but eslint-plugin-jsx-a11y isn't smart
                 * enough to see through <Controller />)
                 */}
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className="flex flex-col gap-0">
                    <span className="font-lg font-atkinson font-bold">
                        description
                    </span>

                    <Controller
                        control={control}
                        name="description"
                        render={({ field: { ref, onChange, ...field } }) => (
                            <ExpandingTextArea
                                {...field}
                                className={`w-full border-x-0 border-b border-t-0 border-gray-700
                    bg-transparent p-1
                    text-notWhite placeholder:text-gray-400 read-only:bg-gray-700 focus:border-notWhite`}
                                onInput={onChange}
                                ref={ref}
                                minRows={1}
                                autoComplete="off"
                            />
                        )}
                    />
                </label>

                <div className="flex flex-col gap-0 border-b border-gray-700 pb-1">
                    <div className="flex flex-row items-center justify-between">
                        <span className="font-atkinson text-lg font-bold">
                            avatar
                        </span>
                        <FilePicker
                            onFilesPicked={(fileList) => {
                                setValue("avatar", fileList);
                                void trigger("avatar");
                            }}
                        >
                            <button type="button" aria-label="choose avatar">
                                <PencilIcon className="h-6 w-6 cursor-pointer" />
                            </button>
                        </FilePicker>
                    </div>
                    <p className="text-sm">
                        Max size {MAX_AVATAR_SIZE / 1024}kb
                    </p>
                    {errors.avatar ? (
                        <p className="text-sm text-red">
                            {errors.avatar.message}
                        </p>
                    ) : null}
                </div>
                <div className="flex flex-col gap-0 border-b border-gray-700 pb-1">
                    {avatarShapes.isError || !avatarShapes.data ? (
                        <div>
                            we're having some problems loading your profile, so
                            you can't change your avatar shape (
                            {project.avatarShape}) right now.
                        </div>
                    ) : (
                        <label>
                            <span className="font-atkinson text-lg font-bold">
                                avatar shape
                            </span>

                            <StyledSelect
                                style="dark"
                                control={control}
                                name={"avatarShape"}
                                rules={{
                                    required: true,
                                }}
                            >
                                {avatarShapes.data.map((shape) => (
                                    <option key={shape.id} value={shape.id}>
                                        {shape.humanReadableName}
                                    </option>
                                ))}
                            </StyledSelect>
                        </label>
                    )}
                </div>
                <div className="flex flex-col gap-0 border-b border-gray-700 pb-1">
                    <div className="flex flex-row items-center justify-between">
                        <span className="flex-1 font-atkinson text-lg font-bold">
                            header image
                        </span>
                        <FilePicker
                            onFilesPicked={(fileList) => {
                                setValue("header", fileList);
                                setValue("removeHeader", false);
                                void trigger("header");
                                void trigger("removeHeader");
                            }}
                        >
                            <button
                                type="button"
                                aria-label="choose header image"
                            >
                                <PencilIcon className="h-6 w-6 cursor-pointer" />
                            </button>
                        </FilePicker>
                        <button
                            type="button"
                            onClick={removeHeaderImage}
                            aria-label="remove header image"
                        >
                            <XMarkIcon className="h-6 w-6 cursor-pointer text-red" />
                        </button>
                    </div>
                    <p className="text-sm">
                        Max size {MAX_HEADER_SIZE / 1024}kb
                    </p>
                    {errors.header ? (
                        <p className="text-sm text-red">
                            {errors.header.message}
                        </p>
                    ) : null}
                </div>

                <div className="flex flex-col gap-2">
                    <>
                        <header className="font-atkinson text-lg font-bold">
                            edit profile links
                        </header>

                        {contactCardRows.map((row, index) => (
                            <React.Fragment key={row.id}>
                                <StyledInput
                                    trigger={trigger}
                                    control={control}
                                    type="text"
                                    style="dark"
                                    name={`contactCard.${index}.service`}
                                    placeholder="link title (can contain emoji!)"
                                    showValidity={false}
                                />
                                <StyledInput
                                    trigger={trigger}
                                    control={control}
                                    type="text"
                                    style="dark"
                                    name={`contactCard.${index}.value`}
                                    placeholder="link"
                                    showValidity={false}
                                />
                                <StyledSelect
                                    style="dark"
                                    control={control}
                                    name={`contactCard.${index}.visibility`}
                                    rules={{
                                        required: true,
                                    }}
                                >
                                    <option value="public">
                                        visible to everyone
                                    </option>
                                    <option value="logged-in">
                                        visible to logged-in users
                                    </option>
                                    <option value="following-you">
                                        visible to pages following you
                                    </option>
                                    <option value="follows">
                                        visible to pages you follow
                                    </option>
                                </StyledSelect>
                                <button
                                    type="button"
                                    className="cursor-pointer self-end text-red"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeContactCardRow(index);
                                    }}
                                >
                                    delete link
                                </button>
                            </React.Fragment>
                        ))}

                        <button
                            type="button"
                            className="flex cursor-pointer flex-row self-center text-mango"
                            onClick={(e) => {
                                e.stopPropagation();
                                appendContactCardRow({
                                    service: "",
                                    value: "",
                                    visibility: "public",
                                });
                            }}
                        >
                            <PlusIcon className="h-6 w-6" />
                            add link
                        </button>
                    </>
                </div>
            </section>
            {process.env.NODE_ENV === "development" && (
                <DevTool control={control} />
            )}
        </form>
    );
};
