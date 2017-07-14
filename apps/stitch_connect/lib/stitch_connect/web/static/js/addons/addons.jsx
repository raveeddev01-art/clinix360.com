import React, { Component } from "react";

export default class Addons extends Component {
  render() {
    return (
      <div id="addons">
        <div className="flex-header">
          <h4>Info</h4>
          <a href="#">
            <i className="fa fa-close" />
          </a>
        </div>

        <div className="flex-content">
          <h5 className="subheading">
            <div className="addon-icon">
              <i className="fa fa-group" />
            </div>
            <div className="flex-item">People</div>
            <i className="fa fa-caret-down" />
          </h5>

          <hr />
          <h5 className="subheading">
            <div className="addon-icon">
              <i className="fa fa-thumb-tack" />
            </div>
            <div className="flex-item">Pinned</div>
            <i className="fa fa-caret-down" />
          </h5>
          <p className="text-muted">Pin the first message!</p>

          <hr />
          <h5 className="subheading">
            <div className="addon-icon">
              <i className="fa fa-star" />
            </div>
            <div className="flex-item">Starred</div>
            <i className="fa fa-caret-down" />
          </h5>
          <p className="text-muted">Star the first message!</p>

          <hr />
          <h5 className="subheading">
            <div className="addon-icon">
              <i className="fa fa-list" />
            </div>
            <div className="flex-item">Tasks</div>
            <i className="fa fa-caret-down" />
          </h5>

          <hr />
          <h5 className="subheading">
            <div className="addon-icon">
              <i className="fa fa-folder-open" />
            </div>
            <div className="flex-item">Files</div>
            <i className="fa fa-caret-down" />
          </h5>
          <p className="text-muted">Upload the first file!</p>

          <hr />
          <h5 className="subheading">
            <div className="addon-icon">
              <i className="fa fa-flask" />
            </div>
            <div className="flex-item">Labs</div>
            <i className="fa fa-caret-down" />
          </h5>
          <p className="text-muted">Add the first lab!</p>

          <hr />
          <h5 className="subheading">
            <div className="addon-icon">
              <i className="fa fa-address-card-o" />
            </div>
            <div className="flex-item">Referrals</div>
            <i className="fa fa-caret-down" />
          </h5>
          <p className="text-muted">Add the first referral!</p>

          <hr />
          <h5 className="subheading">
            <div className="addon-icon">
              <i className="fa fa-check-square-o" />
            </div>
            <div className="flex-item">Checklists</div>
            <i className="fa fa-caret-down" />
          </h5>
          <p className="text-muted">Add the first checklist!</p>

          <hr />
          <h5 className="subheading">
            <div className="addon-icon">
              <i className="fa fa-medkit" />
            </div>
            <div className="flex-item">Prescriptions</div>
            <i className="fa fa-caret-down" />
          </h5>
          <p className="text-muted">Add the first prescription!</p>

          <hr />
          <h5 className="subheading">
            <div className="addon-icon">
              <i className="fa fa-bookmark-o" />
            </div>
            <div className="flex-item">Clinical Notes</div>
            <i className="fa fa-caret-down" />
          </h5>
          <p className="text-muted">Add the first clinical note!</p>
        </div>
      </div>
    );
  }
}
