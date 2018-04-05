import React, { Component } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";
import Button from "react-bootstrap/lib/Button";
import cx from "classnames";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

class HomeItem extends Component {
  render() {
    const {
      link,
      icon,
      title,
      description,
      openButtonText,
      openExternal
    } = this.props;
    const iconClass = cx("fa", icon);

    return (
      <div className="panel-home-item">
        {openExternal && window.electronApp ? (
          <Button
            bsStyle="primary"
            className="action-open btn-fancy pull-right"
            href={link}
            target="_blank"
          >
            {openButtonText}
          </Button>
        ) : (
          <LinkContainer to={link}>
            <Button
              bsStyle="primary"
              className="action-open btn-fancy pull-right"
            >
              {openButtonText}
            </Button>
          </LinkContainer>
        )}

        <h3>
          <i className={iconClass} /> {title}
        </h3>
        <HelpBlock>{description}</HelpBlock>
      </div>
    );
  }
}

HomeItem.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  openButtonText: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  openExternal: PropTypes.bool
};

HomeItem.defaultProps = {
  children: null,
  description: "",
  openButtonText: "Open",
  link: "/",
  icon: "",
  openExternal: false
};

export default withRouter(HomeItem);
