import React, { FunctionComponent } from "react";
import { Trans } from "react-i18next";
import { useUserInfo } from "../../../providers/user-info-provider";
import { StandardHeader } from "./standard-header";

export const ReadOnlyHeader: FunctionComponent = () => {
    const { loggedIn, readOnly } = useUserInfo();

    return loggedIn && readOnly ? (
        <StandardHeader>
            <Trans
                parent="div"
                className="prose mx-auto"
                i18nKey="client:header-notice.read-only"
            >
                <p>
                    <strong>Heads up!</strong> Your account is currently
                    read-only while we investigate a report against your
                    account. <strong>This is not a ban!</strong> We'll be in
                    touch if we have any questions or need any information to
                    make a moderation decision.
                </p>
            </Trans>
        </StandardHeader>
    ) : null;
};
