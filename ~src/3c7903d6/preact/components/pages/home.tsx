import React, { FunctionComponent } from "react";
import { LandingPage } from "./welcome/landing-page";

export const Home: FunctionComponent<unknown> = () => {
    return <LandingPage />;
};

Home.displayName = "home";
export default Home;
