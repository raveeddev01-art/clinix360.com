import React, { Component } from "react";
import { inject } from "mobx-react";
import PropTypes from "prop-types";
import getFileType from "lib/file-types";
import MediaAttachments from "./media";
import DefaultAttachments from "./default";
import uniq from "lodash/uniq";

@inject("desktopStore", "teamFileStore")
class FileAttachments extends Component {

    getFileRenderer() {
        const fields = this.props.message.fields;
        const rendererTypes = uniq(fields.map(field => getFileType(field.mimetype).title));

        switch (rendererTypes.length) {
            case 1:
              if (this.isMedia(rendererTypes[0])) {
                return MediaAttachments;
              } else {
                return DefaultAttachments;
              }
          
            case 2:
                if (this.isOnlyMedia(rendererTypes)) {
                    return MediaAttachments;
                } else {
                    return DefaultAttachments;
                }
          
            default:
              return DefaultAttachments;
          }
    }

    isOnlyMedia(types) {
        return types.every(type => this.isMedia(type));
    }

    isMedia(type) {
        return ["Image", "Video File"].includes(type);
    }

    render() {
        const { message } = this.props;
        const fileCount = message.fields.length;
        const Renderer = this.getFileRenderer();

        return (
            <Renderer
                {...this.props}
                attachmentsCount={fileCount}
            />
        );
    }
}

FileAttachments.propTypes = {
    message: PropTypes.object,
    onCommentsClick: PropTypes.func
};

FileAttachments.defaultProps = {
    onCommentsClick: undefined,
    message: null
};

export default FileAttachments;
