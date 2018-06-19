import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import moment from "moment";

class Conversation extends Component {
  render() {
    const { conversation } = this.props;

    const { patient } = conversation;

    return (
      <Link to="/engage" className="item">
        <div className="item__icon">
          <i className="fa fa-circle" />
        </div>

        <div className="item__content">
          <div className="heading">
            <div className="user">{patient.full_name}</div>

            <div className="date">
              {moment
                .utc(conversation.updated_at)
                .local()
                .calendar(null, {
                  sameDay: "h:mm A",
                  lastDay: "[Yesterday]",
                  lastWeek: "M/D/YY",
                  sameElse: "M/D/YY"
                })}
            </div>
          </div>

          <div className="message">
            {/* {conversation.latest_conversation_message.text_content} */}
          </div>
        </div>
      </Link>
    );
  }
}

Conversation.defaultProps = {
  conversation: PropTypes.object.isRequired
};

Conversation.propTypes = {
  conversation: PropTypes.object
};

export default Conversation;
