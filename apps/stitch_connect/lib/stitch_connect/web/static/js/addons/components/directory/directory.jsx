import React, { Component } from "react";
import { observer } from "mobx-react";

import PeopleList from "../people-list/people-list";

@observer
class Directory extends Component {
  render() {
    return (
      <div className="directory-addon">
        <PeopleList teamDirectory />
      </div>
    );
  }
}

export default Directory;
