import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "Hire3_Secret_if_not_added_in_env";

export interface UserJWTPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

export const signUserToken = (user: { id: string; email: string }) => {
  const payload: UserJWTPayload = { sub: user.id, email: user.email };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string): UserJWTPayload => {
  return jwt.verify(token, JWT_SECRET) as UserJWTPayload;
};
