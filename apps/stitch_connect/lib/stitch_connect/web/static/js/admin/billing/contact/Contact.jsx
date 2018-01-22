import React, { Component } from "react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Button from "react-bootstrap/lib/Button";

class Contact extends Component {
  constructor(props) {
    super(props);

    this.state = {
      teamName: "Care Clinic",
      address: {
        country: "United States",
        companyName: "Stitch Technologies, Inc.",
        street: "188 King St.",
        suite: "Apt. PH9",
        city: "San Francisco",
        state: "California",
        postalCode: "94107-4900"
      }
    };
  }

  onTeamNameChange = evt => {
    this.setState({
      teamName: evt.target.value
    });
  };

  onAddressChange = evt => {
    this.setState({
      address: {
        ...this.state.address,
        [evt.target.name]: evt.target.value
      }
    });
  };

  render() {
    const {
      teamName,
      address: { country, companyName, street, suite, city, state, postalCode }
    } = this.state;

    return (
      <div className="contact-tab">
        <h4>Name</h4>
        <FormGroup controlId="teamName">
          <FormControl
            type="text"
            name="teamName"
            value={teamName}
            placeholder="Team name"
            onChange={this.onTeamNameChange}
          />

          <HelpBlock>
            Your team's name and address will be used on all billing invoices
            for the account.
          </HelpBlock>
        </FormGroup>

        <h4>Address</h4>

        <div className="address-section">
          <div className="inputs-section">
            <FormGroup controlId="country">
              <ControlLabel>Country*</ControlLabel>
              <FormControl
                type="text"
                name="country"
                value={country}
                onChange={this.onAddressChange}
              />
            </FormGroup>

            <FormGroup controlId="companyName">
              <ControlLabel>Company Name*</ControlLabel>
              <FormControl
                type="text"
                name="companyName"
                value={companyName}
                onChange={this.onAddressChange}
              />
            </FormGroup>

            <FormGroup controlId="street">
              <ControlLabel>Street Address*</ControlLabel>
              <FormControl
                type="text"
                name="street"
                value={street}
                onChange={this.onAddressChange}
              />
            </FormGroup>

            <FormGroup controlId="suite">
              <ControlLabel>Suite/Unit</ControlLabel>
              <FormControl
                type="text"
                name="suite"
                value={suite}
                onChange={this.onAddressChange}
              />
            </FormGroup>

            <FormGroup controlId="city">
              <ControlLabel>City*</ControlLabel>
              <FormControl
                type="text"
                name="city"
                value={city}
                onChange={this.onAddressChange}
              />
            </FormGroup>

            <FormGroup controlId="state">
              <ControlLabel>State/Province/Region*</ControlLabel>
              <FormControl
                type="text"
                name="state"
                value={state}
                onChange={this.onAddressChange}
              />
            </FormGroup>

            <FormGroup controlId="postalCode">
              <ControlLabel>Postal Code*</ControlLabel>
              <FormControl
                type="text"
                name="postalCode"
                value={postalCode}
                onChange={this.onAddressChange}
              />
            </FormGroup>
          </div>

          <div className="button-section">
            <Button bsStyle="primary">Save Settings</Button>
          </div>
        </div>
      </div>
    );
  }
}

export default Contact;
