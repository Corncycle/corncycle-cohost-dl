/* eslint-disable jsx-a11y/alt-text */

import artbug from "@/client/images/artbug.png";
import bugcoin from "@/client/images/bugcoin.png";
import eggbug from "@/client/images/ebcherry.svg";
import helpbug from "@/client/images/helpbug.png";

import { sitemap } from "@/shared/sitemap";
import React, { FunctionComponent, useCallback, useMemo } from "react";
import { Kiki } from "../../elements/icon";
import { OutlineEgg } from "../../icons/outline-egg";

import asscEggGroup from "@/client/images/icons/landing/assc-egg-group.svg";
import cohostPlusEgg from "@/client/images/icons/landing/cohost-plus.svg";
import handEgg from "@/client/images/icons/landing/hand-egg.svg";
import windowEgg from "@/client/images/icons/landing/window-egg.svg";
import { HeartIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { AuthnButton } from "../../partials/authn-button";

import papyrus from "@/client/images/papyrus.png";
import bradley from "@/client/images/landing-page/bradley-icon.jpg";
import boldbug from "@/client/images/landing-page/boldbug.png";
import bouba from "@/client/images/landing-page/shitty-bouba.png";

// #region placeholder
import nicole from "@/client/images/placeholders/nkidman.jpg";
import { AvatarShape } from "@/shared/types/projects";
// #endregion

import { mulberry32 } from "../../partials/numbers";
import { useSiteConfig } from "@/client/preact/providers/site-config-provider";

const TESTIMONIALS = false;

const LonganBGEgg: FunctionComponent = () => {
    return (
        <>
            {/* large screens */}
            <svg
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 981 599"
                className="absolute right-0 top-0 hidden max-w-prose md:block lg:w-[981px]"
            >
                <path
                    d="M473.876 555.193c106.808 31.942 207.926 46.417 303.352 43.422 95.426-2.994 177.3-25.538 245.622-67.633 68.32-42.094 115.41-106.438 141.27-193.034 26.01-87.09 21.96-166.864-12.15-239.3224-34.11-72.4586-90.31-135.8907-168.592-190.2968-78.284-54.4058-170.83-97.5808-277.638-129.5228-106.313-31.795-207.023-46.282-302.127-43.461-95.106 2.82-176.905 25.117-245.4 66.89C89.7187-155.992 42.5412-91.8079 16.6796-5.21267-9.1815 81.3826-4.97002 161.07 29.3137 233.85c34.2838 72.78 90.3703 136.583 168.2593 191.41s169.99 98.138 276.303 129.933Z"
                    fill="#FFF1DF"
                />
            </svg>
            {/* mobile */}
            <svg
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 320 315"
                className="absolute right-0 top-0 -z-10 block w-full md:hidden"
            >
                <path
                    d="M228.375 208.272c27.132 8.111 52.818 11.787 77.058 11.026 24.24-.76 45.038-6.485 62.393-17.174 17.355-10.689 29.317-27.028 35.887-49.017 6.606-22.115 5.578-42.372-3.087-60.7714-8.665-18.3995-22.94-34.5068-42.826-48.3221-19.886-13.8154-43.395-24.7787-70.526-32.8899C260.268 3.04995 234.685-.628789 210.526.0875697 186.368.803784 165.589 6.46565 148.19 17.073c-17.399 10.6075-29.384 26.9057-35.953 48.8949-6.569 21.9892-5.5 42.2241 3.209 60.7051s22.956 34.683 42.742 48.605c19.785 13.922 43.181 24.92 70.187 32.994Z"
                    fill="#FFF1DF"
                />
                <path
                    d="M28.75 306.848c-18.0877 5.407-35.21173 7.858-51.372 7.351-16.1602-.507-30.0253-4.324-41.5954-11.45-11.5701-7.126-19.5448-18.018-23.9243-32.678-4.4046-14.743-3.7187-28.248 2.0579-40.514 5.7766-12.266 15.2934-23.004 28.5506-32.215 13.2574-9.21 28.9298-16.519 47.0175-21.926 18.00391-5.383 35.0589-7.835 51.1647-7.358 16.1059.478 29.9585 4.252 41.5579 11.324 11.5994 7.072 19.5891 17.937 23.9681 32.597 4.38 14.659 3.667 28.149-2.139 40.47-5.8061 12.32-15.3042 23.122-28.4945 32.403-13.1904 9.282-28.7876 16.613-46.7915 21.996Z"
                    fill="#FAD8D6"
                />
            </svg>
        </>
    );
};

/**
 * currently unused
 */
const TestimonialBlock: FunctionComponent<{
    handle: string;
    imageURL: string;
    body: string;
    className?: string;
    frame?: AvatarShape;
}> = React.memo(
    ({ handle, imageURL, body, className = "", frame = "circle" }) => {
        return (
            <div
                className={`${className} cohost-shadow-light flex max-h-fit flex-col items-center justify-center rounded-lg bg-notWhite`}
            >
                <div className="h-9 w-full flex-none justify-self-start rounded-t-lg bg-longan-100"></div>
                <div className="flex flex-row items-center justify-center gap-3 px-3 py-2 lg:flex-col lg:items-start lg:p-6">
                    <img
                        src={imageURL}
                        className={`mask mask-${frame} h-9 w-9 self-start object-cover lg:h-16 lg:w-16`}
                    />
                    <blockquote className="font-atkinson text-sm leading-none -tracking-tight text-notBlack before:content-['“'] after:content-['”'] lg:text-2xl lg:font-bold">
                        {body}
                    </blockquote>
                </div>
                <div className="flex flex-col items-end self-stretch bg-white px-3 py-2 lg:py-6">
                    <cite className="font-league text-xs font-semibold not-italic leading-none text-black before:content-['@'] lg:text-xl">
                        {handle}
                    </cite>
                </div>
                <div className="h-9 w-full flex-none justify-self-end rounded-b-lg bg-longan-100"></div>
            </div>
        );
    }
);
TestimonialBlock.displayName = "TestimonialBlock";

const FeatureBlock: FunctionComponent<{
    title: string;
    body: string;
    iconURL: string;
    colorClassName: string;
}> = React.memo((props) => {
    return (
        <div className="flex flex-row py-2 lg:w-80 lg:flex-col lg:gap-3 lg:py-0">
            <div className="w-16 flex-none lg:w-auto">
                <img
                    src={sitemap.public.static
                        .staticAsset({ path: props.iconURL })
                        .toString()}
                    className="h-6 w-auto lg:h-14"
                />
            </div>
            <div className="flex flex-col gap-3">
                <h3
                    className={`font-atkinson text-lg font-bold leading-none tracking-wide ${props.colorClassName} lg:text-2xl`}
                >
                    {props.title}
                </h3>
                <p className="text-base">{props.body}</p>
            </div>
        </div>
    );
});
FeatureBlock.displayName = "FeatureBlock";

const FakePost: FunctionComponent<{
    className?: string;
    tags?: string[];
    numComments?: number;
}> = React.memo(({ className = "", tags = [], numComments = 0 }) => {
    const { t } = useTranslation();
    return (
        <div
            className={`${className} flex select-none flex-col items-center rounded-lg bg-white p-0`}
        >
            <div className="flex flex-none flex-row items-center justify-between gap-3 self-stretch rounded-t-lg bg-notWhite p-3">
                <div className="flex flex-none flex-row items-center gap-2 p-0">
                    <span className="flex-none font-atkinson text-sm font-bold leading-none text-notBlack">
                        bradley
                    </span>
                    <span className="font-atkinson text-sm leading-none text-notBlack before:content-['@']">
                        soupconsultant
                    </span>
                    <ArrowPathIcon className="h-4 w-4 text-notBlack" />
                    <span className="flex-none font-atkinson text-sm font-bold leading-none text-notBlack">
                        bouba
                    </span>
                    <span className="font-atkinson text-sm leading-none text-notBlack before:content-['@']">
                        bouba
                    </span>
                </div>
            </div>
            <hr className="mx-3 self-stretch border-gray-300" />
            <div className="flex flex-none flex-col items-start self-stretch bg-white">
                <div className="m-3 flex flex-row flex-wrap items-center gap-2">
                    <div
                        className={`flex-0 mask relative aspect-square h-8 w-8`}
                    >
                        <img
                            src={sitemap.public.static
                                .staticAsset({
                                    path: boldbug,
                                })
                                .toString()}
                            className={`mask mask-squircle h-full w-full object-cover`}
                        />
                    </div>
                    <span className="flex-none font-atkinson text-sm font-bold leading-none text-notBlack">
                        eggbug!
                    </span>
                    <span className="font-atkinson text-sm leading-none text-notBlack before:content-['@']">
                        eggbug
                    </span>
                </div>
                <div className="prose p-3">
                    <p>
                        <strong>
                            I think bold text on cohost should always be in
                            papyrus
                        </strong>
                    </p>
                </div>
                <hr className="mx-3 self-stretch border-gray-300" />
                <div className="m-3 flex flex-row flex-wrap items-center gap-2">
                    <div
                        className={`flex-0 mask relative aspect-square h-8 w-8`}
                    >
                        <img
                            src={sitemap.public.static
                                .staticAsset({
                                    path: bouba,
                                })
                                .toString()}
                            className={`mask mask-capsule-big h-full w-full object-cover`}
                        />
                    </div>
                    <span className="flex-none font-atkinson text-sm font-bold leading-none text-notBlack">
                        bouba
                    </span>
                    <span className="font-atkinson text-sm leading-none text-notBlack before:content-['@']">
                        bouba
                    </span>
                </div>
                <div className="prose p-3">
                    <p>
                        <span style={{ fontFamily: "Papyrus" }}>
                            I think bold text on cohost should always be in
                            papyrus
                        </span>
                    </p>
                </div>
                <hr className="mx-3 self-stretch border-gray-300" />
                <div className="m-3 flex flex-row flex-wrap items-center gap-2">
                    <div
                        className={`flex-0 mask relative aspect-square h-8 w-8`}
                    >
                        <img
                            src={sitemap.public.static
                                .staticAsset({
                                    path: bradley,
                                })
                                .toString()}
                            className={`mask mask-egg h-full w-full object-cover`}
                        />
                    </div>
                    <span className="flex-none font-atkinson text-sm font-bold leading-none text-notBlack">
                        bradley
                    </span>
                    <span className="font-atkinson text-sm leading-none text-notBlack before:content-['@']">
                        soupconsultant
                    </span>
                </div>
                <img
                    className="w-full"
                    src={sitemap.public.static
                        .staticAsset({
                            path: papyrus,
                        })
                        .toString()}
                />
                {tags.length ? (
                    <div className="flex flex-row flex-wrap items-center gap-2 p-3 font-atkinson text-xs leading-tight text-gray-600">
                        {tags.map((tag) => (
                            <span className="before:content-['#']" key={tag}>
                                {tag}
                            </span>
                        ))}
                    </div>
                ) : null}
            </div>
            <div className="flex flex-none flex-row items-center justify-between gap-3 self-stretch rounded-b-lg bg-notWhite p-3">
                <span className="flex-none text-xs leading-none text-gray-600">
                    {t("client:post-preview.num-comments", {
                        count: numComments,
                        defaultValue: "{{numComments}} comment",
                        numComments: numComments,
                    })}
                </span>
                <div className="align-start flex flex-none flex-row gap-3 p-0 text-notBlack">
                    <ArrowPathIcon className="h-6 w-6" />
                    <HeartIcon className="h-6 w-6" />
                </div>
            </div>
        </div>
    );
});
FakePost.displayName = "FakePost";

const CoreIdeaBlock: FunctionComponent<{ header: string; body: string }> =
    React.memo(({ header, body }) => (
        <div>
            <h3 className="font-atkinson text-lg font-bold leading-tight text-strawberry-400 lg:text-2xl">
                {header}
            </h3>
            <p className="text-base">{body}</p>
        </div>
    ));
CoreIdeaBlock.displayName = "CoreIdeaBlock";

const ComingSoonBlock: FunctionComponent<{
    imageURL: string;
    header: string;
    body: string;
}> = React.memo(({ imageURL, header, body }) => (
    <div className="flex min-w-80 flex-col gap-2 py-2 lg:w-80 lg:gap-6 lg:py-0">
        <img src={imageURL} className="m-2 max-w-xs self-center" />
        <h4 className="font-league text-base font-semibold uppercase leading-tight tracking-tighter text-black lg:text-xl">
            {header}
        </h4>
        <p className="max-w-prose font-atkinson text-base leading-tight text-black lg:text-2xl">
            {body}
        </p>
    </div>
));
ComingSoonBlock.displayName = "ComingSoonBlock";

export const LandingPage: FunctionComponent = () => {
    const eggbugURL = sitemap.public.static
        .staticAsset({ path: eggbug })
        .toString();
    const bradleyURL = sitemap.public.static
        .staticAsset({ path: bradley })
        .toString();

    const { operatingPrime } = useSiteConfig();
    const seededRng = useMemo(
        () => mulberry32(operatingPrime),
        [operatingPrime]
    );
    const [textRoll] = useMemo(() => [seededRng()], [seededRng]);
    const text = useMemo(() => {
        if (textRoll < 0.02) {
            // https://cohost.org/kokoscript/post/7721520-there-are-2-weeks-le
            return "where yuri and yaoi live in harmony.";
        } else if (textRoll < 0.07) {
            return "somehow, posting feels good in a place like this.";
        } else {
            return "posting, but better.";
        }
    }, [textRoll]);

    return (
        <>
            <LonganBGEgg />
            <div className="container relative mx-auto flex flex-col">
                {/* first row */}
                <div className="grid w-full grid-cols-12 gap-5">
                    <div className="col-span-12 flex flex-col gap-2 px-6 py-6 lg:col-span-6 lg:px-0 lg:py-32">
                        <h1 className="font-atkinson text-2xl font-bold leading-none tracking-wide text-cherry-700 lg:text-6xl">
                            {text}
                        </h1>
                        <p className="font-atkinson text-base leading-none tracking-wide text-cherry-700 lg:text-2xl">
                            cohost is a new social media platform built from the
                            ground up by a small team of developers and
                            designers who like sharing things on the internet.
                        </p>
                        <AuthnButton
                            as="a"
                            className="cohost-shadow-light mb-20 mt-6 w-max font-atkinson text-xl font-bold lowercase -tracking-tight text-notWhite lg:mb-0 lg:mt-16 lg:text-2xl"
                            href={sitemap.public.signup().toString()}
                        >
                            get started
                        </AuthnButton>
                    </div>
                    <div className="relative hidden h-[36rem] lg:col-span-5 lg:col-start-8 lg:block">
                        <Kiki className="absolute left-8 top-12 w-20 rotate-[-14.3deg] text-mango-400" />
                        <OutlineEgg className="absolute -left-28 top-64 w-[300px] text-strawberry-400" />
                        <div className="absolute left-44 top-28 flex h-96 w-80 flex-col rounded-lg border-2 border-mango-500">
                            <div className="h-9 w-full flex-none"></div>
                            <div className="w-full flex-1 border-y-2 border-mango-500"></div>
                            <div className="h-9 w-full flex-none"></div>
                        </div>
                        <Kiki className="absolute left-[408px] top-48 w-36 rotate-[70.37deg] text-cherry-600" />
                        {/* initial fake post, not using component due to visual differences */}
                        <div className="cohost-shadow-light absolute top-48 flex h-96 w-80 flex-col rounded-lg bg-notWhite">
                            <div className="flex h-9 w-full flex-none select-none flex-row items-center gap-3 px-3 py-0">
                                <span className="flex-none font-atkinson text-sm font-bold leading-none text-notBlack">
                                    eggbug!
                                </span>
                                <span className="font-atkinson text-sm leading-none text-notBlack before:content-['@']">
                                    eggbug
                                </span>
                            </div>
                            <div className="relative w-full flex-1 bg-longan-300">
                                <div className="absolute inset-x-16 inset-y-0">
                                    <img
                                        src={eggbugURL}
                                        className="h-full w-full object-contain"
                                    />
                                </div>
                            </div>
                            <div className="h-9 w-full flex-none"></div>
                        </div>
                    </div>
                </div>
                <div className="flex w-full flex-row flex-wrap justify-around px-6 py-4 text-notBlack lg:flex-nowrap lg:px-0 lg:py-32">
                    <FeatureBlock
                        title="no ads, no tracking. forever."
                        body={`cohost will never sell your data, sell ads, or
                                sell the company to anyone who might change
                                these policies to make a quick buck.`}
                        colorClassName="text-cherry"
                        iconURL={handEgg}
                    />
                    <FeatureBlock
                        title="algorithm? what algorithm?"
                        body={`all your follows’ posts, in the order they were
                                posted, in a timeline that goes vertically.
                                clear and effective moderation done by humans.`}
                        colorClassName="text-strawberry-400"
                        iconURL={windowEgg}
                    />
                    <FeatureBlock
                        title="here’s our whole business model."
                        body={`for now, you can give us a few bucks a month to
                                help us keep the lights on. soon we’ll let you
                                take tips and sell subscriptions to help you
                                keep the lights on too.`}
                        colorClassName="text-mango-400"
                        iconURL={cohostPlusEgg}
                    />
                </div>
            </div>
            <div className="w-full bg-cherry-800 text-notWhite">
                <div className="container mx-auto grid grid-cols-1 gap-5 bg-cherry-800 py-10 text-notWhite lg:grid-cols-12 lg:py-32">
                    <div className="flex flex-col justify-center px-6 lg:col-span-4 lg:col-start-2 lg:px-0">
                        <FakePost
                            className="cohost-shadow-dark max-w-prose"
                            numComments={6}
                            tags={["cohost", "papyrus", "undertale"]}
                        />
                    </div>
                    <div className="flex max-w-prose flex-col justify-center gap-6 px-6 lg:col-span-5 lg:col-start-7 lg:gap-14 lg:px-0">
                        <h1 className="font-atkinson text-xl font-bold leading-tight text-strawberry-400 lg:-mb-4 lg:text-4xl">
                            our core ideas
                        </h1>
                        <CoreIdeaBlock
                            header="nobody has gotten it quite right yet"
                            body={`we think existing platforms have some good ideas,
                                    but no one’s managed to create one without profound
                                    flaws. we’re borrowing liberally from other sites,
                                    but we want to build cohost into something that
                                    works well and serves its users rather than
                                    just another clone.`}
                        />
                        <CoreIdeaBlock
                            header="there is value in being in the same place as everyone"
                            body={`on a web without functioning search engines,
                                    blogs and friends-only sites may be okay for
                                    some, but they leave people who are scraping
                                    by on public visibility and word of mouth in
                                    the lurch.`}
                        />
                        <CoreIdeaBlock
                            header="…but nobody wants a digital panopticon"
                            body={`on modern social media, there is an ever-present
                                    fear that someone will see your post, have their
                                    own bad faith interpretation, and decide to ruin
                                    your day over it. platforms are often built to
                                    encourage this sort of behavior to drive up
                                    engagement, but they don’t have to be.`}
                        />
                        <CoreIdeaBlock
                            header="metrics are ruining our lives"
                            body={`modern social media is designed around a
                                    vicious feedback loop that keeps users Engaged
                                    at the expense of their mental health, all
                                    in order to make their executives more money.`}
                        />
                        <CoreIdeaBlock
                            header="the value of social media is its posts"
                            body={`we aren’t the ones providing the most important
                                    part of cohost — you are. cohost exists to give
                                    you ways to express yourself and stay in touch with your
                                    friends.`}
                        />
                    </div>
                </div>
            </div>
            <div className="container mx-auto px-6 py-16 lg:px-0 lg:py-32">
                <h2 className="w-full text-center font-atkinson text-2xl font-bold leading-none text-cherry-700 lg:text-5xl">
                    cohost isn’t finished yet.
                    <br />
                    we’re building around users, not profit.
                </h2>
            </div>
            <div className="flex w-full flex-col gap-4 bg-longan-100 py-6 lg:gap-12 lg:py-32">
                <h2 className="text-center font-atkinson text-xl font-bold text-cherry-700 lg:text-4xl">
                    coming soon to cohost
                </h2>
                <div className="container mx-auto flex flex-row flex-wrap justify-evenly px-6 lg:flex-nowrap lg:px-0">
                    <ComingSoonBlock
                        imageURL={sitemap.public.static
                            .staticAsset({ path: artbug })
                            .toString()}
                        header="finding new things"
                        body={`discovering new posts is tricky without algorithms,
                                but we’re committed to getting it right and trying
                                new things until we get there. curation should be
                                done by people, not computers.`}
                    />
                    <ComingSoonBlock
                        imageURL={sitemap.public.static
                            .staticAsset({ path: bugcoin })
                            .toString()}
                        header="selling your stuff"
                        body={`an on-site tip jar and subscription management with
                                supporters-only posts, returning any surplus to
                                you by lowering platform fees, instead of pocketing it.`}
                    />
                    <ComingSoonBlock
                        imageURL={sitemap.public.static
                            .staticAsset({ path: helpbug })
                            .toString()}
                        header="getting your input"
                        body={`running cohost is our job and it shouldn’t have to
                                be yours too — but we’re building out systems that
                                let users provide meaningful input into how we
                                should run it.`}
                    />
                </div>
            </div>
            {TESTIMONIALS ? (
                <>
                    <div className="container mx-auto grid px-6 py-6 lg:grid-cols-12 lg:px-0 lg:py-32">
                        <div className="prose flex flex-col justify-center prose-p:font-atkinson prose-p:text-xs prose-p:leading-tight prose-p:text-notBlack lg:col-span-5 lg:col-start-2 lg:prose-p:text-xl">
                            <h2 className="no-prose font-atkinson text-sm font-bold text-cherry-500 lg:text-2xl">
                                cohost is a new social media platform based
                                around two core ideas:
                            </h2>
                            <p>
                                we believe that designing everything around
                                maximum engagement is making the internet worse
                                for everyone, and we believe a better web is
                                possible.
                            </p>
                            <p>cohost is our first step in this direction.</p>
                        </div>
                        <div className="hidden lg:col-span-4 lg:col-start-8 lg:block"></div>
                    </div>
                    <div className="w-full bg-strawberry-400 py-16">
                        <div className="container mx-auto flex flex-wrap items-center justify-evenly lg:flex-nowrap">
                            <TestimonialBlock
                                body="Somehow, posting feels good in a place like this."
                                handle="NicoleKidman"
                                imageURL={sitemap.public.static
                                    .staticAsset({ path: nicole })
                                    .toString()}
                                className="my-8 w-80"
                                frame="capsule-big"
                            />
                            <TestimonialBlock
                                body="meow meow meow meow meow"
                                handle="soupconsultant"
                                imageURL={bradleyURL}
                                className="my-8 w-80"
                                frame="squircle"
                            />
                            <TestimonialBlock
                                body="meow meow meow meow meow"
                                handle="soupconsultant"
                                imageURL={bradleyURL}
                                className="my-8 w-80"
                                frame="capsule-big"
                            />
                        </div>
                    </div>
                </>
            ) : null}
            <div className="container mx-auto grid grid-cols-1 gap-12 py-6 lg:grid-cols-12 lg:gap-5 lg:py-32">
                <div className="row-start-2 flex flex-col gap-3 px-6 lg:col-span-8 lg:col-start-1 lg:row-start-1 lg:gap-4 lg:px-0">
                    <h2 className="font-atkinson text-xl font-bold leading-tight text-strawberry-400 lg:text-5xl">
                        brought to you by{" "}
                        <span className="text-cherry-600 sm:whitespace-nowrap">
                            anti software software club
                        </span>
                        .
                    </h2>
                    <h3 className="font-league text-lg font-semibold tracking-tighter text-black lg:text-xl">
                        a software company that hates the software industry.
                    </h3>
                    <p className="prose font-atkinson text-base leading-tight text-black lg:my-8 lg:text-2xl">
                        we are a group of three developers and
                        designers&mdash;and maybe more soon!&mdash;with very
                        strong opinions about how to operate a software company.
                        we’ve all left jobs at conventional tech companies to
                        build cohost and we’re thrilled we finally get to share
                        it with the world. you can read more about us, including{" "}
                        <a href="https://antisoftware.club/manifesto.html">
                            our manifesto
                        </a>
                        , on{" "}
                        <a href="https://antisoftware.club">our main website</a>
                        . ASSC is not-for-profit and 100% worker owned.
                    </p>
                </div>
                <div className="row-start-1 px-6 lg:col-span-4 lg:px-0">
                    <img
                        className="mx-auto w-full max-w-[154.38px] lg:max-w-[427px]"
                        src={sitemap.public.static
                            .staticAsset({ path: asscEggGroup })
                            .toString()}
                    />
                </div>
            </div>
            <div className="relative w-full bg-longan-300 py-28">
                <div className="container mx-auto flex flex-col items-center gap-3 lg:gap-14">
                    <h2 className="text-center font-league text-xl font-bold leading-none -tracking-tight text-cherry-700 lg:text-6xl">
                        ready to post?
                    </h2>
                    <AuthnButton
                        as="a"
                        className="cohost-shadow-light w-max font-atkinson text-xl font-bold lowercase -tracking-tight text-notWhite lg:text-2xl"
                        href={sitemap.public.signup().toString()}
                    >
                        sign up for cohost
                    </AuthnButton>
                </div>
                <img
                    src={eggbugURL}
                    className="absolute bottom-4 right-5 w-12 lg:w-32"
                />
            </div>
        </>
    );
};
