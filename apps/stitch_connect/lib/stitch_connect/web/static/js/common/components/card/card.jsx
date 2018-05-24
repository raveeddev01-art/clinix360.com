import React, { Component } from "react";
import PropTypes from "prop-types";
import cx from "classnames";

class Card extends Component {
  _renderDescription = () => {
    const { description } = this.props;
    return description && <h4>{description}</h4>;
  };

  render() {
    const { children, header, title, className, footer } = this.props;
    const cardStyles = cx("authentication-card", className);

    return (
      <div className={cardStyles}>
        <div>{header}</div>
        <div>
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
  header: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  title: PropTypes.string.isRequired,
  description: PropTypes.node,
  className: PropTypes.string
};

Card.defaultProps = {
  children: null,
  header: null,
  description: "",
  title: "",
  className: ""
};

export default Card;
