import React, { Component } from "react";
import PropTypes from "prop-types";
import { Pagination as RbPagination } from "react-bootstrap";

class Pagination extends Component {
  _renderPages = () => {
    let pageAmount = Math.ceil(this.props.total / this.props.perPage);
    let pages = [];
    _.times(pageAmount, i => {
      pages.push(
        <RbPagination.Item active={this.props.activePage === i + 1}>
          {i + 1}
        </RbPagination.Item>
      );
    });
    return pages;
  };

  render() {
    console.log(this.props);
    return (
      <div>
        <RbPagination bsSize="medium">
          <RbPagination.Item>{1}</RbPagination.Item>
        </RbPagination>
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
