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

// Amount of waiting period in milliseconds used in debouncing presence update
export const PRESENCE_DEBOUNCE_WAIT = 2000;
