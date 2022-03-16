import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import { withRouter } from "react-router-dom";
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";
import { getGroupUrl } from "lib/utils";

import RoomItem from "./room_item";

const enterKey = 13;
const upKey = 38;
const downKey = 40;
const maxQuickSearchListLength = 8;
@inject("groupsStore")
@observer
class RoomsModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filter: "",
      inputFocused: false,
      selectedGroupIndex: -1
    };
  }

  // =============
  //   LIFECYCLE
  // =============

  componentDidMount() {
    // timeout is needed for consistent behavior
    setTimeout(() => {
      this.input.focus();
    }, 10);
  }

  // ===========
  //   HELPERS
  // ===========

  get allRooms() {
    return this.applyFilterToList(this.props.groupsStore.quickSwitchGroups);
  }

  get filteredRegularGroups() {
    return this.applyFilterToList(this.props.groupsStore.regularGroups);
  }

  get roomList() {
    return this.props.currentModal === "search"
      ? this.allRooms
      : this.filteredRegularGroups;
  }

  get searchFilterOrManualIndex() {
    // If nothing has been typed into the search
    // and the user has not hit down, don't highlight
    return this.state.filter[0] || this.state.selectedGroupIndex !== -1;
  }

  get endOfListIndex() {
    const lengthOfList = this.roomList.length;

    return this.props.currentModal === "search"
      ? Math.min(maxQuickSearchListLength, lengthOfList) - 1
      : lengthOfList - 1;
  }

  get focusedItemIndex() {
    return (
      this.state.inputFocused &&
      this.searchFilterOrManualIndex &&
      this.state.selectedGroupIndex
    );
  }

  get roomsByJoined() {
    const rooms = this.roomList;

    return {
      joined: rooms.filter(room => room.joined),
      notJoined: rooms.filter(room => !room.joined)
    };
  }

  applyFilterToList(groups) {
    const { groupsStore } = this.props;
    const { filter } = this.state;
    const filterParts = filter.split(" ").map(p => p.toLowerCase());

    // split filter by spaces, and if all the parts match selelect that name
    // doing it this way for groups that have multiple users
    return groups.filter(room => {
      const lowerName = groupsStore.getGroupName(room).toLowerCase();
      return filterParts.every(p => lowerName.indexOf(p) > -1);
    });
  }

  // ===========
  //   ACTIONS
  // ===========

  switchToCreateModal = () => {
    this.props.showRoomCreateModal(this.state.filter);
  };

  handleInputChange = event => {
    const { value } = event.target;

    this.setState({
      filter: value,
      selectedGroupIndex: value[0] ? 0 : -1
    });
  };

  inputRef = node => {
    this.input = node;
  };

  inputFocused = () => {
    this.setState({ inputFocused: true });
  };

  inputBlurred = () => {
    this.setState({ inputFocused: false });
  };

  handleInputKey = e => {
    const code = e.charCode || e.keyCode;
    const { selectedGroupIndex } = this.state;

    // ignore unless there are groups present
    if (!this.roomList[0]) return;

    if (code === enterKey && this.searchFilterOrManualIndex) {
      const room = this.roomList[selectedGroupIndex];
      this.goToRoom(room);
      e.preventDefault();
    } else if (code === downKey) {
      const newIndex = Math.min(this.endOfListIndex, selectedGroupIndex + 1);
      this.setState({ selectedGroupIndex: newIndex });
      e.preventDefault();
    } else if (code === upKey) {
      const newIndex = Math.max(0, selectedGroupIndex - 1);
      this.setState({ selectedGroupIndex: newIndex });
      e.preventDefault();
    }
  };

  goToRoom = room => {
    const { closeModal, history, groupsStore } = this.props;

    closeModal();

    if (room.type === "dm" || room.type === "multi_dm") {
      groupsStore.goToCreatedDM(room);
    } else {
      history.push(getGroupUrl(room));
    }
  };

  // ==========
  //   RENDER
  // ==========

  renderHeaderButton() {
    if (this.props.currentModal === "list") {
      return (
        <Button bsSize="xsmall" onClick={this.switchToCreateModal}>
          Create Room
        </Button>
      );
    }

    return "";
  }

  renderModalHeader() {
    const { currentModal, closeModal } = this.props;
    const title = currentModal === "search" ? "Find Room" : "Browse Rooms";

    return (
      <Modal.Header>
        <Modal.Title>{title}</Modal.Title>
        {this.renderHeaderButton()}
        <a role="link" onClick={closeModal}>
          <i className="fa fa-close" />
        </a>
      </Modal.Header>
    );
  }

  renderInput() {
    return (
      <div className="rooms-filter">
        <input
          ref={this.inputRef}
          type="text"
          className="form-control input-lg"
          placeholder="Find Room"
          onChange={this.handleInputChange}
          onKeyDown={this.handleInputKey}
          onFocus={this.inputFocused}
          onBlur={this.inputBlurred}
        />
      </div>
    );
  }

  renderRoomsListModal() {
    const noRoomsInList = !this.roomList[0];
    const { joined, notJoined } = this.roomsByJoined;
    let i = -1;

    return (
      <Modal.Body>
        {this.renderInput()}

        <div className="rooms-filter-result">
          {notJoined.length > 0 && (
            <div className="rooms-list">
              <h5 className="rooms-list-heading">Rooms you can join</h5>
              <div className="rooms-list-content">
                {notJoined.map(room => {
                  i += 1;
                  return (
                    <RoomItem
                      goToRoom={this.goToRoom}
                      hasManualFocus={this.focusedItemIndex === i}
                      key={i}
                      room={room}
                    />
                  );
                })}
              </div>
            </div>
          )}
          {joined.length > 0 && (
            <div className="rooms-list">
              <h5 className="rooms-list-heading">Rooms you belong to</h5>
              <div className="rooms-list-content">
                {joined.map(room => {
                  i += 1;
                  return (
                    room.id !== 0
                      ? <RoomItem
                        goToRoom={this.goToRoom}
                        hasManualFocus={this.focusedItemIndex === i}
                        key={i}
                        room={room}
                      />
                      : ""
                  );
                })}
              </div>
            </div>
          )}
          {noRoomsInList && (
            <div className="no-result text-center">
              <p>No rooms found.</p>
              <Button bsSize="large" onClick={this.switchToCreateModal}>
                Create a room called <strong>{this.state.filter}</strong>
              </Button>
            </div>
          )}
        </div>
      </Modal.Body>
    );
  }

  renderGoToModal() {
    const rooms = this.roomList.slice(0, maxQuickSearchListLength);

    return (
      <Modal.Body>
        {this.renderInput()}
        <div className="rooms-filter-result">
          {rooms[0] && (
            <div className="rooms-list">
              <div className="rooms-list-content">
                {rooms.map((room, i) => {
                  return (
                    <RoomItem
                      hasManualFocus={this.focusedItemIndex === i}
                      key={i}
                      room={room}
                      goToRoom={this.goToRoom}
                      hideSlug
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Modal.Body>
    );
  }

  render() {
    const { currentModal } = this.props;

    return (
      <div>
        {this.renderModalHeader()}
        {currentModal === "search" && this.renderGoToModal()}
        {currentModal === "list" && this.renderRoomsListModal()}
      </div>
    );
  }
}

RoomsModal.propTypes = {
  currentModal: PropTypes.string.isRequired,
  showRoomCreateModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired
};

export default withRouter(RoomsModal);
