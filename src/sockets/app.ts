import authMiddleware from "@/middlewares/auth.middleware";
const socketIo = require("socket.io")(process.env.SOCKET_IO_PORT, {
  cors: {
    origin: [process.env.SOCKET_IO_URL_ORIGIN],
  },
});

class App {
  public constructor() { }
  
  /**
   * Initialize The Socket Connection
   */
  public initializeApp(): void {
    try {
      socketIo.use(authMiddleware.socketIO);
      socketIo.on("connection", (socket: any) => {
        socket.on("createTask", () => {
          socketIo.emit("retrieveTask", "Damenjo Sitepu");
        });
      });
    } catch (e: any) {
      throw new Error(e.message);
    }
  }
}

export default App;