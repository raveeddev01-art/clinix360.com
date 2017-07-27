import React, { Component } from "react";

export default class TeamExport extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="admin-panel panel panel-default">
        <div className="panel-body">
          <h1 className="admin-title">Data Export</h1>
          <div className="admin-content">
            <div className="team-exports">
              <p>
                In the event that you need to delete your Stitch account, or require electronic discovery
                for legal purposes. Stitch provides full data exports to keep you compliant. Here's what
                we include in our exports:
              </p>
              <ul>
                <li><i className="fa fa-check-circle-o" /> Public and private group message history</li>
                <li><i className="fa fa-check-circle-o" /> 1-1 direct message history</li>
                <li><i className="fa fa-check-circle-o" /> Edited and deleted messages</li>
                <li><i className="fa fa-check-circle-o" /> Archived group message history</li>
                <li><i className="fa fa-check-circle-o" /> Links to uploaded files</li>
              </ul>
              <button type="button" className="btn-fancy btn-primary pull-right action-create">New export</button>

              <h3>Export History</h3>
              <p className="tab-description">
                Exported history will include links to private file urls that have a special token attached
                for access to those files. You can enable/disable those tokens for added security of your message history.
              </p>
              <table className="table members">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Group</th>
                    <th>Status</th>
                    <th>Files Token</th>
                  </tr>
                  <tr className="separator"></tr>
                </thead>

                <tbody>
                  <tr className="user-info">
                    <td>
                      <div className="user-box">
                        <div className="user-info-box">
                          <div className="title">
                            <span className="username">Thursday, July 27, 2017 11:34 PM</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="user-box">
                        <div className="user-info-box">
                          <div className="title">
                            <span className="name">home</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="user-box">
                        <div className="user-info-box">
                          <div className="title">
                            
                              <a href="/file-upload/wJcbjpYXhvuvKED62/Phoenix Clinic Stitch export.zip" target="_blank">Download</a>
                            
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="toggle-block">
                        <div id="token-control" className="toggle is-active checked">
                          <div className="toggle-button">
                            <div className="toggle-off-text">Disabled</div>
                            <div className="toggle-on-text">Enabled</div>
                            <span className="toggle-handle"></span>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
