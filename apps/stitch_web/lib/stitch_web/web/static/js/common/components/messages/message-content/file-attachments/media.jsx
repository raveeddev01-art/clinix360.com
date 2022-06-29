import React, { Component } from "react";
import PropTypes from "prop-types";
import FileAttachment from "./file-attachment";

class MediaAttachments extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { message, user, isConversationMessage, onCommentsClick } = this.props;

        return (
            <div>
                <div className="row">
                    {message.fields.map((fields, index) => {
                        return (
                            <div className="col-sm-6 col-lg-4 col-md-6" key={index}>
                                <FileAttachment
                                    {...fields}
                                    className="img-fluid"
                                    key={index}
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
            </div>
        )

    }
}

MediaAttachments.propTypes = {
    onCommentsClick: PropTypes.func,
    message: PropTypes.object
};

MediaAttachments.defaultProps = {
    onCommentsClick: undefined,
    message: null
};

export default MediaAttachments;
