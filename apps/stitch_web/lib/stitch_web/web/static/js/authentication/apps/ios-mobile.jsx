import React, { Component } from "react";

export default class IOSMobile extends Component {
  render() {
    return (
      <div>
        <h5 className="m-b-40">
          <div className="card-description">
            Download the <strong>iOS Mobile App</strong> to get the best
            experience using InvoCom.
          </div>
        </h5>

        <a href="" className="btn m-b-40">
          <img
            src="/images/appstore.png"
            className="img-responsive"
            alt="Download InvoCom on iTunes store"
          />
        </a>
      </div>
    );
  }
}
