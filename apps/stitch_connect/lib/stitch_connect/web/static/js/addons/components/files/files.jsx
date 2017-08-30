import React, { Component } from "react";
import { inject, observer } from "mobx-react";

@observer
class Files extends Component {
  componentWillMount() {}

  render() {
    return <div className="files-addon">Files</div>;
  }
}

export default Files;
