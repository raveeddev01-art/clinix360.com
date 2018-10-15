import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";
import Form from "react-bootstrap/lib/Form";
import { Members } from "common/components";

@inject("memberExportStore")
@observer
class MemberExportModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: null
    };
  }

  onChange = field => value => {
    this.setState({
      [field]: value.id
    });
  };

  onSave = () => {
    this.props.memberExportStore.createExport(this.state.userId);
    this.props.onCloseModal();
  };

  onEndEditing = () => {
    this.setState({ userId: null });
  };

  render() {
    const { onCloseModal } = this.props;
    const saveDisabled = !this.state.userId;

    return (
      <Modal className="small-modal" show onHide={onCloseModal}>
        <Modal.Header>
          <Modal.Title>Member Export</Modal.Title>
          <a role="button" onClick={onCloseModal}>
            <i className="fa fa-close" />
          </a>
        </Modal.Header>
        <Modal.Body>
          <Form horizontal onSubmit={e => e.preventDefault()}>
            <Members
              isMulti={false}
              onChange={this.onChange("userId")}
              value={this.state.userId}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button bsSize="large" onClick={onCloseModal}>
            Cancel
          </Button>
          <Button
            bsSize="large"
            bsStyle="primary"
            onClick={this.onSave}
            disabled={saveDisabled}
          >
            Export
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

MemberExportModal.propTypes = {
  onCloseModal: PropTypes.func.isRequired
};

MemberExportModal.defaultProps = {
  onCloseModal: () => {}
};

export default MemberExportModal;
