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

  renderTooltip(timestamp) {
    return (
      <Tooltip id="date-tooltip">
        {moment(timestamp).calendar()}
      </Tooltip>
    );
  }

  render() {
    const { messagePool } = this.props;
    const { id, user, createdAt: timestamp } = messagePool[0];
    const className = cx("message", {
      "message-own": user.id === currentUser.id
    });

    return (
      <div className={className}>
        <div className="content">
          <div className="content-header">
            {`${user.first_name} ${user.last_name} `}
            <OverlayTrigger
              placement="top"
              overlay={this.renderTooltip(timestamp)}
            >
              <span className="time">
                {moment(timestamp).format("HH:mm A")}
              </span>
            </OverlayTrigger>
            <Dropdown
              id={`message-actions-${id}`}
              componentClass="div"
              className="message-actions"
            >
              <Dropdown.Toggle useAnchor />
              <Dropdown.Menu>
                <MenuItem onClick={this.toggleStar}>
                  <i className="fa fa-star-o" /> Star
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
