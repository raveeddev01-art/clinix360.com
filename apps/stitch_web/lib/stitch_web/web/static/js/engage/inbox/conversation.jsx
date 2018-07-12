import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import moment from "moment";
import cx from "classnames";

@inject("inboxStore")
@observer
class Conversation extends Component {
  onCloseConversation = () => {
    const { inboxStore, conversation } = this.props;
    inboxStore.closeConversation(conversation.id);
  };

  render() {
    const { conversation } = this.props;
    const { patient } = conversation;

    const linkClass = cx("item", {
      active: parseInt(this.props.match.params.id, 10) === conversation.id
    });

    return (
      <Link to={`/conversations/${conversation.id}`} className={linkClass}>
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

            <div className="closed" onClick={this.onCloseConversation}>
              <i className="fa fa-check" /> Close
            </div>
          </div>

          <div className="message">
            <div className="subject">This is a temporary hardcoded subject</div>

            <div className="text">
              {conversation.latest_conversation_message
                ? conversation.latest_conversation_message.text_content
                : conversation.conversation_messages[0].text_content}
            </div>
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

export default withRouter(Conversation);
