import React, { Component } from "react";
import PropTypes from "prop-types";
import FileAttachment from "./file-attachment";

class MediaAttachments extends Component {
    constructor(props) {
        super(props);
        this.state = {
            filesCollapsed: false
        }
    }

    toggleCollapseMedia = () => {
        const { filesCollapsed } = this.state;
        this.setState({filesCollapsed: !filesCollapsed});
    }

    renderToggleIcon() {
        const toggleIconClass = this.state.filesCollapsed ? "fa fa-caret-right" : "fa fa-caret-down";
        return (
            <i className={toggleIconClass} onClick={this.toggleCollapseMedia} />
        )
    }

    renderMediaTitle() {
        const { message, attachmentsCount } = this.props;
        const title = attachmentsCount > 1 ? `${attachmentsCount} files` : `${message.fields[0].filename}`
        return (
            <div className="attachment-title">
                {title} &nbsp;
                {this.renderToggleIcon()}
            </div>
        );
    }

    renderCollapseButton () {
        if(!this.props.mediaSize) {
            return this.renderMediaTitle();
        }
    }

    render() {
        const { message, user, isConversationMessage, onCommentsClick, attachmentsCount, inThread, mediaSize } = this.props;

        let mediaBlockClass = "media-thumbnail";
        if(mediaSize) {
            mediaBlockClass = `${mediaBlockClass} ${mediaSize}`;
        } else if(inThread) {
            mediaBlockClass = `${mediaBlockClass} media-size-md`;
        } else if (attachmentsCount > 1) {
            mediaBlockClass = `${mediaBlockClass} media-size-lg`;
        }

        const mediaGridClass = this.state.filesCollapsed ? "hidden" : "media-grid";

        return (
            <div>
                {this.renderCollapseButton()}
                <div className={mediaGridClass}>
                    {message.fields.map((fields, index) => {
                        return (
                            <div key={index}>
                                <FileAttachment
                                    {...fields}
                                    key={index}
                                    message={message}
                                    user_id={user.id}
                                    file_id={fields.id}
                                    mediaBlockClass={mediaBlockClass}
                                    isConversationMessage={isConversationMessage}
                                    onCommentsClick={onCommentsClick}
                                />
                            </div>
                        )
                    })}
                </div>
            </div>
        );

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
