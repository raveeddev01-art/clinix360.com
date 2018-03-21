import React, { Component } from "react";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import Button from "react-bootstrap/lib/Button";
import { inject, observer } from "mobx-react";

import SettingPanel from "../components/setting-panel/setting-panel";
import ExportItem from "./export-item";

const title = "Data Export";
const description =
  "Create and download exports of an official record of communications for legal and compliance purposes.";

@inject("exportStore")
@observer
export default class TeamExport extends Component {
  constructor(props) {
    super(props);

    this.props.exportStore.loadExports();
  }

  _renderExports = () => {
    const { exportStore } = this.props;
    return exportStore.exports.map(exportItem => {
      return (
        <ExportItem
          key={`export_${exportItem.id}`}
          insertedAt={exportItem.inserted_at}
          status={exportItem.status}
          downloadLink={exportStore.downloadLink(exportItem.id)}
        />
      );
    });
  };

  _newExport = () => {
    const { exportStore } = this.props;
    exportStore.createExport();
  };

  render() {
    const { exportStore } = this.props;

    return (
      <SettingPanel saveButtonText="" title={title} description={description}>
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
          Message history will be provided in JSON format. See our support
          article{" "}
          <a
            href="https://intercom.help/teamstitch"
            target="_blank"
            rel="noopener noreferrer"
          >
            here
          </a>{" "}
          for more on how to use exports.
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

        {exportStore.exports.length > 0 && (
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
        )}
      </SettingPanel>
    );
  }
}
