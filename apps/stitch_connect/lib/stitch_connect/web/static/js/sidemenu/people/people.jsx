import React, { Component, PropTypes } from "react";
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import CreateDMModal from "./modals/create-dm-modal";
import InvitationModal from "./modals/invitation-modal";
import PeopleList from "./people_list";

class People extends Component {
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

  showinviteModal = evt => {
    evt.preventDefault();
    this.toggleinviteModal();
  };

  render() {
    return (
      <div className="menu-nav people m-b-20">
        <div className="heading">
          <h5>
            <a href onClick={this.showTeamModal}>
              {this.props.heading}
            </a>
          </h5>
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="open-a-direct-message">Invite People</Tooltip>
            }
          >
            <a href onClick={this.showInviteModal}>
              <i className="fa fa-plus-square-o" />
            </a>
          </OverlayTrigger>
        </div>

        <PeopleList />
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

People.propTypes = {
  heading: PropTypes.string.isRequired
};

export default People;
