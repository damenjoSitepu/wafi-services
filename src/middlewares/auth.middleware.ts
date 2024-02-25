import { Request, Response, NextFunction } from "express";
import { statement } from "@/utils/constants/statement.constant";
import { httpResponseStatusCode } from "@/utils/constants/http-response-status-code.constant";
import FirebaseService from "@/utils/services/firebase.service";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { user } from "@/resources/user/user.type";
import { UserModel } from "@/resources/user/user.model";

/**
 * SocketIO Auth Middleware
 * 
 * @param {any} socket 
 * @param {any} next 
 */
async function socketIO(
  socket: any,
  next: any, 
): Promise<void> {
  try { 
    const accessToken: string = socket.handshake.auth.accessToken;
    if (!accessToken) {
      return next(new Error(statement.SOCKET_IO.FAIL_CONNECT));
    }

    const decodedIdToken: DecodedIdToken = await FirebaseService.getInstance().getFirebaseAdmin().auth().verifyIdToken(accessToken);
    if (!decodedIdToken) {
      throw new Error();
    }

    const user: user.Data = {
      uid: decodedIdToken.uid,
      email: String(decodedIdToken.email),
      name: "",
    };
    socket.user = user;
    
    return next();
  } catch (e: any) {
    next(new Error(statement.SOCKET_IO.FAIL_CONNECT));
  }
}

/**
 * Express Auth Middleware
 * 
 * @param req E
 * @param res 
 * @param next 
 * @returns 
 */
async function express(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  const bearer = req.headers.authorization;

  if (!bearer || !bearer.startsWith("Bearer ")) {
    return res.status(httpResponseStatusCode.FAIL.UNAUTHORIZED).json({
      statement: statement.AUTH.FAIL_ACCESSING_SOURCE
    });
  }

  try {
    const idToken: string = bearer.split("Bearer ")[1].trim();
    const decodedIdToken: DecodedIdToken = await FirebaseService.getInstance().getFirebaseAdmin().auth().verifyIdToken(idToken);
    if (!decodedIdToken) {
      throw new Error();
    }

    const userExist: any = await UserModel.findOne({ uid: decodedIdToken.uid });
    if (!userExist) throw new Error(statement.AUTH.FAIL_ACCESSING_SOURCE);
    if (!userExist.isActive) throw new Error(statement.AUTH.FAIL_ACCESSING_SOURCE_NOT_BETA_USER);

    const user: user.Data = {
      uid: decodedIdToken.uid,
      email: String(decodedIdToken.email),
      name: "",
    };
    req.user = user;
    
    return next();
  } catch (e: any) {
    return res.status(httpResponseStatusCode.FAIL.UNAUTHORIZED).json({
      statement: e.message,
    });
  }
}

export default { express, socketIO };