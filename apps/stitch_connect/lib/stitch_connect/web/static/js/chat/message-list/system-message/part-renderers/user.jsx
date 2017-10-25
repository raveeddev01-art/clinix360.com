import React from "react";

export default function userRenderer(field, key) {
  return (
    <span className="system-message__user" key={key}>
      {field.name}
    </span>
  );
}
