import { Socket } from "phoenix";

window.socket = new Socket("/socket", {
  params: {
    authenticationToken: window.authenticationToken
  }
});
socket.connect();
