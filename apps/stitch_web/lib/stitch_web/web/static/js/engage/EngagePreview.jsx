import React, { Component } from "react";

import ModulePreview from "../common/components/module-preview/module-preview";

class EngagePreview extends Component {
  renderTagline() {
    return (
      <p>
        Engage your patients. <br />See more revenue.
      </p>
    );
  }

  renderDescription() {
    return (
      <p>
        Send messages, share files and start video calls directly with patients.
        Maximize return visits and referrals with our patient communication tool
        designed to help you deliver a phenomenal customer experience.
      </p>
    );
  }

  render() {
    return (
      <ModulePreview
        tagLine={this.renderTagline()}
        moduleDescription={this.renderDescription()}
        requestUrl="https://teamstitch.typeform.com/to/Ncn8x8"
        iconClass="fa fa-bullhorn"
      />
    );
  }
}

export default EngagePreview;
