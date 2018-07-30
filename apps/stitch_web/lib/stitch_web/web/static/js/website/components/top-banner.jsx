import React, { Component } from "react";
import Button from "react-bootstrap/lib/Button";

class TopBanner extends Component {
  render() {
    return (
      <div id="top-banner">
        <div className="container">
          <img
            className="switcher__top-home"
            src="/images/logo-white.svg"
            alt="Stitch"
          />
          The new Stitch experience is here{" "}
          <Button href="http://stitch.health">See the new Stitch</Button>
        </div>
      </div>
    );
  }
}

export default TopBanner;
