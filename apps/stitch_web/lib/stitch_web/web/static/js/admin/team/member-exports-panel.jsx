import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import Button from "react-bootstrap/lib/Button";
import SettingPanel from "../components/setting-panel/setting-panel";
import MemberExportItem from "./member-export-item";

const title = "Export Data (Select Member)";
const description =
  "Create and download exports of an official record of communications for legal and compliance purposes.";

@inject("memberExportStore")
@observer
class MemberExportsPanel extends Component {
  constructor(props) {
    super(props);

    this.props.memberExportStore.loadExports();
  }

  _renderExports = () => {
    const { memberExportStore } = this.props;
    return memberExportStore.exports.map(exportItem => {
      return (
        <MemberExportItem
          key={`export_${exportItem.id}`}
          insertedAt={exportItem.inserted_at}
          status={exportItem.status}
          user={exportItem.user}
          downloadLink={memberExportStore.downloadLink(exportItem.id)}
        />
      );
    });
  };

  render() {
    const { memberExportStore, onShowModal } = this.props;

    return (
      <SettingPanel saveButtonText="" title={title} description={description}>
        <Row className="m-b-20">
          <Col md={9}>
            <h4 className="export-heading">Export History</h4>
          </Col>
          <Col md={3}>
            <Button
              block
              bsSize="large"
              bsStyle="primary"
              disabled={memberExportStore.exporting}
              onClick={onShowModal}
            >
              New Export
            </Button>
          </Col>
        </Row>
        {memberExportStore.exports.length > 0 ? (
          <div className="admin-table m-b-40">
            <div className="table-head">
              <Row>
                <Col sm={4}>Date</Col>
                <Col sm={4}>Member</Col>
                <Col sm={2}>Status</Col>
                <Col sm={2} className="text-center">
                  Download
                </Col>
              </Row>
            </div>
            {this._renderExports()}
          </div>
        ) : (
          <span>No Exports Found</span>
        )}
      </SettingPanel>
    );
  }
}

MemberExportsPanel.propTypes = {
  onShowModal: PropTypes.func.isRequired
};

MemberExportsPanel.defaultProps = {
  onShowModal: () => {}
};

export default MemberExportsPanel;
