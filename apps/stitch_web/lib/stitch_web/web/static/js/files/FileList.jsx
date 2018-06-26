import React, { Component } from "react";
import { Pagination } from "react-bootstrap";
import moment from "moment";
import _ from "lodash";

const FileThumb = ({ file }) => {
  const style = {
    position: "absolute",
    top: "10px",
    left: "9px",
    marginTop: " - 1px",
    fontSize: "24px",
    display: "flex",
    backgroundImage: `url("${file.preview_url}")`,
    width: "50px",
    height: "50px",
    backgroundColor: "#f3f3f3",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    borderRadius: "4px",
  }
  if (!!file.preview_url) {
    return (
      <i style={style} data-original="" className="" ></i>
    )
  }
  return (
    <i style={style} data-original="" className="" ></i>
  )
}

const UserInfo = ({ usersMap, file }) => {
  const user = usersMap[file.user_id];

  // Jun 1st at 8:32 PM
  const datetime = moment(file.inserted);
  const formattedDatetime = `${datetime.format("MMM Do")} at ${datetime.format("h:mm a")}`
  return (
    <span>
      {user && `${user.first_name} ${user.last_name}`} {formattedDatetime}
    </span>
  )
}

const FileList = ({ files, usersMap, pages, goToPage }) =>
  <div className="">
    {files.map(file =>
      <div key={file.id} style={{ position: "relative" }}>
        <div className="action">
        </div>
        <FileThumb file={file} />
        <div style={{ marginLeft: "70px", flex: 1 }}>
          <h4>{file.filename}</h4>
          <UserInfo usersMap={usersMap} file={file} /><br />
          <span>{file.public ? "Public file" : "Private file"}</span>
        </div>
      </div>
    )}
    <Pagination bsSize="large">
      {_.times(pages.totalPages, i =>
        <Pagination.Item
          onClick={e => goToPage(i)} key={i} active={i == pages.currentPage}>{i + 1}</Pagination.Item>
      )}
    </Pagination>
  </div>

export default FileList;
