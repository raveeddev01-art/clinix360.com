import { Socket } from "lib/pheonix";

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
      heartbeatIntervalMs: 5000,
      enableManualRejoin: true
    }
  );
  socket.connect();
}
