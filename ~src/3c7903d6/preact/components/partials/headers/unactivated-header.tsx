import sitemap from "@/shared/sitemap";
import React, { FunctionComponent } from "react";
import { Trans } from "react-i18next";
import { useUserInfo } from "../../../providers/user-info-provider";
import { InfoBox } from "../../elements/info-box";
import { StandardHeader } from "./standard-header";

export const UnactivatedHeader: FunctionComponent = () => {
    const { loggedIn, activated, emailVerified } = useUserInfo();

    return loggedIn && !activated ? (
        <StandardHeader>
            <>
                <Trans
                    parent="div"
                    className="prose mx-auto"
                    i18nKey="client:header-notice.unactivated"
                >
                    <p>
                        <strong>Heads up!</strong> You're still in the waiting
                        period before you can post! While you're free to follow,
                        like, and share other users' posts, you can't comment or
                        make any new posts yet.
                    </p>
                    <p>
                        This waiting period lasts a day or two, so just hold
                        tight. We'll email you when you can post. You can find
                        more information on{" "}
                        <a
                            href="https://help.antisoftware.club/support/solutions/articles/62000224749-details-on-invites-and-the-restrictions-on-un-activated-accounts/"
                            target="_blank"
                            rel="noreferrer"
                        >
                            our support site!
                        </a>
                    </p>
                </Trans>
                {!emailVerified ? (
                    <Trans
                        parent={InfoBox}
                        level="info"
                        className="mx-auto mt-6 max-w-prose"
                        i18nKey="client:header-notice.unverified-unactivated"
                    >
                        <div className="prose prose-sm">
                            <p>
                                You won't be activated until you've verified
                                your email address. Check for an email from
                                no-reply@no-reply.cohost.org. If you can't find
                                it, you can resend it from the{" "}
                                <a
                                    href={sitemap.public
                                        .userSettings()
                                        .toString()}
                                >
                                    settings page
                                </a>
                                .
                            </p>
                        </div>
                    </Trans>
                ) : null}
            </>
        </StandardHeader>
    ) : null;
};
