import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";

import CreateDMModal from "./modals/create-dm-modal";
import Room from "../room";

@inject("userStore")
@observer
class PeopleList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showTeamModal: false
    };
  }

  toggleTeamModal = () => {
    this.setState({
      showTeamModal: !this.state.showTeamModal
    });
  };

  showTeamModal = evt => {
    evt.preventDefault();
    this.toggleTeamModal();
  };

  render() {
    const { heading, rooms, userStore } = this.props;

    return (
      <div className="menu-nav people m-b-20">
        <div className="heading">
          <h5>
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id="open-a-direct-message">Direct Message</Tooltip>
              }
            >
              <a role="button" onClick={this.showTeamModal}>
                {heading}
              </a>
            </OverlayTrigger>
          </h5>

          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="open-a-direct-message">Direct Message</Tooltip>
            }
          >
            <a onClick={this.showTeamModal}>
              <i className="fa fa-plus-square-o" />
            </a>
          </OverlayTrigger>
        </div>

        {rooms.map(room => <Room key={`room-${room.id}`} room={room} />)}

        {userStore.canInvite && (
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="invite-people-modal">Invite Members</Tooltip>}
          >
            <a
              role="button"
              className="invite-link"
              onClick={this.props.showInviteModal}
            >
              Invite Members
            </a>
          </OverlayTrigger>
        )}

        <CreateDMModal
          show={this.state.showTeamModal}
          toggle={this.toggleTeamModal}
        />
      </div>
    );
  }
}

PeopleList.propTypes = {
  heading: PropTypes.string.isRequired,
  rooms: PropTypes.arrayOf(PropTypes.object).isRequired,
  showInviteModal: PropTypes.func.isRequired
};

export default PeopleList;
