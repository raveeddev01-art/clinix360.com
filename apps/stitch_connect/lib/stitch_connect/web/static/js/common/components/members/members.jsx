import React, { Component, PropTypes } from "react";
import { observer } from "mobx-react";
import { Async } from "react-select";
import presenceStore from "../../stores/presence_store";
import MemberOption from "./member_option";

@observer
class Members extends Component {
  constructor(props) {
    super(props);
    this.state = { members: props.value || [] };
  }

  componentWillReceiveProps(nextProps) {
    if (
      Array.isArray(nextProps.value) &&
      nextProps.value.length !== this.props.value.length
    ) {
      this.setState({ members: nextProps.value });
    }
  }

  _getMembers = (term, callback) => {
    return post(`/api/v1/users/search`, { body: { term } }).then(resp => {
      const onlineUsers = Object.keys(presenceStore.onlineUsersMap);
      const options = resp.data.map(user => ({
        ...user,
        online: onlineUsers.indexOf(`${user.id}`) > -1
      }));
      return { options, complete: true };
    });
  };

  render() {
    return (
      <Async
        multi
        className="multi-select-large"
        placeholder="Type a name or email to add collegues"
        onChange={this.props.onChange}
        value={this.state.members}
        valueKey="id"
        labelKey="username"
        optionComponent={MemberOption}
        loadOptions={this._getMembers}
        promptTextCreator={label => `Add member - ${label}`}
      />
    );
  }
}

export default Members;
