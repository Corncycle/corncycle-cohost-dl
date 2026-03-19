import sitemap from "@/shared/sitemap";
import { ProjectHandle } from "@/shared/types/ids";
import React, { FunctionComponent } from "react";
import { CohostLogo } from "./elements/icon";
import { DateTime } from "luxon";

export const Footer: FunctionComponent = React.memo(() => {
    return (
        <footer className="-mb-20 w-full bg-notBlack pb-20 pt-8 text-notWhite">
            <div className="container mx-auto grid px-6 lg:grid-cols-12 lg:px-0">
                <div className="flex flex-col gap-3 py-3 lg:col-span-3 lg:py-0">
                    <CohostLogo className="w-52 text-notWhite" />
                    <ul className="list-none text-sm">
                        <li>
                            &copy; {DateTime.now().year}{" "}
                            <a
                                href="https://antisoftware.club/"
                                className="underline"
                            >
                                anti software software club llc
                            </a>
                        </li>
                        <li>thanks for using cohost</li>
                    </ul>
                </div>
                <div className="flex flex-col gap-3 py-3 lg:col-span-2 lg:py-0">
                    <h4 className="font-atkinson text-sm font-bold leading-none -tracking-tight lg:py-3">
                        Legal
                    </h4>
                    <ul className="flex list-none flex-col gap-3 font-league text-xs font-normal text-notWhite">
                        <li>
                            <a
                                href={sitemap.public
                                    .staticContent({ slug: "tos" })
                                    .toString()}
                                className="hover:underline"
                            >
                                Terms of Use
                            </a>
                        </li>
                        <li>
                            <a
                                href={sitemap.public
                                    .staticContent({ slug: "privacy" })
                                    .toString()}
                                className="hover:underline"
                            >
                                Privacy Notice
                            </a>
                        </li>
                        <li>
                            <a
                                href={sitemap.public
                                    .staticContent({
                                        slug: "community-guidelines",
                                    })
                                    .toString()}
                                className="hover:underline"
                            >
                                Community Guidelines
                            </a>
                        </li>
                    </ul>
                </div>
                <div className="flex flex-col gap-3 py-3 lg:col-span-2 lg:py-0">
                    <h4 className="font-atkinson text-sm font-bold leading-none -tracking-tight lg:py-3">
                        About
                    </h4>
                    <ul className="flex list-none flex-col gap-3 font-league text-xs font-normal text-notWhite">
                        <li>
                            <a
                                href="https://help.antisoftware.club/support/solutions/articles/62000227811-how-to-install-the-cohost-app"
                                className="hover:underline"
                            >
                                install cohost on your phone
                            </a>
                        </li>
                        <li>
                            <a
                                href={sitemap.public.project
                                    .mainAppProfile({
                                        projectHandle: "staff" as ProjectHandle,
                                    })
                                    .toString()}
                                className="hover:underline"
                            >
                                @staff
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://help.antisoftware.club/"
                                className="hover:underline"
                            >
                                Support
                            </a>
                        </li>
                    </ul>
                </div>
                <div className="-mt-3 flex flex-col gap-3 py-3 lg:col-span-2 lg:mt-0 lg:py-0">
                    <ul className="flex list-none flex-col gap-3 font-league text-xs font-normal text-notWhite lg:mt-[50px]">
                        <li>
                            <a
                                href={sitemap.public
                                    .staticContent({ slug: "credits" })
                                    .toString()}
                                className="hover:underline"
                            >
                                Credits
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://status.cohost.org"
                                className="hover:underline"
                            >
                                cohost status
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://jobs.gusto.com/boards/anti-software-software-club-844d514c-4e9d-43e2-9b9c-12088dd3d526"
                                className="hover:underline"
                            >
                                Careers
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </footer>
    );
});
Footer.displayName = "Footer";
