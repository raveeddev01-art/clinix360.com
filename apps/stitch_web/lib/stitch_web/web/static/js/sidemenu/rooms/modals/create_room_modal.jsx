import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import { withRouter } from "react-router-dom";
import slugify from "slugify";
import Alert from "react-bootstrap/lib/Alert";
import Button from "react-bootstrap/lib/Button";
import Col from "react-bootstrap/lib/Col";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import Form from "react-bootstrap/lib/Form";
import FormControl from "react-bootstrap/lib/FormControl";
import FormGroup from "react-bootstrap/lib/FormGroup";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Modal from "react-bootstrap/lib/Modal";

import { Members, Toggle } from "common/components";

@inject("groupsStore")
@observer
class CreateRoomModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: "",
      members: [],
      name: props.roomName,
      public: true
    };
  }

  componentWillMount() {
    this.setState({
      members: [],
      error: null
    });
  }

  getSlug() {
    return this.state.name
      ? `#${slugify(this.state.name, { lower: true })}`
      : "";
  }

  cleanName = e => {
    const re = /^[\w\-\s]+$/;
    if (!re.test(e.key)) {
      e.preventDefault();
    }
  };

  updateMembers = value => {
    this.setState({ members: value });
  };

  updateValue = field => evt => {
    this.setState({ [field]: evt.target.value });
  };

  togglePublic = () => {
    this.setState({ public: !this.state.public });
  };

  canCreateRoom = () => {
    const { name } = this.state;
    return name.trim() !== "";
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
        this.setState({
          error: null
        });
        history.push(`/rooms/${slug}`);
        closeModal();
      })
      .catch(response => {
        this.setState({
          error: "A group with this name already exists."
        });
      });
  };

  renderModalHeader() {
    const { closeModal } = this.props;

    return (
      <Modal.Header>
        <Modal.Title>Create Room</Modal.Title>
        <Button bsSize="xsmall" onClick={this.props.showRoomsListModal}>
          Browse Rooms
        </Button>
        <a role="link" onClick={closeModal}>
          <i className="fa fa-close" />
        </a>
      </Modal.Header>
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

  renderRoomCreateModal() {
    const { name } = this.state;

    return (
      <Modal.Body>
        <Form horizontal>
          {!!this.state.error && (
            <Alert bsStyle="danger">{this.state.error}</Alert>
          )}

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

  render() {
    return (
      <div>
        {this.renderModalHeader()}
        {this.renderRoomCreateModal()}
        {this.renderModalFooter()}
      </div>
    );
  }
}

CreateRoomModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  roomName: PropTypes.string.isRequired,
  showRoomsListModal: PropTypes.func.isRequired
};

export default withRouter(CreateRoomModal);
