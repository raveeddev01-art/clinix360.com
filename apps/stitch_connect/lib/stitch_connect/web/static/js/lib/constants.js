export const ROOM_MENU_ITEM_ANCHOR_PREFIX = "sidemenu_room_";
export const NOTIFICATION_PREFERENCES = [
  {
    value: "everything",
    title: "Everything",
    description: "You will be notified for every new message."
  },
  {
    value: "mentions",
    title: "Direct Messages + Mentions",
    description: "You will be notified only when a team member mentions you."
  },
  {
    value: "nothing",
    title: "Nothing",
    description:
      "You will not receive notifications, but will continue to see a badge count for unread messages."
  }
];

export const MEMBER_TYPE_OPTIONS = [
  {
    value: "member",
    label: "Full Member",
    description:
      "have access to all public rooms and can direct message anyone on the team."
  },
  {
    value: "single-room-guest",
    label: "Single Room Guest",
    description:
      "can only access one room, and can only direct message members of that room."
  },
  {
    value: "multi-room-guest",
    label: "Multi Room Guest",
    description:
      "can access more than one room, and can only direct message members of these rooms."
  }
];

// Amount of waiting period in milliseconds used in debouncing presence update
export const PRESENCE_DEBOUNCE_WAIT = 2 * 1000;

// sends became_active events maximum at this duration. Used throttle because it should be sent at least once every 1 min
export const USER_INTERACTION_THROTTLE = 10 * 1000;

// after 30 mins of user inactivity, became_away event is sent
export const BECAME_AWAY_TIMEOUT_MS = 30 * 60 * 1000;

// after 30 mins of user inactivity, became_inactive event is sent
export const BECAME_INACTIVE_TIMEOUT_MS = 30 * 60 * 1000;

// if is_typing is not broadcasted for 3 seconds, we will remove from the user from typinguser list.
export const TYPING_TIMEOUT_MS = 3 * 1000;

// start typing broadcast is debounced by 1 second
export const START_TYPING_THROTTLE_MS = 1 * 1000;

// compare last activity time + security_lockout_seconds with current time every 1 min
export const LOCKOUT_CHECK_MS = 10 * 1000;

// minimum lockout setting allowed in minutes
export const LOCKOUT_MINIMUM = 1;
