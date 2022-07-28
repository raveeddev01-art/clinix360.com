import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject } from "mobx-react";
import * as docx from "docx-preview";

@inject("teamFileStore")
class DocxViewer extends Component {
  constructor() {
    super();
    this.state = {
      document: null
    };
  }

  componentWillReceiveProps() {
    this.loadDocument();
  }

  loadDocument() {
    this.props.teamFileStore.fetchFile(this.props.url)
      .then(response => response.arrayBuffer())
      .then(buffer => {
        docx
          .renderAsync(buffer, document.getElementById("docx-viewer"))
          .then((x) => console.log(x, "docx: finished"));
      })
      .catch(err => console.error(err));
  }

  render() {
    return (
      <div className="word-document-body" id="docx-viewer">
      </div>
    );

  }
}

DocxViewer.propTypes = {
  url: PropTypes.string.isRequired
};

export default DocxViewer;
