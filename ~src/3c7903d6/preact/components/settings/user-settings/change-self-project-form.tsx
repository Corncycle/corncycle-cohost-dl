import { trpc } from "@/client/lib/trpc";
import type * as LoginV1Types from "@/shared/api-types/login-v1";
import sitemap from "@/shared/sitemap";
import axios, { AxiosResponse } from "axios";
import React, { FunctionComponent, useCallback } from "react";
import { Controller, SubmitHandler, useForm, Validate } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useUserInfo } from "../../../providers/user-info-provider";
import { AuthnButton } from "../../partials/authn-button";
import { StyledInput } from "../../elements/styled-input";
import { sectionBoxClasses, sectionTitleClasses } from "../shared";
import { SettingsRow } from "../../elements/settings-row";
import { ProjectChooser } from "../../elements/project-chooser";
import _ from "lodash";
import { useEditedProjects } from "@/client/preact/hooks/use-edited-projects";
import { ProjectId } from "@/shared/types/ids";
import { FormSubmitButtonRow } from "../form-submit-button-row";

type Inputs = {
    projectId: ProjectId;
};

export const ChangeSelfProjectForm: FunctionComponent = () => {
    const editedProjects = useEditedProjects();
    const selfProject = _.filter(
        editedProjects.projects,
        (project) => !!project.isSelfProject
    )[0];
    const { control, handleSubmit } = useForm<Inputs>({
        defaultValues: {
            projectId: selfProject.projectId,
        },
    });

    const changeSelfProjectMutation =
        trpc.users.changeSelfProject.useMutation();

    const onSubmit: SubmitHandler<Inputs> = async ({ projectId }) => {
        await changeSelfProjectMutation.mutateAsync({
            projectId: projectId as ProjectId,
        });
    };

    return (
        <div id="main-page" className={sectionBoxClasses}>
            <h4 className={sectionTitleClasses}>change main page</h4>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
            >
                <p className="prose">
                    One of your pages on cohost is your "main page"; this is the
                    page you see when you log in. Your main page can't be
                    deleted, but is otherwise the same as the other pages you
                    edit. Your main page is currently{" "}
                    <strong>@{selfProject.handle}</strong>.
                </p>

                <SettingsRow
                    bigLabel="change your main page to:"
                    inputElement={
                        <Controller
                            control={control}
                            name="projectId"
                            render={({ field: { onChange, value } }) => (
                                <ProjectChooser
                                    onChange={onChange}
                                    selectedProjectId={value as ProjectId}
                                />
                            )}
                        />
                    }
                />

                <FormSubmitButtonRow
                    submitMutation={changeSelfProjectMutation}
                    submitButtonLabel="change main page"
                />
            </form>
        </div>
    );
};
