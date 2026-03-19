import { useUserInfo } from "@/client/preact/providers/user-info-provider";
import sitemap from "@/shared/sitemap";
import React, { FunctionComponent } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Helmet } from "react-helmet-async";
import { Button } from "../../elements/button";

const ModerationHomePage: FunctionComponent = () => {
    const { modMode } = useUserInfo();
    return (
        <>
            <Helmet title="moderation" />
            <div>
                {!modMode ? (
                    <div
                        className={`mb-2 flex flex-row items-start gap-4
                    rounded-lg border-2 border-red-700 bg-red-200 p-4
                    text-notBlack prose-p:my-2`}
                    >
                        <p className="flex-shrink-0">
                            <ExclamationTriangleIcon className="inline h-6 w-6 text-red-700" />
                        </p>
                        <div>
                            <p>
                                NOTICE! You are logged in as an account with
                                moderator permissions but are not currently
                                active in Mod Mode! Several of the pages listed
                                here WILL NOT WORK outside of Mod Mode!
                            </p>
                            <p>
                                Please visit the{" "}
                                <a
                                    href={sitemap.public
                                        .userSettings()
                                        .toString()}
                                >
                                    user settings page
                                </a>{" "}
                                to fix this!
                            </p>
                        </div>
                    </div>
                ) : null}
                <h1>moderation phone book</h1>
                <h2>Invites (mod mode not required)</h2>
                <ul>
                    <li>
                        <a href={sitemap.public.invites.manage().toString()}>
                            Invite management
                        </a>
                    </li>
                </ul>
                <h2>Maintenance</h2>
                <ul>
                    <li>
                        <a
                            href={sitemap.public.moderation
                                .cacheMaintenance()
                                .toString()}
                        >
                            Cache maintenance
                        </a>
                    </li>
                    <li>
                        <a
                            href={sitemap.public.moderation
                                .createOAuthClient()
                                .toString()}
                        >
                            Create a new OAuth client record
                        </a>
                    </li>
                </ul>
                <h2>Activation</h2>
                <ul>
                    <li>
                        <a
                            href={sitemap.public.moderation
                                .bulkActivate()
                                .toString()}
                        >
                            Bulk activate users
                        </a>
                    </li>
                </ul>
                <h2>Artist Alley</h2>
                <ul>
                    <li>
                        <a
                            href={sitemap.public.moderation
                                .artistAlleyPendingQueue()
                                .toString()}
                        >
                            Pending queue
                        </a>
                    </li>
                </ul>
                <h2 className="mb-0">Manage users</h2>
                <div className="flex flex-col">
                    <form
                        method="GET"
                        action={sitemap.public.moderation
                            .manageUser({})
                            .toString()}
                        className="flex flex-col"
                    >
                        <h4>by email</h4>
                        <div className="flex flex-row gap-3">
                            <input
                                type="email"
                                name="email"
                                placeholder="email"
                                required
                            />
                            <Button
                                type="submit"
                                buttonStyle="pill"
                                color="cherry"
                            >
                                submit
                            </Button>
                        </div>
                    </form>
                    <form
                        method="GET"
                        action={sitemap.public.moderation
                            .manageUser({})
                            .toString()}
                        className="flex flex-col"
                    >
                        <h4>by user ID</h4>
                        <div className="flex flex-row gap-3">
                            <input
                                type="number"
                                name="userId"
                                placeholder="user ID"
                                required
                                min={1}
                                step={1}
                            />
                            <Button
                                type="submit"
                                buttonStyle="pill"
                                color="cherry"
                            >
                                submit
                            </Button>
                        </div>
                    </form>
                </div>
                <h2 className="mb-0">Manage pages</h2>
                <div className="flex flex-col">
                    <form
                        method="GET"
                        action={sitemap.public.moderation
                            .manageProject({})
                            .toString()}
                        className="flex flex-col"
                    >
                        <h4>by handle</h4>
                        <div className="flex flex-row gap-3">
                            <input
                                type="text"
                                name="handle"
                                placeholder="handle"
                                required
                            />
                            <Button
                                type="submit"
                                buttonStyle="pill"
                                color="cherry"
                            >
                                submit
                            </Button>
                        </div>
                    </form>
                </div>
                <h2 className="mb-0">Manage ask</h2>
                <div className="flex flex-col">
                    <form
                        method="GET"
                        action={sitemap.public.moderation
                            .manageAsk({})
                            .toString()}
                        className="flex flex-col"
                    >
                        <h4>by handle</h4>
                        <div className="flex flex-row gap-3">
                            <input
                                type="text"
                                name="askId"
                                placeholder="ask ID"
                                required
                            />
                            <Button
                                type="submit"
                                buttonStyle="pill"
                                color="cherry"
                            >
                                submit
                            </Button>
                        </div>
                    </form>
                </div>
                <h2 className="mb-0">Tag ontology</h2>
                <ul>
                    <li>
                        <a
                            href={sitemap.public.moderation.tagOntology
                                .pendingRequests()
                                .toString()}
                        >
                            Pending requests
                        </a>
                    </li>
                    <li>
                        <a
                            href={sitemap.public.moderation.tagOntology
                                .manageTags()
                                .toString()}
                        >
                            Manage tags
                        </a>
                    </li>
                </ul>
            </div>
        </>
    );
};

export default ModerationHomePage;
