import React, { Component } from "react";
import { LinkContainer } from "react-router-bootstrap";
import Panel from "react-bootstrap/lib/Panel";
import Breadcrumb from "react-bootstrap/lib/Breadcrumb";
import DropdownButton from "react-bootstrap/lib/DropdownButton";
import MenuItem from "react-bootstrap/lib/MenuItem";
import Button from "react-bootstrap/lib/Button";
import { inject, observer } from "mobx-react";
import { isAdminOrOwner } from "lib/utils";

import FileAttachment from "common/components/messages/message-content/file-attachment";
import FileHeading from "common/components/file/FileHeading";
import FileInfo from "common/components/file/FileInfo";
import FileComment from "common/components/file/FileComment";
import FileCommentInput from "common/components/file/FileCommentInput";

@inject("usersStore", "teamFileStore", "titleStore", "desktopStore")
@observer
class FileDetailPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      commentText: ""
    };
  }

  componentWillMount() {
    const { id } = this.props.match.params;
    const { titleStore } = this.props;

    if (id) {
      const encodedFileId = `f${id}`;
      this.props.teamFileStore
        .load(encodedFileId)
        .then(file => titleStore.setPageName(file.filename));
    }
  }

  createPublicLink = () => {
    const { teamFileStore } = this.props;
    teamFileStore.createPublicLink();
  };

  revokePublicLink = () => {
    const { teamFileStore } = this.props;
    teamFileStore.revokePublicLink();
  };

  deleteFile = () => {
    const { teamFileStore } = this.props;
    return teamFileStore.deleteFile().then(() => {
      this.props.history.push("/admin/files");
    });
  };

  renderPublicLink(file) {
    const url = file.public_url;

    return (
      <div className="well file-detail__public">
        <span className="file-detail__public-title">Public Link:</span>
        <a className="file-detail__public-link" href={url}>
          {url}
        </a>
        <Button bsStyle="danger" onClick={this.revokePublicLink}>
          Revoke
        </Button>
      </div>
    );
  }

  renderActions(file) {
    const { desktopStore } = this.props;
    return (
      <DropdownButton
        id="file-action-dropdown"
        title="Actions"
        bsStyle="default"
        pullRight
      >
        {!desktopStore.isElectron && (
          <MenuItem eventKey="1" href={file.url} target="_blank">
            Download
          </MenuItem>
        )}
        <MenuItem divider />
        {file.public_token ? (
          <MenuItem eventKey="2" onClick={this.revokePublicLink}>
            Remove External Link
          </MenuItem>
        ) : (
          <MenuItem eventKey="2" onClick={this.createPublicLink}>
            Create External Link
          </MenuItem>
        )}
        {isAdminOrOwner(file.user_id) && (
          <MenuItem eventKey="3" onClick={this.deleteFile}>
            Delete
          </MenuItem>
        )}
      </DropdownButton>
    );
  }

  renderFile(file) {
    if (!file || !file.id) {
      return null;
    }

    return (
      <div className="file-detail well">
        <div className="file-detail__heading">
          <FileInfo file={file} />
          {this.renderActions(file)}
        </div>
        {file.public_token && this.renderPublicLink(file)}
        <div className="file-detail__content">
          <FileAttachment
            api_url={file.url}
            file_id={file.id}
            {...file}
            useActions={false}
          />
          <div className="file-comment-list">
            {file.comments &&
              file.comments.map(comment => (
                <FileComment comment={comment} key={comment.id} />
              ))}
            <FileCommentInput file={file} />
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { file } = this.props.teamFileStore;
    const user = this.props.usersStore.usersById[file.user_id];

    return (
      <Panel className="admin-panel integration-settings">
        <Panel.Heading>
          <Breadcrumb>
            <LinkContainer to="/admin/files">
              <Breadcrumb.Item>Files</Breadcrumb.Item>
            </LinkContainer>

            <Breadcrumb.Item active>Preview</Breadcrumb.Item>
          </Breadcrumb>

          <FileHeading user={user} file={file} />
        </Panel.Heading>
        <Panel.Body>{this.renderFile(file)}</Panel.Body>
      </Panel>
    );
  }
}

export default FileDetailPage;
