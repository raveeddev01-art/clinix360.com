import React, { Component } from "react";
import { Row, Col, Button } from "react-bootstrap";
import { inject, observer } from "mobx-react";
import ExportItem from "./export-item";

@inject("exportStore")
@observer
class TeamExport extends Component {
  constructor(props) {
    super(props);
    this.props.exportStore.loadExports();
  }

  _renderExports = () => {
    const { exportStore } = this.props;
    return exportStore.exports.length > 0 ? (
      exportStore.exports.map(exportItem => {
        return (
          <ExportItem
            key={`export_{exportItem.id}`}
            id={exportItem.id}
            insertedAt={exportItem.inserted_at}
            status={exportItem.status}
            downloadLink={exportStore.downloadLink(exportItem.id)}
          />
        );
      })
    ) : (
      <p>No exports found.</p>
    );
  };

  _newExport = () => {
    const { exportStore } = this.props;
    exportStore.createExport();
  };

  render() {
    return (
      <div>
        <h3 className="text-center">Data Export</h3>
        <p>
          In the event that you need to delete your Stitch account, or require
          electronic discovery for legal purposes, Stitch provides full data
          exports to keep you compliant. Here's what we include in our exports:
        </p>
        <ul className="list-unstyled">
          <li>
            <i className="fa fa-circle" /> Public and private room message
            history
          </li>
          <li>
            <i className="fa fa-circle" /> 1-1 direct message history
          </li>
          <li>
            <i className="fa fa-circle" /> Edited and deleted messages
          </li>
          <li>
            <i className="fa fa-circle" /> Archived room message history
          </li>
          <li>
            <i className="fa fa-circle" /> Links to uploaded files
          </li>
        </ul>

        <p className="m-b-40">
          Message history will be provided in JSON format. You will also receive
          a special token allowing you to access file uploads at their specified
          URLs. See our support article{" "}
          <a href="https://teamstitch.zendesk.com/hc/en-us">here</a> for more on
          how to use these files and tokens.
        </p>

        <Row className="m-b-20">
          <Col md={9}>
            <h4 className="export-heading">Export History</h4>
          </Col>
          <Col md={3}>
            <Button
              block
              bsSize="large"
              bsStyle="primary"
              onClick={this._newExport}
            >
              New Export
            </Button>
          </Col>
        </Row>

        <div className="admin-table m-b-40">
          <div className="table-head">
            <Row>
              <Col sm={6}>Date</Col>
              <Col sm={4}>Status</Col>
              <Col sm={2} className="text-center">
                Download
              </Col>
            </Row>
          </div>
          {this._renderExports()}
        </div>
      </div>
    );
  }
}

export default TeamExport;
