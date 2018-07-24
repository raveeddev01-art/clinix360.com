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

  onOpenConversation = () => {
    const { inboxStore, conversation } = this.props;
    inboxStore.reopenConversation(conversation.id);
  };

  renderStatusToggle() {
    const { conversation } = this.props;

    return conversation.open ? (
      <div className="closed" onClick={this.onCloseConversation}>
        <i className="fa fa-check" /> Close
      </div>
    ) : (
      <div className="closed" onClick={this.onOpenConversation}>
        <i className="fa fa-inbox" /> Reopen
      </div>
    );
  }

  render() {
    const { asPatient, conversation } = this.props;

    const linkClass = cx("item", {
      active: parseInt(this.props.match.params.id, 10) === conversation.id
    });

    const linkLocation = asPatient
      ? `/patient/conversations/${conversation.id}`
      : `/conversations/${conversation.id}`;

    const dateClass = cx("date", {
      "provider-date": !asPatient
    });

    return (
      <Link to={linkLocation} className={linkClass}>
        <div className="item__icon">
          <i className="fa fa-circle" />
        </div>

        <div className="item__content">
          <div className="heading">
            <div className="user">{conversation.subject}</div>

            <div className={dateClass}>
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

            {!asPatient && this.renderStatusToggle()}
          </div>

          <div className="message">
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
  asPatient: false,
  conversation: PropTypes.object.isRequired
};

Conversation.propTypes = {
  asPatient: PropTypes.bool,
  conversation: PropTypes.object
};

export default withRouter(Conversation);
