import React, { Component } from "react";
import PropTypes from "prop-types";

import Button from "react-bootstrap/lib/Button";

class ModulePreview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hideImage: false
    };
  }

  onImageError = () => {
    this.setState({ hideImage: true });
  };

  renderIcon() {
    return (
      !this.state.hideImage && (
        <div className="icon-wrapper hidden-sm hidden-sx">
          <i className={this.props.iconClass} />
        </div>
      )
    );
  }

  render() {
    const { moduleDescription, tagLine, requestUrl } = this.props;

    return (
      <div className="preview">
        <div className="preview-flex">
          <div className="preview-content">
            <h1 className="m-b-20">{tagLine}</h1>

            <h4 className="m-b-30">{moduleDescription}</h4>

            <Button
              bsSize="large"
              bsStyle="primary"
              target="_blank"
              rel="noopener noreferrer"
              href={requestUrl}
            >
              Request Access
            </Button>
          </div>

          {this.renderIcon()}
        </div>
      </div>
    );
  }
}

ModulePreview.propTypes = {
  tagLine: PropTypes.node.isRequired,
  moduleDescription: PropTypes.node.isRequired,
  iconClass: PropTypes.string.isRequired,
  requestUrl: PropTypes.string.isRequired
};

export default ModulePreview;
