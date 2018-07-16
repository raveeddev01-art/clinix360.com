import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { Link, withRouter, matchPath } from "react-router-dom";
import ListGroup from "react-bootstrap/lib/ListGroup";
import ListGroupItem from "react-bootstrap/lib/ListGroupItem";

@inject("currentPatientStore")
@observer
class PatientSidebar extends Component {
  componentWillMount() {}

  _isSelected(path, exact = true) {
    const { location } = this.props;
    return matchPath(location.pathname, { path, exact }) != null;
  }

  render() {
    const { firstName, lastName, team } = this.props.currentPatientStore;
    const fullName = `${firstName} ${lastName}`;

    return (
      <div className="sidebar patients-sidebar">
        <div className="flex-header m-b-10">
          <div className="team-user">
            <h4 className="team-name">{team.name}</h4>
            <div className="user-name">
              <span className="user-name__text">{fullName}</span>
            </div>
          </div>
        </div>
        <div className="flex-container">
          <ListGroup>
            <ListGroupItem active={this._isSelected("/patient/home", false)}>
              <Link to="/patient/home">
                <i className="fa fa-home" />
                <span>Home</span>
              </Link>
            </ListGroupItem>
            <ListGroupItem
              active={this._isSelected("/patient/messages", false)}
            >
              <Link to="/patient/messages">
                <i className="fa fa-comments" />
                <span>Messages</span>
              </Link>
            </ListGroupItem>
            <ListGroupItem active={this._isSelected("/patient/profile", false)}>
              <Link to="/patient/profile">
                <i className="fa fa-user" />
                <span>Profile</span>
              </Link>
            </ListGroupItem>
          </ListGroup>
        </div>
      </div>
    );
  }
}

export default withRouter(PatientSidebar);
