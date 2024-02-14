import { Request, Response, NextFunction } from "express";
import { statement } from "@/utils/constants/statement.constant";
import { httpResponseStatusCode } from "@/utils/constants/http-response-status-code.constant";
import FirebaseService from "@/utils/services/firebase.service";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { user } from "@/resources/user/user.type";

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

    const user: user.Data = {
      uid: decodedIdToken.uid,
      email: String(decodedIdToken.email),
    };
    req.user = user;
    
    return next();
  } catch (e: any) {
    return res.status(httpResponseStatusCode.FAIL.UNAUTHORIZED).json({
      statement: statement.AUTH.FAIL_ACCESSING_SOURCE
    });
  }
}

export default { express, socketIO };