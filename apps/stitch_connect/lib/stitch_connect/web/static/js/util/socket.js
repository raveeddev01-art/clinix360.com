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
      timeout: 10000,
      heartbeatIntervalMs: 10000,
      enableManualRejoin: true
    }
  );
  socket.connect();
}
