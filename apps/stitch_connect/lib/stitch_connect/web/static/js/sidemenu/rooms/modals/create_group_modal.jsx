import React, { Component, PropTypes } from "react";
import { observer, inject } from "mobx-react";
import { withRouter } from "react-router-dom";

import Modal from "react-bootstrap/lib/Modal";
import Form from "react-bootstrap/lib/Form";
import Col from "react-bootstrap/lib/Col";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Button from "react-bootstrap/lib/Button";
import Members from "../../../common/components/members/members";

@inject("groupStore")
@observer
class CreateGroupModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      members: [],
      public: true,
      name: "",
      description: ""
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.showModal !== this.props.showModal && nextProps.showModal) {
      // members should be set manualy set empty when modal is open
      this.setState({ members: [] });
    }
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

  createGroup = () => {
    const { groupStore, history, toggleModal } = this.props;

    groupStore
      .createGroup({
        name: this.state.name,
        public: this.state.public,
        description: this.state.description,
        user_ids: this.state.members.map(user => user.id)
      })
      .then(slug => {
        history.push(`/groups/${slug}`);
        toggleModal();
      });
  };

  render() {
    return (
      <Modal className="sidemenu-modal" show={this.props.showModal}>
        <Modal.Header>
          <Modal.Title>Create Room</Modal.Title>
          <a role="link" onClick={this.props.toggleModal}>
            <i className="fa fa-close" />
          </a>
        </Modal.Header>

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
                  A standardize name will also be automatically created for use
                  in <a>referencing</a> this room: <span>#radiology</span>
                </HelpBlock>
              </Col>
            </FormGroup>

            <FormGroup bsSize="large">
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
            </FormGroup>

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
                  Click to select team members to invite to your room.
                  Don&quot;t worry, you can always invite more.
                </HelpBlock>
              </Col>
            </FormGroup>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button bsSize="large" onClick={this.props.toggleModal}>
            Cancel
          </Button>
          <Button bsSize="large" bsStyle="primary" onClick={this.createGroup}>
            Create Room
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

CreateGroupModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  toggleModal: PropTypes.func.isRequired
};

CreateGroupModal.defaultProp = {
  showModal: false,
  toggleModal: () => {}
};

export default withRouter(CreateGroupModal);
