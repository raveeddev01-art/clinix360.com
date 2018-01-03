import React, { Component } from "react";
import cx from "classnames";

class Feature extends Component {
  render() {
    return (
      <div className={cx("feature", this.props.featureClassName)}>
        <div className="container">
          <div className="flex-box">
            <div className="flex-item">
              <div className="info m-b-40">
                <h2>{this.props.heading}</h2>

                <p>{this.props.children}</p>
              </div>
            </div>

            <div className="flex-item">
              <img
                src={this.props.image}
                alt="Stitch Connect"
                className={cx("img-responsive", this.props.imageClassName)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Feature;
