import React, { Component } from "react";

class Subheader extends Component {
  render() {
    return (
      <div className="subheader">
        <div className="container">
          <div className="landing-message text-center">
            <h1>{this.props.title}</h1>
            <h3>{this.props.subtitle}</h3>
          </div>
        </div>
      </div>
    );
  }
}

export default Subheader;
