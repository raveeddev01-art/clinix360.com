import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import classNames from "classnames";

class Room extends Component {
  render() {
    const { unread, active, name } = this.props;

    const roomClass = classNames("item", {
      unread: unread === true,
      active: active === true
    });

    return (
      <Link to="/engage" className={roomClass}>
        <div className="item__icon">
          <i className="fa fa-circle" />
        </div>

        <div className="item__content">
          <div className="heading">
            <div className="user">{name}</div>
            <div className="date">9:45 AM</div>
          </div>

          <div className="message">
            I have a question about my recent medication. I’m not sure how about
            what dosage I should be taking. Can you
          </div>
        </div>
      </Link>
    );
  }
}

Room.defaultProps = {
  active: false,
  unread: false,
  name: "John Doe"
};

Room.propTypes = {
  active: PropTypes.bool,
  unread: PropTypes.bool,
  name: PropTypes.string
};

export default Room;
