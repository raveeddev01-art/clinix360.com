import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer, inject } from "mobx-react";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import cx from "classnames";

@inject("inboxStore", "patientsStore")
@observer
class Patient extends Component {
  render() {
    const { patient } = this.props;

    const linkClass = cx("item", {
      active: parseInt(this.props.match.params.id, 10) === patient.id
    });

    return (
      <Link to={`/patients/${patient.id}`} className={linkClass}>
        <div className="item__content">
          <div className="heading">
            <div className="user">{patient.full_name}</div>
          </div>
        </div>
      </Link>
    );
  }
}

Patient.defaultProps = {
  patient: PropTypes.object.isRequired
};

Patient.propTypes = {
  patient: PropTypes.object
};

export default withRouter(Patient);
