import sitemap from "@/shared/sitemap";
import React, { FunctionComponent } from "react";
import { Helmet } from "react-helmet-async";

export const ActivationSuccess: FunctionComponent = () => {
    return (
        <>
            <Helmet title="activation success" />
            <div>
                <h1>Account activated!</h1>
                <p>
                    Welcome to cohost! Your account is now fully activated and
                    you can post, comment, and share to your heart's content!
                    Please remember to follow our{" "}
                    <a
                        href={sitemap.public
                            .staticContent({ slug: "community-guidelines" })
                            .toString()}
                    >
                        Community Guidelines
                    </a>{" "}
                    and have fun!
                </p>
            </div>
        </>
    );
};

ActivationSuccess.displayName = "activation-success";
export default ActivationSuccess;
