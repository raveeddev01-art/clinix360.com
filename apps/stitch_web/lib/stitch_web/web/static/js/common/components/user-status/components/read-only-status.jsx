import React, { Component } from "react";
import { observer } from "mobx-react";
import { Emoji } from "emoji-mart";
import Col from "react-bootstrap/lib/Col";
import Row from "react-bootstrap/lib/Row";

@observer
class ReadOnlyStatus extends Component {
    getTextStyles() {
        return this.props.showFullText
            ? { wordBreak: "break-word" }
            : { textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" };
    }

    render() {
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
}

export default ReadOnlyStatus;
