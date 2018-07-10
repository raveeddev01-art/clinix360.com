import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import Pagination from "react-bootstrap/lib/Pagination";
import times from "lodash/times";
import FileItem from "common/components/file-item";

@inject("teamFilesStore")
@observer
class FileList extends Component {
  render() {
    const { teamFilesStore, onFileClick } = this.props;
    const { pages, setPage, files } = teamFilesStore;

    return (
      <div className="file-list">
        {files.map(file => (
          <FileItem key={file.id} file={file} onFileClick={onFileClick} />
        ))}
        <Pagination>
          {times(pages.totalPages, i => (
            <Pagination.Item
              key={i}
              onClick={() => setPage(i)}
              active={i === pages.currentPage}
            >
              {i + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      </div>
    );
  }
}

FileList.propTypes = {
  onFileClick: PropTypes.func
};

FileList.defaultProps = {
  onFileClick: null
};

export default FileList;
