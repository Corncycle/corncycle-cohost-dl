import React, { FunctionComponent } from "react";
import { Switch } from "../elements/switch";

type Props = {
    hideReplies: boolean;
    setHideReplies: (value: boolean) => void;
    hideShares: boolean;
    setHideShares: (value: boolean) => void;
    hideAsks: boolean;
    setHideAsks: (value: boolean) => void;
};

const ProfileViewFilterControls: FunctionComponent<Props> = (props) => {
    return (
        <div className="mt-4 flex flex-row gap-4">
            <Switch
                offLabel="show shares"
                onLabel="hide shares"
                onChange={(value) => props.setHideShares(value)}
                initial={props.hideShares}
            />

            <Switch
                offLabel="show replies"
                onLabel="hide replies"
                onChange={(value) => props.setHideReplies(value)}
                initial={props.hideReplies}
            />

            <Switch
                offLabel="show asks"
                onLabel="hide asks"
                onChange={(value) => props.setHideAsks(value)}
                initial={props.hideAsks}
            />
        </div>
    );
};

export default ProfileViewFilterControls;
