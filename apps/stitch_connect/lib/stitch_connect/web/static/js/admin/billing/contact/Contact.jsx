import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import FormGroup from "react-bootstrap/lib/FormGroup";
import ControlLabel from "react-bootstrap/lib/ControlLabel";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Button from "react-bootstrap/lib/Button";
import get from "lodash/get";

import { alert } from "common/modals";
import { getCountries, getProvinces } from "lib/billing";

const COUNTRIES = getCountries();
const PROVINCES = getProvinces();

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
          zip_code,
          company_name,
          address_line_one,
          address_line_two
        }
      }
    } = props;

    this.state = {
      fields: {
        name,
        city,
        state,
        country,
        zip_code,
        company_name,
        address_line_one,
        address_line_two
      },
      errors: {}
    };
  }

  onInputChange = evt => {
    const { name, value } = evt.target;
    const { fields } = this.state;

    fields[name] = value;

    if (name === "country") {
      fields.state = "";
    }

    this.setState({
      fields
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
      "zip_code",
      "company_name",
      "address_line_one"
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
    const { fields: contact } = this.state;

    if (!this.validate()) {
      return;
    }

    billingStore
      .updateContact(contact)
      .then(contact => {
        alert({
          title: "Contact Updated",
          message: "Contact information has been updated successfully!"
        });
      })
      .catch(error => {
        const { message } = error.data;

        alert({
          title: "Error in updating contact",
          message: (
            <p>
              There was an error in updating contact information. <br />{" "}
              <b>{message}</b>
            </p>
          )
        });
      });
  };

  getValidationState(field) {
    const { errors } = this.state;

    return errors.hasOwnProperty(field) ? "error" : null;
  }

  render() {
    const { fields } = this.state;
    const provinces = get(PROVINCES, fields.country, null);

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
                <option value="">Please select country</option>
                {COUNTRIES.map(({ alpha3, name }) => (
                  <option value={alpha3} key={alpha3}>
                    {name}
                  </option>
                ))}
              </FormControl>
              <FormControl.Feedback />
            </FormGroup>

            <FormGroup
              controlId="company_name"
              validationState={this.getValidationState("company_name")}
            >
              <ControlLabel>Company Name*</ControlLabel>
              <FormControl
                type="text"
                name="company_name"
                value={fields.company_name}
                onChange={this.onInputChange}
              />
              <FormControl.Feedback />
            </FormGroup>

            <FormGroup
              controlId="address_line_one"
              validationState={this.getValidationState("address_line_one")}
            >
              <ControlLabel>Street Address*</ControlLabel>
              <FormControl
                type="text"
                name="address_line_one"
                value={fields.address_line_one}
                onChange={this.onInputChange}
              />
              <FormControl.Feedback />
            </FormGroup>

            <FormGroup controlId="address_line_two">
              <ControlLabel>Suite/Unit</ControlLabel>
              <FormControl
                type="text"
                name="address_line_two"
                value={fields.address_line_two}
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
              {provinces ? (
                <FormControl
                  name="state"
                  componentClass="select"
                  placeholder="select"
                  value={fields.state}
                  onChange={this.onInputChange}
                >
                  <option value="">Please select state/province/region</option>

                  {provinces.map(({ short, name }) => (
                    <option value={short} key={short}>
                      {name}
                    </option>
                  ))}
                </FormControl>
              ) : (
                <FormControl
                  type="text"
                  name="state"
                  value={fields.state}
                  onChange={this.onInputChange}
                />
              )}
              <FormControl.Feedback />
            </FormGroup>

            <FormGroup
              controlId="zip_code"
              validationState={this.getValidationState("zip_code")}
            >
              <ControlLabel>Postal Code*</ControlLabel>
              <FormControl
                type="text"
                name="zip_code"
                value={fields.zip_code}
                onChange={this.onInputChange}
              />
              <FormControl.Feedback />
            </FormGroup>
          </div>

          <div className="button-section">
            <Button type="submit" bsStyle="primary" onClick={this.onSave}>
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default Contact;
