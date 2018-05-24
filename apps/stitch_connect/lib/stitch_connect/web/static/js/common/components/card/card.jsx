import React, { Component } from "react";
import PropTypes from "prop-types";
import cx from "classnames";

class Card extends Component {
  _renderDescription = () => {
    const { description } = this.props;
    return description && <h4>{description}</h4>;
  };

  render() {
    const { children, title, className, footer } = this.props;
    const cardStyles = cx("authentication-card", className);

    return (
      <div className={cardStyles}>
        <div className="authentication-header">
          <div>Stitch!</div>
          <div>Some Button</div>
        </div>
        <div className="authentication-body">
          <h1>{title}</h1>
          {this._renderDescription()}
          {children}
        </div>
        {footer}
      </div>
    );
  }
}

Card.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  title: PropTypes.string.isRequired,
  description: PropTypes.node,
  className: PropTypes.string
};

Card.defaultProps = {
  children: null,
  description: "",
  title: "",
  className: ""
};

export default Card;
