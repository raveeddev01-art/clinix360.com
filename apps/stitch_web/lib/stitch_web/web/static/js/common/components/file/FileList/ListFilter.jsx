import React, { Component } from "react";
import { FormGroup, ControlLabel } from "react-bootstrap";
import { inject, observer } from "mobx-react";
import FileTypeSelector from "./FileTypeSelector";
import UserSelector from "./UserSelector";

@inject("teamFilesStore", "usersStore")
@observer
class FileListFilter extends Component {
  onFileTypeSelect = value => {
    const { teamFilesStore } = this.props;
    teamFilesStore.setFileTypeFilter(value);
  };

  onUserSelect = value => {
    const { teamFilesStore } = this.props;
    teamFilesStore.setUserFilter(value);
  };

  render() {
    const { teamFilesStore, usersStore } = this.props;
    const users = usersStore.connectedAndActivatedUsers;

    return (
      <div className="file-list__filter">
        <FormGroup>
          <ControlLabel>File Type</ControlLabel>
          <FileTypeSelector
            onSelect={this.onFileTypeSelect}
            currentType={teamFilesStore.fileType}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Creator</ControlLabel>
          <UserSelector
            onSelect={this.onUserSelect}
            users={users}
            creatorId={teamFilesStore.creatorId}
          />
        </FormGroup>
      </div>
    );
  }
}

export default FileListFilter;
