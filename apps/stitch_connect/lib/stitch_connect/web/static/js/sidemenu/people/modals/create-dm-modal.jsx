import React, { Component, PropTypes } from "react";

import Modal from "react-bootstrap/lib/Modal";
import FormControl from "react-bootstrap/lib/FormControl";

class CreateDMModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: props.show
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.show !== this.props.show) {
      this.setState({ show: nextProps.show });
    }
  }

  render() {
    return (
      <Modal className="sidemenu-modal" show={this.state.show}>
        <Modal.Header>
          <Modal.Title>People</Modal.Title>
          <a role="link" onClick={this.props.toggle}>
            <i className="fa fa-close" />
          </a>
        </Modal.Header>

        <Modal.Body>
          <div className="modal-search">
            <FormControl
              type="text"
              value={this.state.value}
              placeholder="Search members"
              className="input-lg"
              onChange={this.handleChange}
            />
          </div>

          <h5 className="team-heading text-muted">
            Click to select team members to start chat with.
          </h5>
        </Modal.Body>
      </Modal>
    );
  }
}

CreateDMModal.propTypes = {
  show: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired
};

CreateDMModal.defaultProp = {
  show: false,
  toggle: () => {}
};

export default CreateDMModal;
