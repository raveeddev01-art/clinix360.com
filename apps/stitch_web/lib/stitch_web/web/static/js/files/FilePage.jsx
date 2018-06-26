import React, { Component } from "react";
import Panel from "react-bootstrap/lib/Panel";
import { inject, observer } from "mobx-react";
import prettyBytes from "pretty-bytes";
import moment from "moment";

import FileAttachment from "../common/components/messages/message-content/file-attachment/index";

const FileHeading = ({ user, file }) => {
  if (user) {
    return (
      <div>
        <div className="avatar">
          <img className="img-circle" src={user.avatar_thumb} style={{ width: "20px", height: "20px" }} />
        </div>

        <h4>{user.full_name}</h4>
        <strong>{file.filename}</strong>
      </div>
    )
  }
  return <div></div>
}

const FileThumb = ({ file }) => {
  // window.f = file
  // console.log('file: ', file)
  // // console.log(file.toJS())
  // const style = {
  //   marginTop: " - 1px",
  //   fontSize: "24px",
  //   backgroundImage: `url("${file.preview_url}")`,
  //   width: "50px",
  //   height: "50px",
  //   backgroundColor: "#f3f3f3",
  //   backgroundSize: "cover",
  //   backgroundPosition: "center",
  //   backgroundRepeat: "no-repeat",
  //   borderRadius: "4px",
  // }
  // if (!!file.preview_url) {
  //   return (
  //     <i style={style} data-original="" className="" ></i>
  //   )
  // }
  return (
    <FileAttachment {...file} />
  )
}

const FileInfo = ({ file }) => {
  let prettySize = prettyBytes(file.size_in_bytes);
  let extension = file.filetype;
  let addedOn = moment(file.inserted_at).format("D MMMM, YYYY");
  let accessPerm = file.public ? "" : "This file is private";
  return `${prettySize} ${extension} added on ${addedOn}. ${accessPerm}`
}

@inject("usersStore", "teamFileStore", "titleStore")
@observer
class FilePage extends Component {
  constructor(props) {
    super(props);
    window.FilePage = this;
    this.state = {};
  }

  componentWillMount() {
    if (this.props.match.params.id) {
      const encodedFileId = "f" + this.props.match.params.id;
      this.props.teamFileStore.load(encodedFileId, (file) => {
        this.props.titleStore.setPageName(file.filename);
      });
    }
  }

  render() {
    const file = this.props.teamFileStore.file;
    const user = this.props.usersStore.usersById[file.user_id];

    return (
      <Panel className="home-panel">
        <Panel.Heading>
          <FileHeading user={user} file={file} />
        </Panel.Heading>
        <Panel.Body>

          <div>
            {file && file.id && <FileInfo file={file} />}
          </div>
          {file && file.id && <FileThumb file={file} />}
        </Panel.Body>
      </Panel >
    );
  }
}

export default FilePage;
