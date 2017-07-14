import React, { Component } from "react";

import Sidemenu from "./sidemenu/sidemenu.jsx";
import Chat from "./chat/chat.jsx";

export default class Webapp extends Component {
  render() {
    return (
      <div id="app">
        <Sidemenu />

        <div id="main">
          <div className="flex-header">
            <div className="header-content">
              <h4>
                <i className="fa fa-comments" /> General
              </h4>
            </div>

            <div className="header-nav">
              <input
                type="text"
                className="form-control"
                placeholder="Search"
              />
              <a href="#addons-toggle" className="btn" id="addons-toggle">
                <i className="fa fa-info-circle" />
              </a>
            </div>
          </div>

          <div className="flex-content">
            <div id="chat-container">
              <Chat />

              <div className="flex-footer">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Write something"
                />
              </div>
            </div>

            <div id="addons">
              <div className="flex-header">
                <h4>Directory</h4>
              </div>

              <div className="flex-content">
                <div className="addon-directory">
                  <div className="subheading">
                    <div className="flex-item">
                      1 <span className="text-muted">/1</span> Member
                    </div>
                    <a href="#" className="btn btn-sm btn-default">
                      Show only online
                    </a>
                  </div>
                  <hr />
                  <ul className="list-unstyled">
                    <li>
                      <i className="fa fa-circle" />{" "}
                      <strong>Daniel Tapia</strong>{" "}
                      <span className="text-muted">daniel</span>
                    </li>
                    <li>
                      <i className="fa fa-circle-o" />{" "}
                      <strong>Emily Hope</strong>{" "}
                      <span className="text-muted">emhope</span>
                    </li>
                    <li>
                      <i className="fa fa-circle-o" />{" "}
                      <strong>Jack Roush</strong>{" "}
                      <span className="text-muted">roush</span>
                    </li>
                    <li>
                      <i className="fa fa-circle-o" />{" "}
                      <strong>Tom Davis</strong>{" "}
                      <span className="text-muted">tomdavis</span>
                    </li>
                    <li>
                      <i className="fa fa-circle-o" />{" "}
                      <strong>Mark Green</strong>{" "}
                      <span className="text-muted">mgreen</span>
                    </li>
                  </ul>

                  <hr />

                  <div className="profile-details">
                    <h4 className="text-center">Daniel Tapia</h4>
                    <hr />
                    <div className="item">
                      <div className="item-label text-muted">Username</div>
                      <div className="item-value">@daniel</div>
                    </div>

                    <div className="item">
                      <div className="item-label text-muted">Time Zone</div>
                      <div className="item-value">3:25 PM (UTC -4)</div>
                    </div>

                    <div className="item">
                      <div className="item-label text-muted">Email Address</div>
                      <div className="item-value">
                        betamail20@mailinator.com
                      </div>
                    </div>

                    <div className="item">
                      <div className="item-label text-muted">Phone Number</div>
                      <div className="item-value">123456789</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
