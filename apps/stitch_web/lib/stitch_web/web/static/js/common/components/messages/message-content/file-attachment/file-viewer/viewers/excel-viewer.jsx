import React, { Component } from "react";
import PropTypes from "prop-types";
import * as XLSX from "xlsx";

class ExcelViewer extends Component {
  constructor(props) {
    super(props);
  }

  hoverRow = e => {
    e.target.style.backgroundColor = "#003366";
    e.target.style.color = "white";
  }

  blurRow = e => {
    e.target.style.backgroundColor = "#eee";
    e.target.style.color = "#333";
  }

  setHTML(html) {
    var container = document.getElementById('excel-doc-viewer');
    container.innerHTML = html;
    container.getElementsByTagName('table')[0].style.width = "100%";
    container.getElementsByTagName('tr')[0].style.fontWeight = "bold";
    var tds = container.getElementsByTagName('td');
    for (let i=0; i < tds.length; i++) {
      tds[i].style.border = "1px solid #707070";
      tds[i].style.padding = "4px";
    }

    var rows = container.getElementsByTagName('tr');
    for (let i=0; i < rows.length; i++) {
      rows[i].onmouseenter = this.hoverRow;
      rows[i].onmouseleave = this.blurRow;
    }
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
