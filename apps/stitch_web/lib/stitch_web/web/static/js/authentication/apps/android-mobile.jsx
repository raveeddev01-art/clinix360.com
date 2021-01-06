import React, { Component } from "react";

export default class AndroidMobile extends Component {
  render() {
    return (
      <div>
        <h5>
          <div className="card-description">
            Download the <strong>Android Mobile App</strong> to get the best
            experience using InvoCom.
          </div>
        </h5>

        <a href="" className="btn m-b-40">
          <img
            src="/images/playstore.png"
            className="img-responsive"
            alt="Download InvoCom on Play store"
          />
        </a>
      </div>
    );
  }
}
