import React, { Component } from "react";
import PropTypes from "prop-types";
import RbPagination from "react-bootstrap/lib/Pagination";
import times from "lodash/times";

class Pagination extends Component {
  _renderPages = () => {
    const pageAmount = Math.ceil(this.props.total / this.props.perPage);
    return times(pageAmount).map(i => (
      <RbPagination.Item
        key={`page_item_${i}`}
        active={this.props.activePage === i + 1}
        onClick={() => {
          this.props.onPageClick(i + 1);
        }}
      >
        {i + 1}
      </RbPagination.Item>
    ));
  };

  render() {
    return (
      <div className="text-right">
        <RbPagination>{this._renderPages()}</RbPagination>
      </div>
    );
  }
}

Pagination.propTypes = {
  activePage: PropTypes.number.isRequired,
  perPage: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  onPageClick: PropTypes.func.isRequired
};

export default Pagination;
