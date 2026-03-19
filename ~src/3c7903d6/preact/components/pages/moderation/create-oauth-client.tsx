import { trpc } from "@/client/lib/trpc";
import { OAuthClientId, OAuthClientSecret } from "@/shared/types/ids";
import { TRPCClientError } from "@trpc/client";
import React, { FunctionComponent, useCallback } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { BasicButton } from "../../elements/basic-button";
// polyfills for node crypto randombytes/randomuuid
import randomBytes from "randombytes";
import { v4 } from "uuid";

type CreateOAuthClientInputs = {
    clientId: OAuthClientId;
    clientSecret: OAuthClientSecret;
    friendlyName: string;
    redirectUri: string;
};

function generateClientSecret(): string {
    return randomBytes(32).toString("hex");
}

export const CreateOAuthClientPage: FunctionComponent = (props) => {
    const { register, handleSubmit } = useForm<CreateOAuthClientInputs>({
        defaultValues: {
            clientId: v4(),
            clientSecret: generateClientSecret(),
            friendlyName: "",
            redirectUri: "",
        },
    });

    const createOAuthClientMutation =
        trpc.moderation.oauthClient.create.useMutation();

    const onSubmit = useCallback<SubmitHandler<CreateOAuthClientInputs>>(
        (inputs) => {
            const promise = createOAuthClientMutation.mutateAsync({
                clientId: inputs.clientId as OAuthClientId,
                clientSecret: inputs.clientSecret as OAuthClientSecret,
                friendlyName: inputs.friendlyName,
                redirectUri: inputs.redirectUri,
            });

            toast
                .promise(promise, {
                    loading: "creating client...",
                    success: "client created",
                    error(err) {
                        if (err instanceof TRPCClientError) {
                            return err.message;
                        }

                        return "unknown error";
                    },
                })
                .catch(() => null);
        },
        [createOAuthClientMutation]
    );

    return (
        <>
            <h1 className="text-4xl font-bold">create OAuth client record</h1>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
            >
                <label htmlFor="client-id">client id</label>
                <input type="text" {...register("clientId")} id="client-id" />

                <label htmlFor="client-secret">
                    client secret (this will never be displayed again, write it
                    down)
                </label>
                <input
                    type="text"
                    {...register("clientSecret")}
                    id="client-secret"
                />

                <label htmlFor="friendly-name">friendly name</label>
                <input
                    type="text"
                    {...register("friendlyName")}
                    id="friendly-name"
                />

                <label htmlFor="redirect-uri">redirect URI</label>
                <input
                    type="text"
                    {...register("redirectUri")}
                    id="redirect-uri"
                />

                <BasicButton
                    type="submit"
                    buttonSize="regular"
                    buttonColor="cherry"
                >
                    submit
                </BasicButton>
            </form>
        </>
    );
};
CreateOAuthClientPage.displayName = "create-oauth-client-page";

export default CreateOAuthClientPage;
