import React, { Component } from "react";
import PropTypes from "prop-types";
import { Provider } from "mobx-react";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";

import Welcome from "./wizard-steps/welcome";
import FirstName from "./wizard-steps/first_name";
import LastName from "./wizard-steps/last_name";
import Username from "./wizard-steps/username";
import Password from "./wizard-steps/password";
import Pin from "./wizard-steps/pin";
import invitationStore from "./stores/invitation_store";

const stores = { invitationStore };
const stepList = [Welcome, FirstName, LastName, Username, Password, Pin];

class Invitation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      step: 0
    };
  }

  componentWillMount() {
    invitationStore.teamName = this.props.teamName;
    invitationStore.subdomain = this.props.subdomain;
    invitationStore.verifyInvitation(this.props.inviteToken);
  }

  _save = () => {
    invitationStore.completeInvitation();
  };

  _renderStep = () => {
    const { step } = this.state;
    return React.createElement(stepList[step], {
      onNext: () => {
        if (stepList.length <= step + 1) {
          this._save();
        } else {
          this.setState({ step: step + 1 });
        }
      },
      onBack: () => {
        if (step > 0) {
          this.setState({ step: step - 1 });
        }
      },
      onRestart: () => {
        this.setState({ step: 0 });
      }
    });
  };

  render() {
    return (
      <Provider {...stores}>
        <div className="onboarding-wrapper">
          <div id="header">
            <div className="container">
              <Row>
                <Col xs={5}>
                  <a href={`https://${applicationHost}/`} className="brand">
                    <img src="/images/stitch-brand.png" alt="Stitch" />
                  </a>
                </Col>

                <Col xs={7}>
                  <ul className="list-inline text-right m-b-0">
                    <li>
                      <a
                        href={`https://${applicationHost}/signin`}
                        className="nav-link"
                      >
                        Sign In
                      </a>
                    </li>

                    <li>
                      <a
                        href={`https://${applicationHost}/signup/email`}
                        className="nav-link btn-outline"
                      >
                        Create Team
                      </a>
                    </li>
                  </ul>
                </Col>
              </Row>
            </div>
          </div>
          <div className="authentication-wrapper">{this._renderStep()}</div>
        </div>
      </Provider>
    );
  }
}

Invitation.propTypes = {
  teamName: PropTypes.string.isRequired,
  subdomain: PropTypes.string.isRequired,
  inviteToken: PropTypes.string.isRequired
};

export default Invitation;
