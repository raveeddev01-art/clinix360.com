import React, { Component } from "react";
import PropTypes from "prop-types";
import * as XLSX from "xlsx";

class ExcelViewer extends Component {
  constructor(props) {
    super(props);
  }

  setHTML(html) {
    var container = document.getElementById('excel-doc-viewer');
    container.innerHTML = html;
  }

  readFile() {
    const file_url = `${this.props.url}?authenticationToken=${window.authenticationToken}`;

    fetch(file_url)
    .then(response => response.arrayBuffer())
    .then(buffer => {
      const xlsx = XLSX.read(new Uint8Array(buffer, {type: 'array'}));
      const wsname = xlsx.SheetNames[0];
      const ws = xlsx.Sheets[wsname];
      const html = XLSX.utils.sheet_to_html(ws);
      this.setHTML(html);
     })
    .catch(err => console.error(err));
  }

  render() {
    this.readFile();

    return (
      <div className="word-document-body" id="excel-doc-viewer"></div>
    );
  }
}

ExcelViewer.propTypes = {
  url: PropTypes.string.isRequired
};

export default ExcelViewer;
