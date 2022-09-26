import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject } from "mobx-react";
import LoadingIcon from "../../../../../../../components/loading-icon";

@inject("teamFileStore")
class ImageViewer extends Component {
  constructor() {
    super();
    this.state = {
      image: null
    };
  }

  componentWillMount() {
    this.loadDocument();
  }

  loadDocument() {
    this.props.teamFileStore.fetchFile(this.props.url)
      .then(response => response.blob())
      .then((blob) => {
        this.setState({ image: window.URL.createObjectURL(blob) });
      })
      .catch(err => console.error(err));
  }

  render() {
    const { image } = this.state;
    return (
      <div className="file-viewer__body-img">
        {(image ?
          <img src={image} className="img-responsive" alt="file-viewer" /> :
          <LoadingIcon className="m-b-20" size={3} />)
        }
      </div>
    );
  }
}

ImageViewer.propTypes = {
  url: PropTypes.string.isRequired
};

export default ImageViewer;
