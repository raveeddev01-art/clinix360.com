import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Emoji } from "emoji-mart";
import Col from "react-bootstrap/lib/Col";
import Row from "react-bootstrap/lib/Row";
import Tooltip from "react-bootstrap/lib/Tooltip";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";

@inject("userStore")
@observer
class UserStatus extends Component {

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

    getTextStyles() {
        return this.props.showFullText
            ? { wordBreak: "break-word" }
            : { textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" };
    }

    renderReadOnly() {
        const { status } = this.props.user;
        let styles = { textAlign: "left", padding: "0px 10px 0 0" };
        let textStyles = { ...styles, ...this.getTextStyles() };

        return (
            <Row style={{ margin: 0 }}>
                <Col sm={2} style={{ textAlign: "right", padding: "0px 5px 0 0" }}>
                    <Emoji emoji={status.emoji} size={18} />
                </Col>
                <Col sm={10} style={textStyles}>
                    {status.text}
                </Col>
            </Row>
        );
    }

    renderWithActions() {
        const { status } = this.props.user;
        let styles = { textAlign: "left", paddingLeft: "5px", paddingRight: "0" };
        let textStyles = { ...styles, ...this.getTextStyles() };

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

    renderIconOnly() {
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

    render() {
        const { user, readOnly, iconOnly } = this.props;

        if (!user.status.active) {
            return <div />;
        }

        return (
            <div>
                {iconOnly && this.renderIconOnly()}
                {!readOnly && this.renderWithActions()}
                {readOnly && !iconOnly && this.renderReadOnly()}
            </div>
        );
    }
}

export default UserStatus;
