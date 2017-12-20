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
      timeout: 3000,
      heartbeatIntervalMs: 3000,
      longpollerTimeout: 3000,
      enableManualRejoin: true
    }
  );
  socket.connect();
}
