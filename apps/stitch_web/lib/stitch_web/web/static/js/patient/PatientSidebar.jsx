import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Link, withRouter, matchPath } from "react-router-dom";
import ListGroup from "react-bootstrap/lib/ListGroup";
import ListGroupItem from "react-bootstrap/lib/ListGroupItem";

@inject("currentPatientStore", "teamStore")
@observer
class PatientSidebar extends Component {
  componentWillMount() {}

  _isSelected(path, exact = true) {
    const { location } = this.props;
    return matchPath(location.pathname, { path, exact }) != null;
  }

  renderLink(route, iconClass, text) {
    return (
      <ListGroupItem active={this._isSelected(route, false)}>
        <Link to={route}>
          <i className={iconClass} />
          <span>{text}</span>
        </Link>
      </ListGroupItem>
    );
  }

  render() {
    const { firstName, lastName } = this.props.currentPatientStore;
    const teamName = this.props.teamStore.name;
    const fullName = `${firstName} ${lastName}`;

    return (
      <div className="sidebar patients-sidebar">
        <div className="flex-header m-b-10">
          <div className="team-user">
            <h4 className="team-name">{teamName}</h4>
            <div className="user-name">
              <span className="user-name__text">{fullName}</span>
            </div>
          </div>
        </div>
        <div className="flex-container">
          <ListGroup>
            {this.renderLink("/patient/home", "fa fa-home", "Home")}
            {this.renderLink(
              "/patient/conversations",
              "fa fa-comments",
              "Messages"
            )}
            {this.renderLink("/patient/profile", "fa fa-user", "Profile")}
            <br />
            <ListGroupItem>
              <a href="/patient/logout">
                <i className="fa fa-sign-out" />
                <span>Logout</span>
              </a>
            </ListGroupItem>
          </ListGroup>
        </div>
      </div>
    );
  }
}

export default withRouter(PatientSidebar);
