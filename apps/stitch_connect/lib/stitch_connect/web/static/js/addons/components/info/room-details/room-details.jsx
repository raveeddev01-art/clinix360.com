import React, { Component } from "react";
import { inject, observer } from "mobx-react";

@inject("groupStore")
@observer
class RoomDetails extends Component {
  render() {
    const { groupStore } = this.props;

    return (
      <div className="collapse-content">
        <h5 className="text-muted">Topic</h5>
        <p>
          {groupStore.description
            ? <span>
                {groupStore.description}
              </span>
            : <span>
                No room topic set
              </span>}
        </p>

        <h5 className="text-muted">Created by</h5>
        <p>User on September 15, 2017</p>
      </div>
    );
  }
}

export default RoomDetails;
