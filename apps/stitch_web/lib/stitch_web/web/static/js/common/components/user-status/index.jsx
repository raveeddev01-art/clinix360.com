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
        this.props.userStore.clearStatus();
    }

    renderStatus() {
        const { userStore } = this.props;

        return (
            <div>
                {!showStatus && 
                <Button onClick={this.toggleUpdateStatusModal} bsStyle="primary">
                    Set a status
                </Button>}
                {showStatus && 
                <Button onClick={this.clearStatus} bsStyle="primary">
                    Clear status
                </Button>}
                <UserStatusModal />
            </div>
        );                
    }

    renderButtonPanel() {
        const { userStore } = this.props;
        const showStatus = userStore.status.active;
        return (
            <div>
                {!showStatus && 
                <Button onClick={this.toggleUpdateStatusModal} bsStyle="primary">
                    Set a status
                </Button>}
                {showStatus && 
                <Button onClick={this.clearStatus} bsStyle="primary">
                    Clear status
                </Button>}
                <UserStatusModal />
            </div>
        );        
    }

    render() {
        return this.renderButtonPanel();
    }
}

export default UserStatus;
