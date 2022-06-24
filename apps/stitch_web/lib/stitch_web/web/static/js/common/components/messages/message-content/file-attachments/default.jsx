import React, { Component } from "react";
import PropTypes from "prop-types";
import { inject } from "mobx-react";
import FileAttachment from "../file-attachment";

@inject("desktopStore")
class DefaultAttachments extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { attachmentsCount, message, onCommentsClick, user, isConversationMessage } = this.props
        const useDefault = attachmentsCount > 1 ? true : false;

        return (
            <div>
                {message.fields.map((fields, index) => {
                    return (
                        <div key={index}>
                            <FileAttachment
                                {...fields}
                                useDefault={useDefault}
                                message={message}
                                user_id={user.id}
                                file_id={fields.id}
                                isConversationMessage={isConversationMessage}
                                onCommentsClick={onCommentsClick}
                            />
                        </div>
                    )
                })}
            </div>
        )

    }
}

DefaultAttachments.propTypes = {
    attachmentsCount: PropTypes.number.isRequired,
    onCommentsClick: PropTypes.func,
    message: PropTypes.object
};

DefaultAttachments.defaultProps = {
    attachmentsCount: 0,
    message: null,
    onCommentsClick: undefined
};

export default DefaultAttachments;
