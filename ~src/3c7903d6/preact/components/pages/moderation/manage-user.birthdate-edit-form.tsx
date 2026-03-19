import React, { FunctionComponent } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { trpc } from "@/client/lib/trpc";
import { WireUserModel } from "@/shared/types/wire-models";
import { DateTime } from "luxon";
import { Button } from "../../elements/button";

type Inputs = {
    birthdate: string;
};

const SIXTEEN_YEARS_AGO = DateTime.now().minus({ years: 16 });

export const BirthdateEditForm: FunctionComponent<{
    user: WireUserModel;
    birthdate: string;
}> = ({ user, birthdate }) => {
    const { register, handleSubmit, formState } = useForm<Inputs>({
        defaultValues: {
            // get just the date component of the ISO string. date inputs are very particular about this
            birthdate: birthdate.substring(0, 10),
        },
    });

    const mutateBirthdate = trpc.moderation.user.changeBirthdate.useMutation();

    const onSubmit: SubmitHandler<Inputs> = async ({ birthdate }) => {
        await mutateBirthdate.mutateAsync({
            userId: user.userId,
            date: birthdate,
        });
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-row items-center gap-4"
        >
            <input
                type="date"
                max={SIXTEEN_YEARS_AGO.toISODate()}
                {...register("birthdate", {
                    required: true,
                    max: SIXTEEN_YEARS_AGO.toISODate(),
                })}
            />
            <Button buttonStyle="pill" color="cherry" type="submit">
                save birthdate
            </Button>
            {formState.isSubmitting ? (
                <span className="font-bold">sending...</span>
            ) : null}
            {formState.isSubmitSuccessful ? (
                <span className="font-bold text-green">Saved!</span>
            ) : null}
        </form>
    );
};
