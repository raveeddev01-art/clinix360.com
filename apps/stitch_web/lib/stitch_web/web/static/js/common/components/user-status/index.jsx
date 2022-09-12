import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import Button from "react-bootstrap/lib/Button";
import UserStatusModal from "../../../common/modals/user-status-modal";

@inject("userStore")
@observer
class UserStatus extends Component {

    toggleUpdateStatusModal = () => {
        this.props.userStore.showUserStatusModal = true;
    };

    clearStatus = () => {
        // this.props.userStore.clearStatus();
        // this.props.userStore.userStatus();
        this.props.userStore.statusHistory();
    }

    render() {
        return (
            <div>
                <Button onClick={this.toggleUpdateStatusModal} bsStyle="primary">
                    Set a status
                </Button>
                <Button onClick={this.clearStatus} bsStyle="primary">
                    Clear status
                </Button>
                <UserStatusModal />
            </div>
        );
    }
}

export default UserStatus;
