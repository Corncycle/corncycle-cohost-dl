import { trpc } from "@/client/lib/trpc";
import { useUserInfo } from "@/client/preact/providers/user-info-provider";
import React, { FunctionComponent } from "react";
import { InfoBox } from "../../elements/info-box";
import { sectionBoxClasses } from "../shared";

export const PositionInQueue: FunctionComponent = () => {
    const { activated, emailVerified } = useUserInfo();
    const positionInQueue = trpc.users.getPositionInQueue.useQuery(undefined, {
        enabled: !activated,
        suspense: true,
    });

    if (activated) {
        return null;
    }

    return (
        <div id="invites-activation" className={sectionBoxClasses}>
            <h5 className="h5">check your place in line</h5>

            {!emailVerified ? (
                <InfoBox level="warning">
                    <div className="prose prose-sm">
                        <p>
                            <strong>
                                Your email address has not been verified!
                            </strong>{" "}
                            You cohost account will not be activated until
                            you've verified your email address.
                        </p>
                        <p>
                            Search your spam folder for emails from
                            "no-reply@no-reply.cohost.org" if you're having
                            trouble finding it, you can resend it from the top
                            of this page.
                        </p>
                    </div>
                </InfoBox>
            ) : null}

            <div className="prose">
                <p>
                    You're not activated yet! There are currently{" "}
                    {positionInQueue.data?.toLocaleString("en-US")} people in
                    front of you.
                </p>
                <p>
                    We're activating new batches of users almost every day, so
                    you'll get to the front soon enough!
                </p>
                <p>
                    For more information, check out{" "}
                    <a href="https://help.antisoftware.club/en/support/solutions/articles/62000224749-how-do-i-get-an-invite-to-cohost-and-activate-my-account-">
                        our support page on the topic
                    </a>
                    .
                </p>
            </div>
        </div>
    );
};
