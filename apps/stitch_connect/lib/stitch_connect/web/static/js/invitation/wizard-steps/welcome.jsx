import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import FormGroup from "react-bootstrap/lib/FormGroup";
import Button from "react-bootstrap/lib/Button";
import FormControl from "react-bootstrap/lib/FormControl";
import Card from "../components/card/card";

@inject("invitationStore")
@observer
class Welcome extends Component {
  render() {
    return (
      <Card
        title="Welcome!"
        description={
          <span>
            Time to join the{" "}
            <strong>{this.props.invitationStore.teamName}</strong> team.
          </span>
        }
      >
        <p>Your email is:</p>
        <FormGroup bsSize="large">
          <FormControl readOnly value={this.props.email} />
        </FormGroup>
        <Button
          bsStyle="primary"
          bsSize="lg"
          className="btn-block m-b-40"
          onClick={this.props.onNext}
        >
          Continue
        </Button>
      </Card>
    );
  }
}

export default Welcome;
