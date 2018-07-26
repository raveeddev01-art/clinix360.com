import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import UserMention from "./user-mention";

@inject("usersStore")
@observer
export default class UserMentionById extends Component {
  render() {
    const { usersStore, id } = this.props;

    // TODO remove below once mention is implemented. We are not sending mention at all from this moment.
    // below code is just not to break from old msgs sent on engage before disabling mentions
    if (window.currentPatient) {
      return "@anonymous";
    }

    const user = usersStore.usersById[id] || {};

    return <UserMention user={user} {...this.props} />;
  }
}

UserMentionById.propTypes = {
  id: PropTypes.number.isRequired
};
