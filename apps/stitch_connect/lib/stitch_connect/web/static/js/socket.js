import { Socket } from "phoenix";

window.socket = new Socket(`wss://${window.applicationHost}/socket`, {
  params: {
    authenticationToken: window.authenticationToken
  }
});
socket.connect();
