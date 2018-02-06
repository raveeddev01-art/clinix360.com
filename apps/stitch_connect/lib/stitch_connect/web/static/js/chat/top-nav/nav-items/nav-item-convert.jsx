import React, { Component } from "react";

import { inject, observer } from "mobx-react";

import MenuItem from "react-bootstrap/lib/MenuItem";
import Modal from "react-bootstrap/lib/Modal";
import Form from "react-bootstrap/lib/Form";
import Col from "react-bootstrap/lib/Col";
import FormGroup from "react-bootstrap/lib/FormGroup";
import Button from "react-bootstrap/lib/Button";

import Toggle from "../../../common/components/toggle/Toggle";

@inject("groupStore")
@observer
export default class NavItemConvert extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      public: true
    };
  }

  componentWillMount() {
    this.setState({ public: this.props.groupStore.group.public });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.groupStore.group.public !== this.state.public) {
      this.setState({ public: nextProps.groupStore.group.public });
    }
  }

  openModal = () => {
    this.setState({ showModal: true });
  };

  closeModal = () => {
    this.setState({ showModal: false });
  };

  togglePublic = () => {
    this.setState({ public: !this.state.public });
  };

  handleChange = event => {
    this.setState({ public: event.target.value === "public" });
  };

  handleSubmit = () => {
    const { groupStore } = this.props;

    if (groupStore.group.public !== this.state.public) {
      groupStore.setPublic(this.state.public);
    }
    this.closeModal();
  };

  render() {
    const { groupStore } = this.props;

    return [
      <MenuItem key="convert_menuitem" onClick={this.openModal}>
        Convert Room to {groupStore.group.public ? "Private" : "Public"} Room
      </MenuItem>,
      <Modal
        key="convert_modal"
        className="convert-room-modal"
        show={this.state.showModal}
      >
        <Modal.Header>
          <Modal.Title>
            Convert Room to {groupStore.group.public
              ? "Private"
              : "Public"}{" "}
            Room
          </Modal.Title>
          <a role="link" onClick={this.closeModal}>
            <i className="fa fa-close" />
          </a>
        </Modal.Header>
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
                    ? "Public rooms can be discovered and joined by anyone."
                    : "Private rooms can be accessed only by invitation."}
                </div>
              </Col>
            </FormGroup>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button bsSize="large" onClick={this.closeModal}>
            Cancel
          </Button>
          <Button bsSize="large" bsStyle="primary" onClick={this.handleSubmit}>
            Convert
          </Button>
        </Modal.Footer>
      </Modal>
    ];
  }
}
