import React, { Component } from "react";

import { inject, observer } from "mobx-react";

import MenuItem from "react-bootstrap/lib/MenuItem";
import Modal from "react-bootstrap/lib/Modal";
import Form from "react-bootstrap/lib/Form";
import Col from "react-bootstrap/lib/Col";
import FormGroup from "react-bootstrap/lib/FormGroup";
import Button from "react-bootstrap/lib/Button";

import Toggle from "../../../common/components/toggle/Toggle";

@inject("groupStore", "groupsStore")
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
    this.setState({ public: this.props.groupStore.public });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.groupStore.public !== this.state.public) {
      this.setState({ public: nextProps.groupStore.public });
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
    const { groupStore, groupsStore } = this.props;

    if (groupStore.public !== this.state.public) {
      groupStore.togglePublic(this.state.public).then(group => {
        groupsStore.updateGroupData(group.id, {
          public: group.public
        });
      });
    }
    this.closeModal();
  };

  render() {
    return [
      <MenuItem key="convert_menuitem" onClick={this.openModal}>
        Convert
      </MenuItem>,
      <Modal
        key="convert_modal"
        className="convert-room-modal"
        show={this.state.showModal}
      >
        <Modal.Header>
          <Modal.Title>Convert</Modal.Title>
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
