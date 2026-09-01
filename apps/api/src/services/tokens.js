import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signAccessToken(user, { sessionId, authenticationTime } = {}) {
  return jwt.sign(
    {
      sub: String(user.id),
      role: user.role,
      ver: Number(user.token_version || user.tokenVersion || 0),
      mfa: Boolean(user.mfaVerified),
      auth_time: Number(authenticationTime || user.authenticationTime || Math.floor(Date.now() / 1000)),
      amr: Array.isArray(user.authenticationMethods)
        ? user.authenticationMethods.slice(0, 5)
        : (user.mfaVerified ? ["mfa"] : ["pwd"])
    },
    env.jwtSecret,
    {
      algorithm: "HS256",
      audience: env.jwtAudience,
      issuer: env.jwtIssuer,
      jwtid: sessionId,
      expiresIn: env.jwtExpiresIn
    }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret, {
    algorithms: ["HS256"],
    audience: env.jwtAudience,
    issuer: env.jwtIssuer
  });
}
