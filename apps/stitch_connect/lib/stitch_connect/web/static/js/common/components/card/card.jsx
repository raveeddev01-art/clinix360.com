import React, { Component } from "react";
import PropTypes from "prop-types";
import cx from "classnames";

class Card extends Component {
  _renderDescription = () => {
    const { description } = this.props;
    return description && <h5>{description}</h5>;
  };

  render() {
    const { children, header, title, className } = this.props;
    const cardStyles = cx("authentication-card", "text-center", className);

    return (
      <div className={cardStyles}>
        {header}
        <h2>{title}</h2>
        {this._renderDescription()}
        {children}
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
