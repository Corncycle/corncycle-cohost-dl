import { ReportingReasonsResp } from "@/shared/api-types/moderation-v1";
import sitemap from "@/shared/sitemap";
import { PostId } from "@/shared/types/ids";
import { Dialog } from "@headlessui/react";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import React, { FunctionComponent, useCallback, useContext } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { useDataLoader } from "../preact/hooks/data-loaders";
import { ReportingUIContext } from "./machine";

const useReportingReasons = (onError?: (e: any) => void) =>
    useDataLoader<ReportingReasonsResp>(
        sitemap.public.apiV1.reporting.listReasons().toString(),
        onError
    );

type Inputs = {
    reportingReason: string;
    additionalDetails: string;
};

export interface ReportFormProps {
    whatsWrong: string;
}

export const ReportForm: FunctionComponent<ReportFormProps> = ({
    whatsWrong,
}) => {
    const service = useContext(ReportingUIContext);
    const { t } = useTranslation();

    const { register, handleSubmit, setError, formState } = useForm<Inputs>({
        mode: "all",
    });

    const onLoadError = useCallback(() => {
        setError("reportingReason", {
            message: t(
                "common:report.loading-failed",
                "Loading report form failed.  Please e-mail support@cohost.org about your concerns."
            ),
        });
    }, [setError, t]);

    const reportingReasons = useReportingReasons(onLoadError);

    const onSubmit: SubmitHandler<Inputs> = (data) => {
        service.send({
            type: "SUBMIT",
            reportingReason: data.reportingReason,
            additionalDetails: data.additionalDetails,
        });
    };

    return (
        <div className="cohost-shadow-light dark:cohost-shadow-dark relative mx-auto flex max-w-md flex-col rounded-lg">
            <div className="flex flex-row rounded-t-lg bg-longan p-3 text-notBlack">
                <button
                    className="h-6 w-6"
                    onClick={() => service.send({ type: "CLOSE" })}
                >
                    <ChevronLeftIcon className="h-6 w-6" />
                </button>

                <Dialog.Title as="div" className="text-xl font-bold leading-6">
                    {t("common:report.title", "Report an issue")}
                </Dialog.Title>
            </div>

            <form
                className="flex flex-col rounded-b-lg bg-notWhite text-notBlack"
                onSubmit={handleSubmit(onSubmit)}
            >
                <p className="px-3 pt-3 text-xl font-bold text-foreground">
                    {whatsWrong}
                </p>

                <p className="px-3 pb-3">
                    <Trans i18nKey="common:report.moderation-guide">
                        If you're not sure, check out{" "}
                        <a
                            href={sitemap.public
                                .staticContent({ slug: "community-guidelines" })
                                .toString()}
                            target="_new"
                            className="text-secondary"
                        >
                            our community guidelines
                        </a>{" "}
                        for help.
                    </Trans>
                </p>

                <hr className="border-gray-300" />

                {reportingReasons.data?.map((reason) => (
                    <>
                        <div
                            key={reason.id}
                            className="flex flex-row items-center gap-3 p-3"
                        >
                            <input
                                type="radio"
                                id={`reason-${reason.id}`}
                                value={reason.text}
                                {...register("reportingReason", {
                                    required: true,
                                })}
                            />
                            <label htmlFor={`reason-${reason.id}`}>
                                {reason.text}
                            </label>
                        </div>
                        <hr className="border-gray-300" />
                    </>
                ))}

                <p className="m-3">
                    {t(
                        "common:report.additional-details",
                        "Use the form below to provide any context you think is helpful:"
                    )}
                </p>

                <div className="m-3">
                    <textarea
                        className="w-full"
                        rows={4}
                        {...register("additionalDetails")}
                    ></textarea>
                </div>

                <div className="flex flex-row">
                    <p className="mr-3 flex-1 text-right align-top text-red">
                        {formState.errors.reportingReason &&
                            (formState.errors.reportingReason.message ?? (
                                <span>
                                    {t(
                                        "common:report.must-select-reason",
                                        "You must select a reporting reason."
                                    )}
                                </span>
                            ))}
                    </p>

                    <button
                        type="submit"
                        className={`mb-3 mr-3 min-w-0
    rounded-lg bg-foreground px-4 py-1 
    text-lg font-bold text-notWhite hover:bg-foreground-600 active:bg-foreground-700 disabled:bg-foreground-200`}
                        disabled={!formState.isValid}
                    >
                        {t("common:report.report-button", "report")}
                    </button>
                </div>
            </form>
        </div>
    );
};
ReportForm.displayName = "ReportForm";
