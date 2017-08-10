import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import PeopleList from "../people-list/people-list.jsx";

class Directory extends Component {

  render() {
    return (
      <PeopleList />
    );
  }
}

export default Directory;
