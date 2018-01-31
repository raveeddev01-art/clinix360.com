import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import moment from "moment";

@inject("groupStore")
@observer
class RoomDetails extends Component {
  render() {
    const { groupStore } = this.props;
    const group = groupStore.group;
    const isNotDM = group.type === "regular";

    console.log(group);

    return (
      <div className="collapse-content room-details">
        <h5>Name</h5>
        <p>
          {group.name}
          {isNotDM && <code>#{group.slug}</code>}
        </p>

        <h5>Type</h5>
        <p>
          {group.public ? <span>Public Room</span> : <span>Private Room</span>}
        </p>

        <h5>Created</h5>
        <p>
          Created on{" "}
          {moment
            .utc(group.inserted_at)
            .local()
            .format("LL")}
        </p>
      </div>
    );
  }
}

export default RoomDetails;
