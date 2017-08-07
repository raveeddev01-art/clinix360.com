import React, { Component } from "react";

import Modal from "react-bootstrap/lib/Modal";

import Select from "react-select";

import GroupItem from "../group_item.jsx";
import sidemenuStore from "../../sidemenu_store.js";

export default class GroupsModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allGroups: [],
      filteredGroups: [],
      filter: ""
    };
  }

  componentDidMount() {
    this.loadGroups();
  }

  loadGroups = (input = "") => {
    post(`/api/v1/groups/search`, {
      body: {
        term: input
      }
    }).then((response) => {
        this.setState({allGroups: response.data});
      });
  }

  handleChange = (event) => {
    const { allGroups } = this.state;
    const { value } = event.target;
    const filteredGroups = allGroups.filter(
      group => group.name.toLowerCase().startsWith(value.toLowerCase())
    );
    this.setState({
      filter: value,
      filteredGroups
    });
  }
  
  render() {
    const { allGroups, filteredGroups, filter } = this.state;
    const groups = filter !== "" ? filteredGroups : allGroups;
    return (
      <Modal className="sidemenu-modal" show={this.props.showModal}>
        <Modal.Header>
          <Modal.Title>Browse Groups</Modal.Title>
          <a href="#" onClick={this.props.toggleModal}>
            <i className="fa fa-close" />
          </a>
        </Modal.Header>

        <Modal.Body>
          <input
            type="text"
            className="form-control input-lg m-b-20"
            placeholder="Search groups"
            onChange={this.handleChange}
          />

          <h5 className="group-heading">Groups you belong to:</h5>

          <div className="group-list">
            {groups.map(group =>
                <GroupItem key={group.id} group={group} />
              )}
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}
