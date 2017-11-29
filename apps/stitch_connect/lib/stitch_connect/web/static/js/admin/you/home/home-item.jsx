import React, { Component } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import Button from "react-bootstrap/lib/Button";
import cx from "classnames";
import HelpBlock from "react-bootstrap/lib/HelpBlock";

class HomeItem extends Component {
  onOpen = () => {
    const { link, history } = this.props;
    history.push(link);
  };

  render() {
    const { icon, title, description, openButtonText } = this.props;
    const iconClass = cx("fa", icon);

    return (
      <div className="panel-home-item">
        <Button
          bsStyle="primary"
          className="action-open btn-fancy pull-right"
          onClick={this.onOpen}
        >
          {openButtonText}
        </Button>
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
  icon: PropTypes.string.isRequired
};

HomeItem.defaultProps = {
  children: null,
  description: "",
  openButtonText: "Open",
  link: "/",
  icon: ""
};

export default withRouter(HomeItem);
