import React, { Component } from "react";

class Loading extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id="loading-screen-wrapper">
        <div className="text-center">
          <i className="fa fa-circle-o-notch fa-spin fa-3x fa-fw m-b-20" />
          <h3>Loading...</h3>
        </div>
      </div>
    );
  }
}

export default Loading;
