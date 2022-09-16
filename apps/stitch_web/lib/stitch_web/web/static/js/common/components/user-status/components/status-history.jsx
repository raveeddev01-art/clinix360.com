import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Emoji } from "emoji-mart";
import Col from "react-bootstrap/lib/Col";
import Row from "react-bootstrap/lib/Row";
import Tooltip from "react-bootstrap/lib/Tooltip";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import { STATUS_CLEAR_AFTER_OPTS } from "../../../../lib/constants";

@inject("userStore")
@observer
class StatusHistory extends Component {

    constructor(...args) {
        super(...args);
        this.state = {
            deleteIconsDisplay: ["none", "none", "none", "none", "none"],
            rowBackgroundColor: ["unset", "unset", "unset", "unset", "unset"],
            rowForegroundColor: ["unset", "unset", "unset", "unset", "unset"]
        };
    }

    onDeleteStatus = (e, status) => {
        e.stopPropagation();
        e.preventDefault();
        e.nativeEvent.stopImmediatePropagation();

        this.props.userStore.deleteStatus(status.id);
    }

    onRowVisibilityChanged = (event, index, displayStyle) => {
        let displays = this.state.deleteIconsDisplay;
        let bcgColors = this.state.rowBackgroundColor;
        let foreColors = this.state.rowForegroundColor;

        displays[index] = displayStyle;
        bcgColors[index] = displayStyle === 'none' ? 'unset' : '#036';
        foreColors[index] = displayStyle === 'none' ? '#333' : 'white';

        this.setState({ deleteIconsDisplay: displays, rowBackgroundColor: bcgColors, rowForegroundColor: foreColors });
    }


    render() {
        const { statusHistory } = this.props.userStore;

        return (
            <div>
                {statusHistory.map((status, i) => {
                    return (
                        <div
                            key={`status-${status.id}`}
                            onMouseEnter={(event) => this.onRowVisibilityChanged(event, i, 'block')}
                            onMouseLeave={(event) => this.onRowVisibilityChanged(event, i, 'none')}
                        >
                            <Row
                                onClick={(event) => this.props.onItemSelected(event, status)}
                                style={{
                                    marginLeft: "-25px",
                                    marginRight: "-25px",
                                    paddingTop: "5px",
                                    backgroundColor: this.state.rowBackgroundColor[i],
                                    cursor: "pointer"
                                }}>
                                <Col sm={1} style={{ paddingLeft: "25px", paddingRight: "10px" }}>
                                    <Emoji emoji={status.emoji} size={24} />
                                </Col>
                                <Col sm={10} style={{
                                    color: this.state.rowForegroundColor[i],
                                    paddingRight: 0,
                                    textOverflow: "ellipsis",
                                    overflow: "hidden",
                                    whiteSpace: "nowrap"
                                }}>
                                    {status.text} - {STATUS_CLEAR_AFTER_OPTS[status.clear_after].label}
                                </Col>
                                <Col sm={1} style={{ paddingLeft: "5px" }}>
                                    <OverlayTrigger
                                        ref={ref => {
                                            this.overlayTrigger = ref;
                                        }}
                                        placement="top"
                                        container={this.ref}
                                        overlay={
                                            <Tooltip id="delete-status-tooltip">Delete</Tooltip>
                                        }
                                    >
                                        <a
                                            onClick={(event) => this.onDeleteStatus(event, status)}
                                            style={{ display: this.state.deleteIconsDisplay[i], color: "white" }}>
                                            <i className="fa fa-times" />
                                        </a>
                                    </OverlayTrigger>

                                </Col>
                            </Row>
                        </div>
                    );
                })}
            </div>
        );
    }
}

export default StatusHistory;
