import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { LoadingIcon } from "common/components";
import Pagination from "common/components/pagination";
import FileItem from "common/components/file/FileItem";

@inject("filesStore", "addonStore")
@observer
class RoomFiles extends Component {
  onFileClick = fileId => {
    const { addonStore } = this.props;

    addonStore.setAddonPanel("files");
    addonStore.toggleAddons(true);
    addonStore.toggleAddonDetail(true);
    addonStore.setAddonDetailPanel("File Details", fileId);
  };

  render() {
    const { filesStore } = this.props;
    const { pages, setPage, files, loading } = filesStore;

    if (loading) {
      return (
        <div className="text-center">
          <LoadingIcon className="file-loading-icon" />
        </div>
      );
    }

    return (
      <div className="file-list-room">
        {!files.length && "No files"}
        {files.map(file => (
          <FileItem key={file.id} file={file} onFileClick={this.onFileClick} />
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

export default RoomFiles;
