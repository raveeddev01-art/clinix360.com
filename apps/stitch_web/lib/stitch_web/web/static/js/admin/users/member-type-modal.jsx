import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";
import Form from "react-bootstrap/lib/Form";
import { MemberType } from "common/components";

@inject("usersStore")
@observer
class MemberTypeModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editingUserId: null,
      role: "member",
      groupId: null
    };
  }

  componentDidUpdate(prevProps) {
    if (
      this.state.editingUserId !== prevProps.usersStore.editingUserId &&
      prevProps.usersStore.editingUserId
    ) {
      const user = prevProps.usersStore.editingUser;
      // eslint-disable-next-line
      this.setState({
        editingUserId: prevProps.usersStore.editingUserId,
        role: user.roles[0],
        groupId: user.groups_as_guest.join(",")
      });
    }
  }

  onChange = field => value => {
    this.setState({
      [field]: value
    });
  };

  onSave = () => {
    const { role, groupId } = this.state;
    const { usersStore } = this.props;
    const data = {
      role
    };

    if (data.role !== "member") {
      if (data.role === "single-room-guest") {
        data.group_ids = [groupId];
      } else {
        data.group_ids = groupId
          .split(",")
          .filter(g => g)
          .map(g => parseInt(g, 10));
      }
    }

    usersStore.editUser(data).then(() => this.onEndEditing());
  };

  onEndEditing = () => {
    this.setState({ editingUserId: null });
    this.props.usersStore.onEndEditing();
  };

  render() {
    const { usersStore } = this.props;
    const { role, groupId } = this.state;
    const isEditing = !!usersStore.editingUserId;
    const user = usersStore.editingUser || {};
    const saveDisabled =
      (role === "single-room-guest" || role === "multi-room-guest") && !groupId;

    return (
      <Modal show={isEditing} onHide={this.onEndEditing}>
        <Modal.Header>
          <Modal.Title>Manage Member Type</Modal.Title>
          <a role="button" onClick={this.onEndEditing}>
            <i className="fa fa-close" />
          </a>
        </Modal.Header>
        <Modal.Body>
          <div className="member-type-modal__name">
            {user.full_name}
            <small>@{user.username}</small>
          </div>
          <Form horizontal>
            <MemberType
              role={role}
              groupId={groupId}
              onChangeRole={this.onChange("role")}
              onChangeGroup={this.onChange("groupId")}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button bsSize="large" onClick={this.onEndEditing}>
            Cancel
          </Button>
          <Button
            bsSize="large"
            bsStyle="primary"
            onClick={this.onSave}
            disabled={saveDisabled}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default MemberTypeModal;
