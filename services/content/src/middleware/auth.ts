import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import jwksRsa from "jwks-rsa";

export interface RequestWithUser extends Request {
  user?: { sub: string; email?: string };
}

const client = jwksRsa({
  jwksUri: `${process.env.AUTH_ISSUER}/protocol/openid-connect/certs`,
  cache: true,
  rateLimit: true,
});

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
  client.getSigningKey(header.kid as string, (err, key) => {
    if (err) return callback(err);
    callback(null, key?.getPublicKey());
  });
}

export function verifyToken(req: RequestWithUser, res: Response, next: NextFunction) {


  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Missing or invalid Authorization header." } });
    return;
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, getKey, { algorithms: ["RS256"] }, (err, decoded) => {
    if (err) {
      res.status(401).json({ error: { code: "INVALID_TOKEN", message: "Token verification failed." } });
      return;
    }

    const payload = decoded as jwt.JwtPayload;
    // Keycloak uses "sub" as the unique user ID — mirrors Cognito sub
    req.user = { sub: payload.sub as string, email: payload.email as string };
    next();
  });
}
