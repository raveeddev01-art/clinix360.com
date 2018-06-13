import React, { Component } from "react";
import PropTypes from "prop-types";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import moment from "moment";

class TeamExportItem extends Component {
  render() {
    const { insertedAt, status, downloadLink } = this.props;
    return (
      <div className="table-item">
        <Row>
          <Col sm={6}>
            {moment
              .utc(insertedAt)
              .local()
              .format("dddd, MMMM D, YYYY, hh:mm A")}
          </Col>
          <Col sm={4}>{status}</Col>
          <Col sm={2} className="text-center">
            {status === "COMPLETE" && (
              <a href={downloadLink}>
                <i className="fa fa-download" />
              </a>
            )}
          </Col>
        </Row>
      </div>
    );
  }
}

TeamExportItem.propTypes = {
  insertedAt: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  downloadLink: PropTypes.string.isRequired
};

export default TeamExportItem;
