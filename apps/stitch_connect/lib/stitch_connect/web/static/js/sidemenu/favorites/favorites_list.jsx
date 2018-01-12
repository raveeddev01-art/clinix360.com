import React from "react";

import Room from "../room";

const FavoritesList = ({ heading, rooms }) =>
  rooms.length > 0 && (
    <div className="menu-nav m-b-20">
      <div className="heading">
        <h5>{heading}</h5>
      </div>

      {rooms.map(room => <Room key={`room-${room.id}`} room={room} />)}
    </div>
  );

export default FavoritesList;
