import React, { Component } from "react";
import { inject, observer } from "mobx-react";

@inject("groupsStore")
@observer
class CommentingIn extends Component {
  render() {
    const file = this.props.file;
    const groups = this.props.groupsStore.groups.filter(group =>
      group.type != "dm" && group.type != "multi_dm" && file.shared_in.includes(group.id)
    );
    if (groups.length == 0) { return <span></span> };

    return (
      <span>
        Commenting in
          {groups.map(group =>
          <span>
            <a key={group.id}
              href={`/rooms/${group.slug}`}>
              {group.public ? "#" : "(Private) "}{group.slug}
            </a>
          </span>
        )}
      </span>
    )
  }
}

export default CommentingIn

