import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import Modal from "react-bootstrap/lib/Modal";
import Form from "react-bootstrap/lib/Form";
import Col from "react-bootstrap/lib/Col";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Button from "react-bootstrap/lib/Button";

import RoomItem from "./room_item";
import Members from "../../../common/components/members/members";

@inject("sidemenuStore", "groupStore")
@observer
class RoomsModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filter: "",
      members: [],
      public: true,
      name: ""
      // description: ""
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.state !== this.props.state && !!nextProps.state) {
      // members should be set manualy set empty when modal is open
      this.setState({ members: [] });
    }
  }

  handleChange = event => {
    const { value } = event.target;

    this.setState({
      filter: value
    });
  };

  filterRooms() {
    const { sidemenuStore } = this.props;
    const { filter } = this.state;
    const rooms = sidemenuStore.normalGroups.filter(room =>
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

  updateMembers = value => {
    this.setState({ members: value });
  };

  updatePublic = value => () => {
    this.setState({ public: value });
  };

  createRoom = () => {
    const { groupStore, history, closeModal } = this.props;

    groupStore
      .createGroup({
        name: this.state.name,
        public: this.state.public,
        // description: this.state.description,
        user_ids: this.state.members.map(user => user.id)
      })
      .then(slug => {
        history.push(`/rooms/${slug}`);
        closeModal();
      });
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
        </div>
      </Modal.Body>
    );
  }

  renderRoomCreateModal() {
    return (
      <Modal.Body>
        <Form horizontal>
          <FormGroup>
            <Col componentClass={ControlLabel} sm={3}>
              Type
            </Col>

            <Col sm={9}>
              <div className="switch-field">
                <input
                  type="radio"
                  id="switch_left"
                  name="switch_2"
                  value="public"
                  onChange={this.updatePublic(true)}
                  checked={this.state.public}
                />
                <label htmlFor="switch_left">
                  <i className="fa fa-comments" /> Public
                </label>
                <input
                  type="radio"
                  id="switch_right"
                  name="switch_2"
                  value="private"
                  onChange={this.updatePublic(false)}
                  checked={!this.state.public}
                />
                <label htmlFor="switch_right">
                  <i className="fa fa-lock" /> Private
                </label>
              </div>
              <HelpBlock className="text-muted m-b-0">
                Public rooms can be joined by anyone in your team.
              </HelpBlock>
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
                placeholder="e.g. Radiology"
                onChange={this.updateValue("name")}
              />
              <HelpBlock className="text-muted m-b-0">
                A standardize name will also be automatically created for use in{" "}
                <a>referencing</a> this room: <span>#radiology</span>
              </HelpBlock>
            </Col>
          </FormGroup>

          {/* <FormGroup bsSize="large">
          <Col componentClass={ControlLabel} sm={3}>
            Description
          </Col>

          <Col sm={9}>
            <FormControl
              name="description"
              type="text"
              onChange={this.updateValue("description")}
            />
            <HelpBlock className="text-muted m-b-0">
              What will this room be about?
            </HelpBlock>
          </Col>
        </FormGroup> */}

          <FormGroup bsSize="large">
            <Col componentClass={ControlLabel} sm={3}>
              Members
            </Col>

            <Col sm={9}>
              <Members
                onChange={this.updateMembers}
                value={this.state.members}
              />
              <HelpBlock className="text-muted m-b-0">
                Click to select team members to invite to your room. Don&quot;t
                worry, you can always invite more.
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
        <Button bsSize="large" bsStyle="primary" onClick={this.createRoom}>
          Create Room
        </Button>
      </Modal.Footer>
    );
  }

  render() {
    const { state } = this.props;

    return (
      <Modal className="rooms-modal" show={!!state}>
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

export default RoomsModal;
