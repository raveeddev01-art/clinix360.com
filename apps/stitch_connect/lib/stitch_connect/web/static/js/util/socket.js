import { Socket } from "phoenix";

if (window.authenticationToken !== "") {
  let params = {
    authenticationToken: window.authenticationToken,
    sessionId: window.sessionId,
    applicationVersion: window.applicationVersion
  };
  const owner = sessionStorage.getItem("owner");
  if (owner) {
    params.owner = owner;
  }
  window.socket = new Socket(`${websocketScheme}${window.applicationHost}/socket`, {
    params: params,
    timeout: 1000,
    heartbeatIntervalMs: 1000
  });
  socket.connect();
}
