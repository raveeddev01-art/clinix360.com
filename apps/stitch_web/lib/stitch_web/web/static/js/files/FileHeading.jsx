import React, { Component } from "react";

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

export default FileHeading;