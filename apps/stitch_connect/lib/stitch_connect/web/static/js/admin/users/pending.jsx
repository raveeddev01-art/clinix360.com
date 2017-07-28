import React, { Component } from "react";

export default class UsersPending extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="admin-panel panel panel-default">
        <div className="panel-body">
					<h1 className="admin-title">Pending</h1>
					<div className="admin-content">
						<div className="manage-users">
							<p className="tab-description">
								View any outstanding invitations to join the team here. Revoking an invite will remove it from this list and deactivate the invite link. To resend an invitation multiple times, you can reload this page.
							</p>
							<div className="table invites">
								<div className="row">
									<div className="table-head clearfix">
										<div className="col-sm-8">Email Address</div>
										<div className="col-sm-4">Actions</div>
									</div>
								</div>
								<div className="separator" />
								<div className="user-info expanded table-row">
									<div className="row">
										<div className="col-sm-8">
											<span className="user-invitation-email">sadanmasroor87@gmail.com</span>
										</div>
										<div className="col-sm-2">
											<button className="btn-fancy btn-medium action-revoke">Revoke</button>
										</div>
										<div className="col-sm-2">
											<button className="btn-fancy btn-medium action-resend">Resend</button>
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
