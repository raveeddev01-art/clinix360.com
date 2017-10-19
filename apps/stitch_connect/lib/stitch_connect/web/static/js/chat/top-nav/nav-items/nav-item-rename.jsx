import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import slugify from "slugify";

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
      groupName: "",
      groupSlug: ""
    };
  }

  toggleModal = () => {
    this.setState({
      showModal: !this.state.showModal,
      groupName: this.props.groupStore.name,
      groupSlug: `#${this.props.groupStore.slug}`
    });
  };

  cleanName = e => {
    const re = /^[\w\-\s]+$/;
    if (!re.test(e.key)) {
      e.preventDefault();
    }
  };

  handleChangeName = event => {
    const value = event.target.value;

    this.setState({
      groupName: value,
      groupSlug: `#${slugify(value, {lower: true})}`
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
            <Modal.Title>Rename Room</Modal.Title>
            <a href="#" onClick={this.toggleModal}>
              <i className="fa fa-close" />
            </a>
          </Modal.Header>

          <Modal.Body>
            <Form horizontal>
              <FormGroup bsSize="large">
                <Col componentClass={ControlLabel} sm={3}>
                  Room Name:
                </Col>

                <Col sm={9}>
                  <FormControl
                    name="groupName"
                    type="text"
                    autoFocus
                    maxLength="25"
                    placeholder="e.g. Radiology"
                    value={this.state.groupName}
                    onKeyPress={this.cleanName}
                    onChange={this.handleChangeName}
                  />
                  <HelpBlock className="text-muted m-b-0">
                    The standardize name for use in <a href="#">referencing</a>{" "}
                    this room will also be updated: <span>#placeholder</span>
                  </HelpBlock>
                </Col>
              </FormGroup>
              <FormGroup bsSize="large">
                <Col componentClass={ControlLabel} sm={3} className="optional">
                  Reference Name:
                  <br />
                  <span>(automatic)</span>
                </Col>

                <Col sm={9}>
                  <FormControl
                    name="reference"
                    placeholder="e.g. #radiology"
                    value={this.state.groupSlug}
                    disabled
                  />
                  <HelpBlock className="text-muted m-b-0">
                    The reference name is the unique ID for a room and can be
                    mentioned in a conversation to link right to it.
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
