import React, { Component } from "react";
import { inject, observer } from "mobx-react";

@inject("messageStore")
@observer
class EditingCommand extends Component {
  finishEdit = () => {
    const { messageStore } = this.props;
    messageStore.finishEdit();
  };

  cancelEdit = () => {
    const { messageStore } = this.props;
    messageStore.cancelEdit();
  };

  render() {
    const { messageStore } = this.props;
    const { messageInEdit } = messageStore;

    return (
      messageInEdit && (
        <div className="editing-commands">
          <div className="editing-commands-cancel">
            <kbd>Esc</kbd> to{" "}
            <button
              type="button"
              className="btn-fancy btn-default btn-small"
              onClick={this.cancelEdit}
            >
              Cancel editing
            </button>
          </div>
          <div className="editing-commands-save">
            <kbd>Enter</kbd> to{" "}
            <button
              type="button"
              className="btn-fancy btn-default btn-small"
              onClick={this.finishEdit}
            >
              Save changes
            </button>
          </div>
        </div>
      )
    );
  }
}

export default EditingCommand;
