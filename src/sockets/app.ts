import authMiddleware from "@/middlewares/auth.middleware";
import taskSocketHandler from "@/sockets/resources/task";

const server = require("http").createServer();
server.listen(process.env.SOCKET_IO_PORT);
const socketIo = require("socket.io")(server, {
  cors: {
    // origin: [process.env.SOCKET_IO_URL_ORIGIN],
    origin: ["*"],
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
        (new taskSocketHandler(socketIo, socket));
      });
    } catch (e: any) {
      throw new Error(e.message);
    }
  }
}

export default App;