import React, { Component } from "react";

export default class UsersMembers extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="admin-panel panel panel-default">
        <div className="panel-body">
					<h1 className="admin-title">Members</h1>
					<div className="admin-content">
						<div className="manage-users">
							<p className="tab-description">
								Manage your users by controlling admin abilities and account status.
								For more information on how account enabling and disabling works, see our support article
								<a href="https://teamstitch.zendesk.com/hc/en-us/articles/216488668-User-management" target="_blank">here</a>.
							</p>
							<div className="table members">
								<div className="row">
									<div className="table-head clearfix">
										<div className="col-sm-6">Users</div>
										<div className="col-sm-4">Status</div>
										<div className="col-sm-2">Actions</div>
									</div>
								</div>
								<div className="separator" />
								<div className="user-info expanded table-row">
									<div className="row">
										<div className="col-sm-6">
											<div className="user-box">
												<div className="user-info-box">
													<div className="title">
														<span className="user-status status-offline">
															<i className="fa fa-circle is-online"></i><i className="fa fa-circle-o is-offline"></i>
														</span>
														<span className="name">Bharat Kilaru</span>
														<span className="username">bharat</span>
													</div>
													<div className="email">
														<span>bharat@teamstitch.com</span>
													</div>
												</div>
											</div>
										</div>
										<div className="col-sm-4">
											<div className="user-membership">
												<span className="user-member-type">Admin, Full&nbsp;Member</span>
											</div>
										</div>
										<div className="col-sm-2">
											<div className="user-members-actions">
												<button className="btn-fancy btn-primary btn-medium toggle-manage-panel">Manage</button>
											</div>
										</div>
										<div className="col-xs-12 user-manage-panel">
											<div className="manage-panel-buttons clearfix">
												<button className="do-toggle-guest btn-fancy btn-default btn-small">Convert to Guest</button>
												<button className="do-toggle-admin btn-fancy btn-default btn-small">Revoke Admin</button>
												<button className="do-toggle-active btn-fancy btn-default btn-small pull-right">Disable Account</button>
											</div>
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
