import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import MenuItem from "react-bootstrap/lib/MenuItem";
import Modal from "react-bootstrap/lib/Modal";
import Form from "react-bootstrap/lib/Form";
import Col from "react-bootstrap/lib/Col";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Button from "react-bootstrap/lib/Button";

@inject("groupStore")
@observer
export default class NavItemRename extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      groupName: ""
    };
  }

  toggleModal = () => {
    this.setState({
      showModal: !this.state.showModal,
      groupName: this.props.groupStore.name
    });
  };

  handleChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  };

  handleSubmit = () => {
    this.props.groupStore.rename(this.state.groupName);
    this.setState({ showModal: false });
  };

  render() {
    return (
      <MenuItem onClick={this.toggleModal}>
        Rename
        <Modal show={this.state.showModal} onHide={this.toggleModal}>
          <Modal.Header>
            <Modal.Title>Rename Group</Modal.Title>
            <a href="#" onClick={this.toggleModal}>
              <i className="fa fa-close" />
            </a>
          </Modal.Header>

          <Modal.Body>
            <Form horizontal>
              <FormGroup bsSize="large">
                <Col componentClass={ControlLabel} sm={3}>
                  Group Name:
                </Col>

                <Col sm={9}>
                  <FormControl
                    name="groupName"
                    type="text"
                    autoFocus
                    placeholder="e.g. Radiology"
                    value={this.state.groupName}
                    onChange={this.handleChange}
                  />
                  <HelpBlock className="text-muted m-b-0">
                    The standardize name for use in <a href="#">referencing</a>{" "}
                    this group will also be updated: <span>#placeholder</span>
                  </HelpBlock>
                </Col>
              </FormGroup>
            </Form>
          </Modal.Body>

          <Modal.Footer>
            <Button bsSize="large" onClick={this.toggleModal}>
              Cancel
            </Button>
            <Button
              bsSize="large"
              bsStyle="primary"
              onClick={this.handleSubmit}
            >
              Rename
            </Button>
          </Modal.Footer>
        </Modal>
      </MenuItem>
    );
  }
}
