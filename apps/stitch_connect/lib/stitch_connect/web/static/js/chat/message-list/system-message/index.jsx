import React, { Component } from "react";
import { inject } from "mobx-react";
import PropTypes from "prop-types";
import partRenderers from "./part-renderers";

@inject("messageStore")
class SystemMessage extends Component {
  render() {
    const { message } = this.props;
    const parts = message.text_content.split(/(\{[a-z]*\})/).filter(Boolean);
    return (
      <div
        className="system-message"
        ref={div => {
          this.messageDiv = div;
        }}
      >
        {parts.reduce((prev, part, index) => {
          const matches = part.match(/\{([a-z]*)\}/);
          if (matches && matches.length) {
            const type = matches[1];
            if (partRenderers[type]) {
              return prev.concat(
                partRenderers[type](
                  message.fields[type],
                  `system-message-${type}-${index}`
                )
              );
            }
          }

          return prev.concat(part);
        }, [])}
      </div>
    );
  }
}

SystemMessage.propTypes = {
  message: PropTypes.object.isRequired
};

export default SystemMessage;
