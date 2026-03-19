import React from "react";
import { AuthnButton } from "../partials/authn-button";

type Mutation =
    | {
          isSuccess: boolean;
          isError: false;
          isLoading: boolean;
          error: null;
      }
    | {
          isSuccess: boolean;
          isError: true;
          isLoading: boolean;
          error: { message: string };
      };

type FormSubmitButtonRowProps<TSubmitMutation> = {
    submitMutation: TSubmitMutation;
    submitButtonLabel: string;
};

export const FormSubmitButtonRow = <TSubmitMutation extends Mutation>(
    props: FormSubmitButtonRowProps<TSubmitMutation>
) => {
    return (
        <div className="flex w-full flex-row items-center justify-end gap-4 font-bold text-notWhite">
            {props.submitMutation.isSuccess ? (
                <p className="text-green">saved!</p>
            ) : null}
            {props.submitMutation.isError ? (
                <p className="text-red">{props.submitMutation.error.message}</p>
            ) : null}

            <AuthnButton
                type="submit"
                disabled={props.submitMutation.isLoading}
                className="font-bold"
            >
                {props.submitButtonLabel}
            </AuthnButton>
        </div>
    );
};
