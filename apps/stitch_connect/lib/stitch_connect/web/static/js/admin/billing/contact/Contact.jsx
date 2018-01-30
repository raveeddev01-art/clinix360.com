import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Button from "react-bootstrap/lib/Button";

import { alert } from "common/modals";
import { getCountries } from "lib/billing";

@inject("billingStore")
@observer
class Contact extends Component {
  constructor(props) {
    super(props);

    const {
      billingStore: {
        contact: {
          name,
          city,
          state,
          country,
          zip_code: zipCode,
          company_name: companyName,
          address_line_one: addressLineOne,
          address_line_two: addressLineTwo
        }
      }
    } = props;

    this.state = {
      name,
      city,
      state,
      country,
      zipCode,
      companyName,
      addressLineOne,
      addressLineTwo
    };
  }

  onInputChange = evt => {
    this.setState({
      [evt.target.name]: evt.target.value
    });
  };

  onSave = () => {
    const { billingStore } = this.props;

    billingStore.updateContact(this.state).then(contact => {
      alert({
        title: "Contact Updated",
        message: "Contact information has been updated successfully!"
      });
    });
  };

  render() {
    const {
      name,
      city,
      state,
      country,
      zipCode,
      companyName,
      addressLineOne,
      addressLineTwo
    } = this.state;
    const countries = getCountries();

    return (
      <div className="contact-tab">
        <h4>Name</h4>
        <FormGroup controlId="name">
          <FormControl
            type="text"
            name="name"
            value={name}
            placeholder="Team name"
            onChange={this.onInputChange}
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
                name="country"
                componentClass="select"
                placeholder="select"
                value={country}
                onChange={this.onInputChange}
              >
                {countries.map(({ alpha3, name }) => (
                  <option value={alpha3} key={alpha3}>
                    {name}
                  </option>
                ))}
              </FormControl>
            </FormGroup>

            <FormGroup controlId="companyName">
              <ControlLabel>Company Name*</ControlLabel>
              <FormControl
                type="text"
                name="companyName"
                value={companyName}
                onChange={this.onInputChange}
              />
            </FormGroup>

            <FormGroup controlId="addressLineOne">
              <ControlLabel>Street Address*</ControlLabel>
              <FormControl
                type="text"
                name="addressLineOne"
                value={addressLineOne}
                onChange={this.onInputChange}
              />
            </FormGroup>

            <FormGroup controlId="addressLineTwo">
              <ControlLabel>Suite/Unit</ControlLabel>
              <FormControl
                type="text"
                name="addressLineTwo"
                value={addressLineTwo}
                onChange={this.onInputChange}
              />
            </FormGroup>

            <FormGroup controlId="city">
              <ControlLabel>City*</ControlLabel>
              <FormControl
                type="text"
                name="city"
                value={city}
                onChange={this.onInputChange}
              />
            </FormGroup>

            <FormGroup controlId="state">
              <ControlLabel>State/Province/Region*</ControlLabel>
              <FormControl
                type="text"
                name="state"
                value={state}
                onChange={this.onInputChange}
              />
            </FormGroup>

            <FormGroup controlId="zipCode">
              <ControlLabel>Postal Code*</ControlLabel>
              <FormControl
                type="text"
                name="zipCode"
                value={zipCode}
                onChange={this.onInputChange}
              />
            </FormGroup>
          </div>

          <div className="button-section">
            <Button bsStyle="primary" onClick={this.onSave}>
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default Contact;
