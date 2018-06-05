import React, { Component } from "react";

import ModulePreview from "../common/components/module-preview/module-preview";

class ManagePreview extends Component {
  renderTagline() {
    return (
      <p>
        Your tasks in one place. <br />Your team on the same page.
      </p>
    );
  }

  renderDescription() {
    return (
      <p>
        Create tasks, assign them to team members and know when they’re
        completed. Stitch Manage is the easiest way to keep all your patient
        tasks organized. Never miss a beat delivering seamless, on-time care to
        your patients.
      </p>
    );
  }

  render() {
    return (
      <ModulePreview
        tagLine={this.renderTagline()}
        moduleDescription={this.renderDescription()}
        requestUrl="https://teamstitch.typeform.com/to/Yt22AI"
        moduleName="Stitch Manage"
        iconClass="fa fa-tasks"
      />
    );
  }
}

export default ManagePreview;
