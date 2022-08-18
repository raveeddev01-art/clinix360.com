import React from "react";
import UserProfileMenu from "../../../../common/components/user-profile-menu";


export default function userRenderer(user, key) {
  const user_name = user.is_bot ? user.username : user.full_name;
  return (
    <span className="system-message__user" key={key}>
          <UserProfileMenu
            user={user}
            className="name"
          >
            {user_name}
          </UserProfileMenu>
    </span>
  );
}
