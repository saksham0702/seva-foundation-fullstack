import jwt, { SignOptions } from "jsonwebtoken";

export const generateToken = (payload: Record<string, unknown>) => {
  const rawExpires = process.env.JWT_ACCESS_EXPIRES_IN || "7d";
  // If rawExpires is numeric (e.g. "3600"), convert to number. If it's a timespan string (e.g. "7d", "1d"), use string directly.
  const expiresIn: SignOptions["expiresIn"] = !isNaN(Number(rawExpires))
    ? Number(rawExpires)
    : (rawExpires as unknown as SignOptions["expiresIn"]);

  const options: SignOptions = { expiresIn };

  return jwt.sign(
    payload,
    process.env.JWT_ACCESS_SECRET || "default_secret",
    options
  );
};