import React, { Component, PropTypes } from "react";

class Card extends Component {
  _renderDescription = () => {
    const { description } = this.props;
    return (
      description &&
      <h5>
        {description}
      </h5>
    );
  };

  render() {
    const { children, header, title, description } = this.props;
    return (
      <div className="authentication-card text-center">
        {header}
        <h2>
          {title}
        </h2>
        {this._renderDescription()}
        {children}
        <p className="copyright m-b-0">&copy; 2017 Stitch Technologies, Inc</p>
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
  description: PropTypes.node
};

Card.defaultProps = {
  children: null,
  header: null,
  description: "",
  title: ""
};

export default Card;
