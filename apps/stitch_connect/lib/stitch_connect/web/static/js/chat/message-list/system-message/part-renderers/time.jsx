import React from "react";
import moment from "moment";

export default function userRenderer(field, key) {
  return (
    <span className="system-message__time" key={key}>
      {moment
        .utc(field)
        .local()
        .format("hh:mm A")}
    </span>
  );
}
