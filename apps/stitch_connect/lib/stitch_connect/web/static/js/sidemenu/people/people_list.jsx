import React, { Component } from "react";
import PropTypes from "prop-types";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";

import CreateDMModal from "./modals/create-dm-modal";
import InvitationModal from "./modals/invitation-modal";
import Room from "../room";

class PeopleList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showTeamModal: false,
      showInviteModal: false
    };
  }

  toggleTeamModal = () => {
    this.setState({
      showTeamModal: !this.state.showTeamModal
    });
  };

  toggleInviteModal = () => {
    this.setState({
      showInviteModal: !this.state.showInviteModal
    });
  };

  showTeamModal = evt => {
    evt.preventDefault();
    this.toggleTeamModal();
  };

  showInviteModal = evt => {
    evt.preventDefault();
    this.toggleInviteModal();
  };

  render() {
    const { heading, rooms } = this.props;

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

        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id="invite-people-modal">Invite People</Tooltip>}
        >
          <a
            role="button"
            className="invite-link"
            onClick={this.showInviteModal}
          >
            Invite People
          </a>
        </OverlayTrigger>

        <CreateDMModal
          show={this.state.showTeamModal}
          toggle={this.toggleTeamModal}
        />
        <InvitationModal
          show={this.state.showInviteModal}
          toggle={this.toggleInviteModal}
        />
      </div>
    );
  }
}

PeopleList.propTypes = {
  heading: PropTypes.string.isRequired,
  rooms: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default PeopleList;
