import React, { Component } from "react";
import PropTypes from "prop-types";
import Form from "react-bootstrap/lib/Form";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";
import HelpBlock from "react-bootstrap/lib/HelpBlock";
import Button from "react-bootstrap/lib/Button";
import { Card } from "common/components";

class InvitesCard extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      invites: ["", "", ""]
    };
  }

  onNext = event => {
    event.preventDefault();
    this.props.onNext({
      sendInvites: true,
      invites: this.state.invites
    });
  };

  onSkip = event => {
    event.preventDefault();
    this.props.onNext({
      sendInvites: false,
      invites: this.state.invites
    });
  };

  onChange = index => evt => {
    const invites = [...this.state.invites];
    invites[index] = evt.target.value;
    this.setState({
      invites
    });
  };

  onAddEmail = () => {
    this.setState({
      invites: [...this.state.invites, ""]
    });
  };

  render() {
    const { invites } = this.state;

    return (
      <Card
        title="Send Invitations"
        description={
          <span>
            Enter <strong>invitations</strong> to email out.
          </span>
        }
      >
        <Form onSubmit={this.onNext}>
          {invites.map((email, index) => (
            <FormGroup bsSize="large" key={`invite_email_${index}`}>
              <FormControl
                type="text"
                value={email}
                onChange={this.onChange(index)}
              />
            </FormGroup>
          ))}

          <Button block className="m-b-10" onClick={this.onAddEmail}>
            Add Invitations
          </Button>

          <HelpBlock className="m-b-20">
            Enter your team members&#39; email addresses so they can join your
            team. You can also do this later after you set up your team.
          </HelpBlock>

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
    );
  }
}

InvitesCard.propTypes = {
  onNext: PropTypes.func.isRequired
};

InvitesCard.defaultProps = {
  onNext: () => {}
};

export default InvitesCard;
