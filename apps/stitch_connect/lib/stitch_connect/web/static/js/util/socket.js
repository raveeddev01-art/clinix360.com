import { Socket } from "phoenix";

if (window.authenticationToken !== "") {
  window.socket = new Socket(
    `${websocketScheme}${window.applicationHost}/socket`,
    {
      params: {
        authenticationToken: window.authenticationToken,
        sessionId: window.sessionId,
        applicationVersion: window.applicationVersion,
        userAgent: navigator.userAgent
      },
      timeout: 10000,
      heartbeatIntervalMs: 10000
    }
  );
  socket.connect();
}
