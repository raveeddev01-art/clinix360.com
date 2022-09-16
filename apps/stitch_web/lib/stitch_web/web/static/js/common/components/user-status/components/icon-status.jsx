import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Emoji } from "emoji-mart";
import Tooltip from "react-bootstrap/lib/Tooltip";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";

@observer
class IconStatus extends Component {

    render() {
        const { status } = this.props.user;

        return (
            <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="user-status">{status.text}</Tooltip>}
            >
                <span role="button" className="user-status">
                    <Emoji emoji={status.emoji} size={18} />
                </span>
            </OverlayTrigger>
        );
    }
}

export default IconStatus;
