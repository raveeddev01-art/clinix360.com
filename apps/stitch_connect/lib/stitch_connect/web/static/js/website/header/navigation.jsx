import React, { Component } from "react";

export default class Navigation extends Component {
  render() {
    return (
      <div className="header">
        <a href="/" className="brand">
          <img src="/images/stitch-brand.png" alt="Stitch" />
        </a>

        <div className="nav-items">
          <ul className="list-inline text-right m-b-0">
            <li>
              <a href="/signin">Sign In</a>
            </li>
            <li>
              <a href="/signup/email" className="btn-outline">
                Create Team
              </a>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}
