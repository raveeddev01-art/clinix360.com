import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import Pagination from "react-bootstrap/lib/Pagination";
import times from "lodash/times";
import FileItem from "common/components/file-item";
import ListFilter from "./ListFilter";

@inject("teamFilesStore")
@observer
class FileList extends Component {
  render() {
    const { teamFilesStore } = this.props;
    const { pages, setPage, files } = teamFilesStore;

    return (
      <Row className="file-list">
        <Col sm={8}>
          {files.map(file => <FileItem key={file.id} file={file} />)}
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
        </Col>
        <Col sm={4}>
          <ListFilter />
        </Col>
      </Row>
    );
  }
}

export default FileList;
