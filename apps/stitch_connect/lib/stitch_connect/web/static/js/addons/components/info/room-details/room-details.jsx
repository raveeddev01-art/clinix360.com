import React, { Component } from "react";
import { inject, observer } from "mobx-react";

@inject("groupStore")
@observer
class RoomDetails extends Component {
  render() {
    const { groupStore } = this.props;
    const isNotDM = groupStore.group.type === "regular";

    return (
      <div className="collapse-content room-details">
        <h5>Name</h5>
        <p>
          {groupStore.group.name}
          {isNotDM && <code>#{groupStore.group.slug}</code>}
        </p>

        <h5>Type</h5>
        <p>
          {groupStore.group.public === true ? (
            <span>Public Room</span>
          ) : (
            <span>Private Room</span>
          )}
        </p>

        <h5>Created</h5>
        <p>Created on</p>
      </div>
    );
  }
}

export default RoomDetails;
