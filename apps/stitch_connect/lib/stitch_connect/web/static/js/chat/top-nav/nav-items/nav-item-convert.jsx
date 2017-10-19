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

import Toggle from "../../../common/components/toggle/Toggle";

@inject("groupStore", "sidemenuStore")
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

  toggleModal = () => {
    this.setState({
      showModal: !this.state.showModal
    });

    // ISSUE: https://github.com/react-bootstrap/react-bootstrap/issues/541
    document.dispatchEvent(new MouseEvent("click"));
  };

  togglePublic = () => {
    this.setState({ public: !this.state.public });
  };

  handleChange = event => {
    this.setState({ public: event.target.value === "public" });
  };

  handleSubmit = () => {
    if (this.props.groupStore.public !== this.state.public) {
      this.props.groupStore
        .togglePublic(this.state.public)
        .then(() => this.props.sidemenuStore.loadGroups());
    }
    this.toggleModal();
  };

  render() {
    return (
      <MenuItem onClick={this.toggleModal}>
        Convert
        <Modal
          className="convert-room-modal"
          show={this.state.showModal}
          onHide={this.toggleModal}
        >
          <Modal.Header>
            <Modal.Title>Convert</Modal.Title>
            <a href="#" onClick={this.toggleModal}>
              <i className="fa fa-close" />
            </a>
          </Modal.Header>
          <Modal.Body>
            <Form horizontal>
              <FormGroup>
                <Col sm={3}>
                  <Toggle
                    onClick={this.togglePublic}
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
            <Button bsSize="large" onClick={this.toggleModal}>
              Cancel
            </Button>
            <Button
              bsSize="large"
              bsStyle="primary"
              onClick={this.handleSubmit}
            >
              Convert
            </Button>
          </Modal.Footer>
        </Modal>
      </MenuItem>
    );
  }
}
