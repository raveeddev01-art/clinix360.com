import React, { Component } from "react";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";

import Room from "./room";
import GroupsModal from "./modals/groups_modal";
import CreateGroupModal from "./modals/create_group_modal";

export default class RoomsList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showGroupsModal: false,
      showCreateGroupModal: false
    };
  }

  toggleGroupsModal = () => {
    this.setState({
      showGroupsModal: !this.state.showGroupsModal
    });
  };

  toggleCreateGroupModal = () => {
    this.setState({
      showCreateGroupModal: !this.state.showCreateGroupModal
    });
  };

  render() {
    return (
      <div className="menu-nav m-b-20">
        <div className="heading">
          <h5>
            <a role="button" onClick={this.toggleGroupsModal}>
              {this.props.heading}
            </a>
          </h5>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="create-new-group">Create new room</Tooltip>}
          >
            <a role="button" onClick={this.toggleCreateGroupModal}>
              <i className="fa fa-plus-square-o" />
            </a>
          </OverlayTrigger>
        </div>

        {this.props.rooms.map(room => {
          return <Room key={`room-${room.id}`} room={room} />;
        })}

        <GroupsModal
          showModal={this.state.showGroupsModal}
          toggleModal={this.toggleGroupsModal}
        />

        <CreateGroupModal
          showModal={this.state.showCreateGroupModal}
          toggleModal={this.toggleCreateGroupModal}
        />
      </div>
    );
  }
}
