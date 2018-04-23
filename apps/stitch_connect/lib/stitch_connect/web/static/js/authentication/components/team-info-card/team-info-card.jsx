import React, { Component } from "react";
import PropTypes from "prop-types";
import Form from "react-bootstrap/lib/Form";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import Button from "react-bootstrap/lib/Button";
import Alert from "react-bootstrap/lib/Alert";
import { Card } from "common/components";

const specialtyOptions = [
  "Acupuncture",
  "Allergy & Immunology",
  "Anatomic/Clinical Pathology",
  "Anesthesiology",
  "Cardiology",
  "Chiropractic",
  "Colon and Rectal Surgery",
  "Dermatology",
  "Emergency Medicine",
  "Endocrinology",
  "Family Medicine",
  "Gastroenterology",
  "General Practice",
  "General Surgery",
  "Hematology",
  "Hepatology",
  "Hospitalist",
  "Infectious Disease",
  "Internal Medicine",
  "Medical Genetics",
  "Naturopathy",
  "Nephrology",
  "Neurological Surgery",
  "Neurology",
  "Nuclear Medicine",
  "Nutritionist",
  "Obstetrics and Gynecology (OBGYN)",
  "Occupational Medicine",
  "Oncology",
  "Ophthalmology",
  "Optometry",
  "Orthopedic Surgery",
  "Osteopathic Medicine",
  "Otolaryngology",
  "Pain Management",
  "Pain Medicine",
  "Pediatrics",
  "Physical Therapy",
  "Plastic and Reconstructive Surgery",
  "Podiatry",
  "Primary Care",
  "Psychiatry",
  "Psychology",
  "Pulmonology",
  "Rheumatology",
  "Thoracic Surgery",
  "Transplant Surgery",
  "Urgent Care",
  "Urology"
];

const ehrOptions = [
  "Allscripts",
  "athenahealth",
  "BestNotes",
  "Care360",
  "CareCloud",
  "Cerner",
  "Dentrix",
  "drchrono",
  "eClinicalWorks",
  "Epic",
  "Greenway Health",
  "Kareo",
  "McKesson",
  "Medez",
  "NexTech",
  "NextGen",
  "NueMD",
  "Practice Fusion",
  "TheraOffice",
  "WebPT"
];

class TeamInfoCard extends Component {
  constructor(...args) {
    super(...args);
    this.state = {};
  }

  onNext = () => {
    return this.props.onNext({
      teamEhr: this.state.teamEhr,
      teamSize: this.state.teamSize,
      teamIndustry: this.state.teamIndustry
    });
  };

  onFormChange = selectType => evt => {
    this.setState({
      [selectType]: evt.target.value
    });
  };

  onSkip = event => {
    event.preventDefault();
    this.props.onNext({
      teamEhr: null,
      teamIndustry: null,
      teamSize: null
    });
  };

  listOptions(optionName) {
    return (
      <option key={optionName} value={optionName}>
        {optionName}
      </option>
    );
  }

  render() {
    const { alertMessage } = this.state;

    return (
      <div>
        {alertMessage && <Alert bsStyle="danger">{alertMessage}</Alert>}
        <Card title="Team Information">
          <Form onSubmit={this.onNext}>
            <FormGroup controlId="teamSpecialty" bsSize="large">
              <label className="team-info-label" htmlFor="teamSpecialty">
                What is your team's <b>specialty</b>?
              </label>
              <FormControl
                value={this.state.teamIndustry}
                onChange={this.onFormChange("teamIndustry")}
                componentClass="select"
                placeholder="Select Specialty"
              >
                <option value="">Select Specialty</option>
                {specialtyOptions.map(this.listOptions)}
                <option value="Other">Other</option>
              </FormControl>
            </FormGroup>

            <FormGroup controlId="teamSize" bsSize="large">
              <label className="team-info-label" htmlFor="teamSize">
                What is your team's <b>size</b>
              </label>
              <FormControl
                value={this.state.teamSize}
                onChange={this.onFormChange("teamSize")}
                componentClass="select"
                placeholder="Select Team Size"
              >
                <option value="">Select Team Size</option>
                <option value="1-10">1-10</option>
                <option value="10-50">10-50</option>
                <option value="50-100">50-100</option>
                <option value="+100">+100</option>
              </FormControl>
            </FormGroup>

            <FormGroup controlId="formControlsSelect" bsSize="large">
              <label className="team-info-label" htmlFor="formControlsSelect">
                What is your team's <b>EHR/EMR</b>?
              </label>
              <FormControl
                value={this.state.teamEhr}
                onChange={this.onFormChange("teamEhr")}
                componentClass="select"
                placeholder="Select EHR/EMR"
              >
                <option value="">Select EHR/EMR</option>
                {ehrOptions.map(this.listOptions)}
                <option value="Other">Other</option>
              </FormControl>
            </FormGroup>

            <Button block bsSize="lg" bsStyle="primary" type="submit">
              Next
            </Button>

            <Button
              block
              bsSize="lg"
              bsStyle="default"
              className="m-b-40"
              onClick={this.onSkip}
            >
              Skip this step
            </Button>
          </Form>
        </Card>
      </div>
    );
  }
}

TeamInfoCard.propTypes = {
  onNext: PropTypes.func.isRequired
};

TeamInfoCard.defaultProps = {
  onNext: () => {}
};

export default TeamInfoCard;
