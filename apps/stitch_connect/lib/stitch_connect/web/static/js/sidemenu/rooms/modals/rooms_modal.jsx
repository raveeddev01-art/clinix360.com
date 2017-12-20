import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import { withRouter } from "react-router-dom";
import slugify from "slugify";

import Modal from "react-bootstrap/lib/Modal";
import Form from "react-bootstrap/lib/Form";
import Col from "react-bootstrap/lib/Col";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Button from "react-bootstrap/lib/Button";

import RoomItem from "./room_item";
import { Members, Toggle } from "common/components";

@inject("groupsStore")
@observer
class RoomsModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filter: "",
      members: [],
      public: true,
      name: ""
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.state !== this.props.state && !!nextProps.state) {
      // members should be set manualy set empty when modal is open
      this.setState({ members: [], filter: "" });
    }
  }

  onModalEntered = () => {
    this.setState({ members: [], filter: "", name: "" });
  };

  getSlug() {
    return this.state.name
      ? `#${slugify(this.state.name, { lower: true })}`
      : "";
  }

  handleChange = event => {
    const { value } = event.target;

    this.setState({
      filter: value
    });
  };

  filterRooms() {
    const { groupsStore } = this.props;
    const { filter } = this.state;
    const rooms = groupsStore.normalGroups.filter(room =>
      room.name.toLowerCase().startsWith(filter.toLowerCase())
    );

    return {
      joined: rooms.filter(room => room.joined),
      notJoined: rooms.filter(room => !room.joined)
    };
  }

  updateValue = field => evt => {
    this.setState({ [field]: evt.target.value });
  };

  cleanName = e => {
    const re = /^[\w\-\s]+$/;
    if (!re.test(e.key)) {
      e.preventDefault();
    }
  };

  updateMembers = value => {
    this.setState({ members: value });
  };

  togglePublic = () => {
    this.setState({ public: !this.state.public });
  };

  switchToCreateModal = () => {
    this.setState({ name: this.state.filter });
    this.props.showRoomCreateModal();
  };

  createRoom = () => {
    const { groupsStore, history, closeModal } = this.props;

    groupsStore
      .createGroup({
        name: this.state.name.trim(),
        public: this.state.public,
        user_ids: this.state.members.map(user => user.id)
      })
      .then(slug => {
        history.push(`/rooms/${slug}`);
        closeModal();
      });
  };

  canCreateRoom = () => {
    const { name, members } = this.state;
    return name.trim() !== "" && members && members.length !== 0;
  };

  renderModalHeader() {
    const {
      state,
      showRoomsListModal,
      showRoomCreateModal,
      closeModal
    } = this.props;

    return (
      <Modal.Header>
        <Modal.Title>
          {state === "list" && "Browse Rooms"}
          {state === "create" && "Create Room"}
        </Modal.Title>
        {state === "list" && (
          <Button bsSize="xsmall" onClick={showRoomCreateModal}>
            Create Room
          </Button>
        )}
        {state === "create" && (
          <Button bsSize="xsmall" onClick={showRoomsListModal}>
            Browse Rooms
          </Button>
        )}
        <a role="link" onClick={closeModal}>
          <i className="fa fa-close" />
        </a>
      </Modal.Header>
    );
  }

  renderRoomsListModal() {
    const { closeModal } = this.props;
    const rooms = this.filterRooms();

    return (
      <Modal.Body>
        <div className="rooms-filter">
          <input
            type="text"
            className="form-control input-lg"
            placeholder="Find room"
            onChange={this.handleChange}
          />
        </div>

        <div className="rooms-filter-result">
          {rooms.notJoined.length > 0 && (
            <div className="rooms-list">
              <h5 className="rooms-list-heading">Rooms you can join</h5>
              <div className="rooms-list-content">
                {rooms.notJoined.map(room => (
                  <RoomItem key={room.id} room={room} closeModal={closeModal} />
                ))}
              </div>
            </div>
          )}
          {rooms.joined.length > 0 && (
            <div className="rooms-list">
              <h5 className="rooms-list-heading">Rooms you belong to</h5>
              <div className="rooms-list-content">
                {rooms.joined.map(room => (
                  <RoomItem key={room.id} room={room} closeModal={closeModal} />
                ))}
              </div>
            </div>
          )}
          {rooms.notJoined.length === 0 &&
            rooms.joined.length === 0 && (
              <div className="no-result text-center">
                <p>No rooms found.</p>
                <Button bsSize="large" onClick={this.switchToCreateModal}>
                  Create a room called <strong>{this.state.filter}</strong>
                </Button>
              </div>
            )}
        </div>
      </Modal.Body>
    );
  }

  renderRoomCreateModal() {
    const { name } = this.state;

    return (
      <Modal.Body>
        <Form horizontal>
          <FormGroup>
            <Col sm={3}>
              <Toggle
                onToggle={this.togglePublic}
                on="Public"
                off="Private"
                active={this.state.public}
              />
            </Col>

            <Col sm={9}>
              <div className="publicity-description">
                {this.state.public
                  ? "Open to all members"
                  : "Restricted to invited members"}
              </div>
            </Col>
          </FormGroup>

          <FormGroup bsSize="large">
            <Col componentClass={ControlLabel} sm={3}>
              Name
            </Col>

            <Col sm={9}>
              <FormControl
                name="name"
                type="text"
                placeholder="e.g. Emergency Room"
                maxLength="25"
                value={name}
                onKeyPress={this.cleanName}
                onChange={this.updateValue("name")}
              />
              <HelpBlock>
                Names must be shorter than 25 characters and without
                punctuation.
              </HelpBlock>
            </Col>
          </FormGroup>

          <FormGroup bsSize="large">
            <Col componentClass={ControlLabel} sm={3} className="optional">
              Reference
              <br />
              <span>(automatic)</span>
            </Col>

            <Col sm={9}>
              <FormControl
                name="reference"
                placeholder="e.g. #emergency-room"
                value={this.getSlug()}
                disabled
              />
              <HelpBlock>
                The reference name is the unique ID for a room and can be
                mentioned in a conversation to link right to it.
              </HelpBlock>
            </Col>
          </FormGroup>

          <FormGroup bsSize="large" className="members-select">
            <Col componentClass={ControlLabel} sm={3} className="optional">
              Members
              <br />
              <span>(optional)</span>
            </Col>

            <Col sm={9}>
              <Members
                onChange={this.updateMembers}
                value={this.state.members}
              />
              <HelpBlock>
                Click to select team members to invite to your room. You can
                always invite members later.
              </HelpBlock>
            </Col>
          </FormGroup>
        </Form>
      </Modal.Body>
    );
  }

  renderModalFooter() {
    const { closeModal } = this.props;

    return (
      <Modal.Footer>
        <Button bsSize="large" onClick={closeModal}>
          Cancel
        </Button>
        <Button
          bsSize="large"
          bsStyle="primary"
          onClick={this.createRoom}
          disabled={!this.canCreateRoom()}
        >
          Create Room
        </Button>
      </Modal.Footer>
    );
  }

  render() {
    const { state, closeModal } = this.props;

    return (
      <Modal
        className="rooms-modal"
        show={!!state}
        onEnter={this.onModalEntered}
        onHide={closeModal}
      >
        {this.renderModalHeader()}
        {state === "list" && this.renderRoomsListModal()}
        {state === "create" && this.renderRoomCreateModal()}
        {state === "create" && this.renderModalFooter()}
      </Modal>
    );
  }
}

RoomsModal.propTypes = {
  state: PropTypes.string.isRequired,
  showRoomsListModal: PropTypes.func.isRequired,
  showRoomCreateModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired
};

export default withRouter(RoomsModal);
