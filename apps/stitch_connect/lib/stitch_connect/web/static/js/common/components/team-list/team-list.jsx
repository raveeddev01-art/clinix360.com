import React, { Component } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import cx from "classnames";

class TeamList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchFilter: "",
      members: this.getValue(props.value)
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      this.setState({ members: this.getValue(nextProps.value) }, () => {
        this.selectComponent.focus();
      });
    }
  }

  onChangeFilter = searchFilter => {
    setTimeout(() => this.setState({ searchFilter }), 100);
  };

  onSelectUser = user => () => {
    this.props.onSelectUser(user);
    this.selectComponent.focus();
  };

  getValue = value => {
    const { users } = this.props;
    const members = value.split(",");
    return users.filter(u => members.indexOf(`${u.id}`) > -1).map(u => ({
      id: u.id,
      label: u.full_name
    }));
  };

  handleChange = members => {
    this.props.onChange(members.map(m => m.id).join(","));
  };

  render() {
    const { children, users, isOnline, hideCurrentUser } = this.props;
    const { members, searchFilter } = this.state;
    const teamList = users.filter(u => {
      if (hideCurrentUser && u.id === currentUser.id && members.length > 0)
        return false;
      return (
        members.findIndex(member => member.id === u.id) === -1 &&
        u.full_name.toLowerCase().indexOf(searchFilter.toLowerCase()) > -1
      );
    });

    return (
      <div className="team-list__container">
        <div className="modal-search dm-modal-user-search">
          <Select
            ref={node => {
              this.selectComponent = node;
            }}
            multi
            valueKey="id"
            className="multi-select-large"
            onInputChange={this.onChangeFilter}
            onChange={this.handleChange}
            placeholder="Search"
            onBlurResetsInput
            value={members}
          />
        </div>

        <h5 className="team-heading text-muted">{children}</h5>

        <div className="team-list">
          {teamList.map(user => {
            const online = isOnline(user.id);
            const iconClasName = cx("fa", {
              "fa-circle": online,
              "fa-circle-o": !online
            });

            return (
              <div
                key={`team-list-${user.id}`}
                className="team-member"
                onClick={this.onSelectUser(user)}
              >
                <i className={iconClasName} />
                {` ${user.full_name}${user.id === currentUser.id
                  ? " (You)"
                  : ""}`}
                <span className="text-muted">{user.username}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

TeamList.propTypes = {
  onChange: PropTypes.func.isRequired,
  isOnline: PropTypes.func.isRequired,
  value: PropTypes.string,
  users: PropTypes.array.isRequired,
  hideCurrentUser: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  onSelectUser: PropTypes.func
};

TeamList.defaultProps = {
  onChange: () => {},
  isOnline: () => {},
  onSelectUser: () => {},
  hideCurrentUser: false,
  children: "",
  value: ""
};

export default TeamList;
