import React from "react";

import { LoadingIcon } from "common/components";

const Loading = () => (
  <div id="loading-screen-wrapper">
    <div className="text-center">
      <LoadingIcon className="m-b-20" size={3} />
      <h3>Loading...</h3>
    </div>
  </div>
);

export default Loading;
