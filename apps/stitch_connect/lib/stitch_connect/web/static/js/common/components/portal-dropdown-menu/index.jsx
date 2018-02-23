import React, { Component } from "react";
import PropTypes from "prop-types";
import debounce from "lodash/debounce";
import PortalDropdownMenuInner from "./portal-dropdown-menu-inner";

class PortalDropdownMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      offset: {}
    };
    this.debouncedCalcPosition = debounce(this.calcPosition, 200);
  }

  componentWillMount() {
    // close dropdown if scroll or resize
    window.addEventListener("resize", this.closeDropdown);
    window.addEventListener("scroll", this.closeDropdown);
    window.addEventListener("mousewheel", this.closeDropdown);
  }

  componentDidMount() {
    this.calcPosition();
  }

  componentWillReceiveProps(nextProps) {
    // calc position when dropdown is open
    if (this.props.open !== nextProps.open && nextProps.open) {
      this.calcPosition();
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.closeDropdown);
    window.removeEventListener("scroll", this.closeDropdown);
    window.removeEventListener("mousewheel", this.closeDropdown);
  }

  closeDropdown = () => {
    this.props.onClose(false);
  };

  calcPosition = () => {
    if (!this.node) {
      return;
    }

    const rect = this.node.getBoundingClientRect();
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const dropup = rect.bottom > window.innerHeight * 2 / 3;

    this.setState({
      offset: {
        top: rect.top + scrollTop + (dropup ? -30 : 0),
        left: rect.left + scrollLeft
      },
      dropup,
      pullRight: rect.right > window.innerWidth / 2
    });
  };

  render() {
    const { open, ...props } = this.props;
    const { dropup, offset, pullRight } = this.state;

    return (
      <div
        ref={el => {
          this.node = el;
        }}
        className="portal-dropdown-wrapper"
      >
        {open && (
          <PortalDropdownMenuInner
            {...props}
            open={open}
            dropup={dropup}
            pullRight={pullRight}
            offset={offset}
          />
        )}
      </div>
    );
  }
}

PortalDropdownMenu.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func
};

PortalDropdownMenu.defaultProps = {
  onClose: () => undefined,
  open: false
};

export default PortalDropdownMenu;
