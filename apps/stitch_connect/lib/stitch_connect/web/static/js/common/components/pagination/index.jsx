import React, { Component } from "react";
import PropTypes from "prop-types";
import { Pagination as RbPagination } from "react-bootstrap";

class Pagination extends Component {
  _renderPages = () => {
    let pageAmount = Math.ceil(this.props.total / this.props.perPage);
    let pages = [];
    return _.times(pageAmount).map(i => (
      <RbPagination.Item
        key={`page_item_${i}`}
        active={this.props.activePage === i + 1}
      >
        {i + 1}
      </RbPagination.Item>
    ));
  };

  // <RbPagination.First />
  // <RbPagination.Prev />
  // <RbPagination.Item>{1}</RbPagination.Item>
  // <RbPagination.Ellipsis />

  // <RbPagination.Item>{10}</RbPagination.Item>
  // <RbPagination.Item>{11}</RbPagination.Item>
  // <RbPagination.Item active>{12}</RbPagination.Item>
  // <RbPagination.Item>{13}</RbPagination.Item>
  // <RbPagination.Item disabled>{14}</RbPagination.Item>

  // <RbPagination.Ellipsis />
  // <RbPagination.Item>{20}</RbPagination.Item>
  // <RbPagination.Next />
  // <RbPagination.Last />

  render() {
    return (
      <div>
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
