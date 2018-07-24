import React, { Component } from "react";
import PropTypes from "prop-types";
import RbPagination from "react-bootstrap/lib/Pagination";

class Pagination extends Component {
  renderPages = () => {
    const { total, perPage, activePage, maxAround } = this.props;

    const pageAmount = Math.ceil(total / perPage);
    const pages = [];
    const startPage = Math.max(activePage - maxAround, 1);
    const endPage = Math.min(activePage + maxAround, pageAmount);

    for (let i = startPage; i <= endPage; i += 1) {
      pages.push(
        <RbPagination.Item
          key={`page_item_${i}`}
          active={activePage === i}
          onClick={() => this.props.onPageClick(i)}
        >
          {i}
        </RbPagination.Item>
      );
    }

    if (startPage > 1) {
      if (startPage > 2) {
        pages.unshift(
          <RbPagination.Ellipsis key={`page_item_ellipsis_start`} disabled />
        );
      }

      pages.unshift(
        <RbPagination.Item
          key={`page_item_start`}
          onClick={() => this.props.onPageClick(1)}
        >
          1
        </RbPagination.Item>
      );
    }

    if (endPage < pageAmount) {
      if (endPage < pageAmount - 1) {
        pages.push(
          <RbPagination.Ellipsis key={`page_item_ellipsis_end`} disabled />
        );
      }
      pages.push(
        <RbPagination.Item
          key={`page_item_end`}
          onClick={() => this.props.onPageClick(pageAmount)}
        >
          {pageAmount}
        </RbPagination.Item>
      );
    }

    return pages;
  };

  render() {
    return (
      <div className="text-right">
        <RbPagination>{this.renderPages()}</RbPagination>
      </div>
    );
  }
}

Pagination.propTypes = {
  maxAround: PropTypes.number.isRequired,
  activePage: PropTypes.number.isRequired,
  perPage: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  onPageClick: PropTypes.func.isRequired
};

Pagination.defaultProps = {
  maxAround: 2
};

export default Pagination;
