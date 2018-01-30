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
      fields: {
        name,
        city,
        state,
        country,
        zipCode,
        companyName,
        addressLineOne,
        addressLineTwo
      },
      errors: {}
    };
  }

  onInputChange = evt => {
    this.setState({
      fields: {
        ...this.state.fields,
        [evt.target.name]: evt.target.value
      }
    });
  };

  /**
   * Validate fields
   * 
   * @return boolean TRUE if valid
   */
  validate() {
    const requiredFields = [
      "name",
      "city",
      "state",
      "country",
      "zipCode",
      "companyName",
      "addressLineOne"
    ];
    const { fields } = this.state;
    const errors = {};

    requiredFields.forEach(field => {
      const value = fields[field];

      if (!value) {
        errors[field] = "This field is required";
      }
    });

    this.setState({
      errors
    });

    return Object.keys(errors).length === 0;
  }

  onSave = () => {
    const { billingStore } = this.props;

    if (!this.validate()) {
      return;
    }

    billingStore.updateContact(this.state).then(contact => {
      alert({
        title: "Contact Updated",
        message: "Contact information has been updated successfully!"
      });
    });
  };

  getValidationState(field) {
    const { errors } = this.state;

    return errors.hasOwnProperty(field) ? "error" : null;
  }

  render() {
    const { fields } = this.state;
    const countries = getCountries();

    return (
      <div className="contact-tab">
        <h4>Name</h4>
        <FormGroup
          controlId="name"
          validationState={this.getValidationState("name")}
        >
          <FormControl
            type="text"
            name="name"
            value={fields.name}
            placeholder="Team name"
            onChange={this.onInputChange}
          />

          <FormControl.Feedback />
          <HelpBlock>
            Your team's name and address will be used on all billing invoices
            for the account.
          </HelpBlock>
        </FormGroup>

        <h4>Address</h4>

        <div className="address-section">
          <div className="inputs-section">
            <FormGroup
              controlId="country"
              validationState={this.getValidationState("country")}
            >
              <ControlLabel>Country*</ControlLabel>
              <FormControl
                name="country"
                componentClass="select"
                placeholder="select"
                value={fields.country}
                onChange={this.onInputChange}
              >
                {countries.map(({ alpha3, name }) => (
                  <option value={alpha3} key={alpha3}>
                    {name}
                  </option>
                ))}
              </FormControl>
              <FormControl.Feedback />
            </FormGroup>

            <FormGroup
              controlId="companyName"
              validationState={this.getValidationState("companyName")}
            >
              <ControlLabel>Company Name*</ControlLabel>
              <FormControl
                type="text"
                name="companyName"
                value={fields.companyName}
                onChange={this.onInputChange}
              />
              <FormControl.Feedback />
            </FormGroup>

            <FormGroup
              controlId="addressLineOne"
              validationState={this.getValidationState("addressLineOne")}
            >
              <ControlLabel>Street Address*</ControlLabel>
              <FormControl
                type="text"
                name="addressLineOne"
                value={fields.addressLineOne}
                onChange={this.onInputChange}
              />
              <FormControl.Feedback />
            </FormGroup>

            <FormGroup controlId="addressLineTwo">
              <ControlLabel>Suite/Unit</ControlLabel>
              <FormControl
                type="text"
                name="addressLineTwo"
                value={fields.addressLineTwo}
                onChange={this.onInputChange}
              />
            </FormGroup>

            <FormGroup
              controlId="city"
              validationState={this.getValidationState("city")}
            >
              <ControlLabel>City*</ControlLabel>
              <FormControl
                type="text"
                name="city"
                value={fields.city}
                onChange={this.onInputChange}
              />
              <FormControl.Feedback />
            </FormGroup>

            <FormGroup
              controlId="state"
              validationState={this.getValidationState("state")}
            >
              <ControlLabel>State/Province/Region*</ControlLabel>
              <FormControl
                type="text"
                name="state"
                value={fields.state}
                onChange={this.onInputChange}
              />
              <FormControl.Feedback />
            </FormGroup>

            <FormGroup
              controlId="zipCode"
              validationState={this.getValidationState("zipCode")}
            >
              <ControlLabel>Postal Code*</ControlLabel>
              <FormControl
                type="text"
                name="zipCode"
                value={fields.zipCode}
                onChange={this.onInputChange}
              />
              <FormControl.Feedback />
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
