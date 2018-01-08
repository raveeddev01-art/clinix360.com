import React from "react";
import PropTypes from "prop-types";
import { MEMBER_TYPE_OPTIONS } from "lib/constants";

const RoleText = ({ roles, groups }) => {
  return (
    <span>
      {roles
        .map(
          r =>
            (MEMBER_TYPE_OPTIONS.find(opt => opt.value === r) || {
              label: r
            }).label
        )
        .join(",")}
      {groups &&
        !!groups.length && (
          <div className="status-column__rooms text-muted">
            ({groups.length} room{groups.length > 1 && "s"})
          </div>
        )}
    </span>
  );
};

RoleText.propTypes = {
  roles: PropTypes.any.isRequired,
  groups: PropTypes.any.isRequired
};

export default RoleText;
