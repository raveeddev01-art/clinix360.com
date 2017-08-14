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
export default class NavItemConvert extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      public: true
    };
  }

  componentWillMount() {
    this.setState({public: this.props.groupStore.public});
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.groupStore.public !== this.state.public) {
      this.setState({public: nextProps.groupStore.public});
    }
  }

  toggleModal = () => {
    this.setState({
      showModal: !this.state.showModal
    });
  };

  handleChange = (event) => {
    this.setState({public: event.target.value === 'public'})
  };

  handleSubmit = () => {
    if (this.props.groupStore.public !== this.state.public) {
      this.props.groupStore.togglePublic(this.state.public);
    }
    this.toggleModal();
  };

  render() {
    const publicSwitchValue = this.props.groupStore.public ? "public" : "private";

    return (
      <MenuItem onClick={this.toggleModal}>
        Convert
        <Modal show={this.state.showModal} onHide={this.toggleModal}>
          <Modal.Header>
            <Modal.Title>Convert Group</Modal.Title>
            <a href="#" onClick={this.toggleModal}>
              <i className="fa fa-close" />
            </a>
          </Modal.Header>

          <Modal.Body>
            <h5>Public groups can be discovered and joined by anyone.</h5>
            <h5>
              Private groups can be accessed only by the creator and users who
              are invited in.
            </h5>
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
                      onChange={this.handleChange}
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
                      onChange={this.handleChange}
                      checked={!this.state.public}
                    />
                    <label htmlFor="switch_right">
                      <i className="fa fa-lock" /> Private
                    </label>
                  </div>
                </Col>
              </FormGroup>
            </Form>
          </Modal.Body>

          <Modal.Footer>
            <Button bsSize="large" onClick={this.toggleModal}>
              Cancel
            </Button>
            <Button bsSize="large" bsStyle="primary" onClick={this.handleSubmit}>
              Done
            </Button>
          </Modal.Footer>
        </Modal>
      </MenuItem>
    );
  }
}
