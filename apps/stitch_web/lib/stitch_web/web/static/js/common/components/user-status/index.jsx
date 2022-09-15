import React, { Component } from "react";
import { observer } from "mobx-react";
import EditableStatus from "./editable-status";
import ReadOnlyStatus from "./read-only-status";
import IconStatus from "./icon-status";


const StatusRenderer = {
    icon: IconStatus,
    readonly: ReadOnlyStatus,
    editable: EditableStatus
}

@observer
class UserStatus extends Component {

    render() {
        const { user, type } = this.props;

        if (!user.status.active) {
            return <div />;
        }

        var Renderer = StatusRenderer[type] || StatusRenderer.icon;

        return (
            <div>
                <Renderer {...this.props}/>
            </div>
        );
    }
}

export default UserStatus;
