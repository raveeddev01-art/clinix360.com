import React, { Component } from "react";
import { inject, observer } from "mobx-react";

@inject("groupStore")
@observer
class RoomDetails extends Component {
  render() {
    const { groupStore } = this.props;

    return (
      <div className="collapse-content room-details">
        <h5>Name</h5>
        <p>
          {groupStore.name} <code>#{groupStore.slug}</code>
        </p>

        <h5>Type</h5>
        <p>
          {groupStore.public === true
            ? <span>Public Group</span>
            : <span>Private Group</span>}
        </p>

        <h5>Created</h5>
        <p>Created on</p>
      </div>
    );
  }
}

export default RoomDetails;
