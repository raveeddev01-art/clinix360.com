import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import UserMention from "./user-mention";

@inject("usersStore")
@observer
export default class UserMentionById extends Component {
  render() {
    const { usersStore, id } = this.props;
    const user = usersStore.usersById[id] || {};

    return <UserMention user={user} {...this.props} />;
  }
}

UserMentionById.propTypes = {
  id: PropTypes.number.isRequired
};
