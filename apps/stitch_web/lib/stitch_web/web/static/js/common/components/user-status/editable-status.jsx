import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Emoji } from "emoji-mart";
import Col from "react-bootstrap/lib/Col";
import Row from "react-bootstrap/lib/Row";
import Tooltip from "react-bootstrap/lib/Tooltip";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";

@inject("userStore")
@observer
class EditableStatus extends Component {

    constructor(...args) {
        super(...args);
        this.state = {
            clearIconDisplay: "none"
        };
    }

    clearStatus = () => {
        this.props.userStore.clearStatus();
    }

    onShowClearStatusIcon = () => {
        this.setState({ clearIconDisplay: 'block' });
    }

    onHideClearStatusIcon = () => {
        this.setState({ clearIconDisplay: 'none' });
    }


    render() {
        const { status } = this.props.user;
        let textStyles = { textAlign: "left", paddingLeft: "5px", paddingRight: "0", wordBreak: "break-word" };

        return (
            <div onMouseEnter={this.onShowClearStatusIcon} onMouseLeave={this.onHideClearStatusIcon}>
                <Row style={{ padding: "5% 10% 2%" }}>
                    <Col sm={2} style={{ textAlign: "right", paddingRight: "5px" }}>
                        <Emoji emoji={status.emoji} size={24} />
                    </Col>
                    <Col sm={9} style={textStyles}>
                        {status.text}
                    </Col>
                    <Col sm={1} style={{ textAlign: "left", paddingLeft: "2px", paddingRight: "0" }}>
                        <OverlayTrigger
                            ref={ref => {
                                this.overlayTrigger = ref;
                            }}
                            placement="top"
                            container={this.ref}
                            overlay={
                                <Tooltip id="userStatus-tooltip">Clear status</Tooltip>
                            }
                        >
                            <a onClick={this.clearStatus} style={{ display: this.state.clearIconDisplay }}>
                                <i className="fa fa-times" />
                            </a>
                        </OverlayTrigger>

                    </Col>
                </Row>
            </div>
        );
    }
}

export default EditableStatus;
