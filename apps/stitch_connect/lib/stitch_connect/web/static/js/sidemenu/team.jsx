import React, { Component } from "react";

import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import Tooltip from "react-bootstrap/lib/Tooltip";
import Modal from "react-bootstrap/lib/Modal";
import FormControl from "react-bootstrap/lib/FormControl";

export default class Team extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    };
  }

  toggleTeamModal = () => {
    this.setState({
      showTeamModal: !this.state.showTeamModal
    });
  };

  render() {
    return (
      <div className="menu-nav people m-b-20">
        <div className="heading">
          <h5>
            {this.props.heading}
          </h5>
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="open-a-direct-message">
                Open a Direct Message
              </Tooltip>
            }
          >
            <a href="#" onClick={this.toggleTeamModal}>
              <i className="fa fa-plus" />
            </a>
          </OverlayTrigger>
        </div>

        <a href="#" className="item">
          <div className="item-icon">
            <i className="fa fa-circle-o" />
          </div>
          <div className="item-text">John Appleseed</div>
        </a>
        <a href="#" className="item">
          <div className="item-icon">
            <i className="fa fa-circle-o" />
          </div>
          <div className="item-text">Jason Plex</div>
        </a>
        <a href="#" className="item">
          <div className="item-icon">
            <i className="fa fa-circle-o" />
          </div>
          <div className="item-text">Emily Braun</div>
        </a>
        <a href="#" className="item">
          <div className="item-icon">
            <i className="fa fa-circle-o" />
          </div>
          <div className="item-text">James Myers</div>
        </a>

        <Modal className="sidemenu-modal" show={this.state.showTeamModal}>
          <Modal.Header>
            <Modal.Title>People</Modal.Title>
            <a href="#" onClick={this.toggleTeamModal}>
              <i className="fa fa-close" />
            </a>
          </Modal.Header>

          <Modal.Body>
            <div className="modal-search">
              <FormControl
                type="text"
                value={this.state.value}
                placeholder="Search members"
                className="input-lg"
                onChange={this.handleChange}
              />
            </div>

            <h5 className="team-heading text-muted">
              Click to select team members to start chat with.
            </h5>

            <div className="team-list">
              <div className="team-member">
                <i className="fa fa-circle" /> Daniel Tapia{" "}
                <span className="text-muted">daniel</span>
              </div>

              <div className="team-member">
                <i className="fa fa-circle-o" /> Jason Plex{" "}
                <span className="text-muted">jason</span>
              </div>

              <div className="team-member">
                <i className="fa fa-circle" /> Emily Braun{" "}
                <span className="text-muted">em</span>
              </div>

              <div className="team-member">
                <i className="fa fa-circle-o" /> James Myers{" "}
                <span className="text-muted">jamesmyers</span>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}
