import React, { Component } from "react";
import PropTypes from "prop-types";
import SimpleBar from "simplebar";

export default class ScrollBar extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    containerRef: PropTypes.func,
    viewRef: PropTypes.func
  };

  static defaultProps = {
    className: "",
    containerRef: () => {},
    viewRef: () => {}
  };

  componentDidMount() {
    const sb = new SimpleBar(this._container, {
      forceEnabled: true
    });
    this.props.viewRef(sb.scrollContentEl);
  }

  handleRef = ref => {
    this._container = ref;
    this.props.containerRef(ref);
  };

  render() {
    const { children, className } = this.props;

    return (
      <div className={className} ref={this.handleRef}>
        {children}
      </div>
    );
  }
}
