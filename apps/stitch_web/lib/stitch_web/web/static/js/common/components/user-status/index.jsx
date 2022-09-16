import React, { Component } from "react";
import { observer } from "mobx-react";
import EditableStatus from "./components/editable-status";
import IconStatus from "./components/icon-status";
import ReadOnlyStatus from "./components/read-only-status";
import StatusHistory from "./components/status-history";

const StatusRenderer = {
    icon: IconStatus,
    readonly: ReadOnlyStatus,
    editable: EditableStatus,
    history: StatusHistory
}

@observer
class UserStatus extends Component {

    render() {
        const { user, type } = this.props;

        if ((!user || !user.status.active) && type !== "history") {
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
