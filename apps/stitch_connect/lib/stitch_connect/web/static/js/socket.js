import { Socket } from "phoenix";

if (window.authenticationToken !== "") {
  window.socket = new Socket(`ws://${window.applicationHost}/socket`, {
    params: {
      authenticationToken: window.authenticationToken
    }
  });
  socket.connect();
}
