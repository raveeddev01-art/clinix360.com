import { Socket } from "phoenix";

if (window.authenticationToken !== "") {
  window.socket = new Socket(`wss://${window.applicationHost}/socket`, {
    params: {
      authenticationToken: window.authenticationToken,
      sessionId: window.sessionId
    }
  });
  socket.connect();
}
