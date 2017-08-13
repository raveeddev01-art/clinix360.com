import React, { Component, PropTypes } from "react";
import cx from "classnames";
import moment from "moment";

import Dropdown from "react-bootstrap/lib/Dropdown";
import MenuItem from "react-bootstrap/lib/MenuItem";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";

class Message extends Component {
  constructor(props) {
    super(props);

    this.toggleStar = this.toggleStar.bind(this);
  }

  toggleStar() {
    console.log("toggleStar");
  }

  render() {
    const { messagePool } = this.props;
    const { id, starred, user, createdAt: timestamp } = messagePool[0];
    const className = cx("message", {
      "message-own": user.id === currentUser.id
    });
    const timestampTooltip = (
      <Tooltip id="date-tooltip">
        {moment(timestamp).calendar()}
      </Tooltip>
    );
    const starTooltip = (
      <Tooltip id="star-tooltip">Unstar this message</Tooltip>
    );

    return (
      <div className={className}>
        <div className="content">
          <div className="content-header">
            {`${user.first_name} ${user.last_name} `}

            <OverlayTrigger placement="top" overlay={timestampTooltip}>
              <span className="time">
                {moment(timestamp).format("HH:mm A")}
              </span>
            </OverlayTrigger>

            {starred &&
              <OverlayTrigger placement="top" overlay={starTooltip}>
                <span
                  className="icon-star"
                  role="link"
                  onClick={this.toggleStar}
                >
                  <i className="fa fa-star" />
                </span>
              </OverlayTrigger>}

            <Dropdown
              id={`message-actions-${id}`}
              componentClass="div"
              className="message-actions"
            >
              <Dropdown.Toggle useAnchor />
              <Dropdown.Menu>
                <MenuItem onClick={this.toggleStar}>
                  <i className="fa fa-star-o" /> {starred ? "Unstar" : "Star"}
                </MenuItem>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <div className="content-body">
            {messagePool.map(msg =>
              <p key={`text_${msg.id}`}>
                {msg.text}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
}

Message.propTypes = {
  messagePool: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default Message;
