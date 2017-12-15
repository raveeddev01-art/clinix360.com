import { Socket } from "phoenix";

if (window.authenticationToken !== "") {
  window.socket = new Socket(
    `${window.websocketScheme}${window.applicationHost}/socket`,
    {
      params: {
        authenticationToken: window.authenticationToken,
        sessionId: window.sessionId,
        applicationVersion: window.applicationVersion
      },
      timeout: 5000,
      heartbeatIntervalMs: 1000
    }
  );
  socket.connect();
}
