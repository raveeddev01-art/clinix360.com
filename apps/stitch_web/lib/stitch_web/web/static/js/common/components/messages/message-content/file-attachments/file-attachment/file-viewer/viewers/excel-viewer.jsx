import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject } from "mobx-react";
import * as XLSX from "xlsx";

@inject("teamFileStore")
class ExcelViewer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      document: null
    }
  }

  componentWillMount() {
    this.loadDocument();
  }

  loadDocument() {
    this.props.teamFileStore.fetchFile(this.props.url)
      .then(response => response.arrayBuffer())
      .then((buffer) => {
        const xlsx = XLSX.read(new Uint8Array(buffer, { type: 'array' }));
        const wsname = xlsx.SheetNames[0];
        const ws = xlsx.Sheets[wsname];
        const html = XLSX.utils.sheet_to_html(ws);
        this.setState({document: <div dangerouslySetInnerHTML={ { __html: html}} />});
      })
      .catch(err => console.error(err));
  }

  render() {
    return (
      <div className="word-document-body" id="excel-doc-viewer">
        {this.state.document}
      </div>
    );
  }
}

ExcelViewer.propTypes = {
  url: PropTypes.string.isRequired
};

export default ExcelViewer;
