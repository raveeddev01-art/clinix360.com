import { Socket } from "phoenix";

if (window.authenticationToken !== "") {
  const socketPath = window.socketPath || "socket";
  window.socket = new Socket(
    `${websocketScheme}${window.applicationHost}/${socketPath}`,
    {
      params: {
        authenticationToken: window.authenticationToken,
        sessionId: window.sessionId,
        applicationVersion: window.applicationVersion,
        userAgent: navigator.userAgent
      },
      timeout: 29000,
      heartbeatIntervalMs: 29000,
      reconnectAfterMs: () => 1000 // always 1s
    }
  );
  socket.connect();
}
