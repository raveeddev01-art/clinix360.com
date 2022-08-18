import React, { Component } from "react";

class EditingCommand extends Component {
  finishEdit = () => {
    const { messageStore, isReply } = this.props;
    if (isReply) {
      messageStore.finishCommentEdit();
    } else {
      messageStore.finishEdit();
    }
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
        <div className="editing-commands" style={{right: "2px", bottom: "2px", left: "unset", background: "transparent"}}>
          <div className="editing-commands-cancel">
            <button
              type="button"
              className="btn-fancy btn-default btn-small"
              onClick={this.cancelEdit}
            >
              Cancel
            </button>
          </div>
          <div className="editing-commands-save">
            <button
              type="button"
              className="btn-fancy btn-default btn-small"
              onClick={this.finishEdit}
            >
              Save
            </button>
          </div>
        </div>
      )
    );
  }
}

export default EditingCommand;
