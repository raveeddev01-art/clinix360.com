import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import Pagination from "common/components/pagination";
import FileItem from "common/components/file/FileItem";

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
        <Pagination
          activePage={pages.currentPage}
          perPage={pages.limit}
          total={pages.count}
          onPageClick={setPage}
          maxAround={1}
        />
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
