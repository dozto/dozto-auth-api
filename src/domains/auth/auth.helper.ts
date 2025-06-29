import argon2 from "argon2";
import jwt, {
	type Algorithm,
	type Jwt,
	type JwtPayload,
	type SignOptions,
	type VerifyOptions,
} from "jsonwebtoken";

export const hashPassword = async (password: string): Promise<string> => {
	return await argon2.hash(password);
};

export const verifyPassword = async (
	hash: string,
	password: string,
): Promise<boolean> => {
	return await argon2.verify(hash, password);
};

const defaultOptions = {
	algorithm: "RS256" as Algorithm,
	expiresIn: 15 * 60 * 1000,
	issuer: process.env.APP_NAME,
};

export const signJWTToken = (
	payload: JwtPayload,
	options: SignOptions = defaultOptions,
): string => {
	// biome-ignore lint/style/noNonNullAssertion: <TODO: Verify and Confirm Env Exists>
	return jwt.sign(payload, process.env.JWT_PRIVATE_KEY!, options);
};

export const verifyJWTToken = (
	token: string,
	options: VerifyOptions = defaultOptions,
): Jwt => {
	// biome-ignore lint/style/noNonNullAssertion: <TODO: Verify and Confirm Env Exists>
	return jwt.verify(token, process.env.JWT_PUBLIC_KEY!, {
		...options,
		complete: true,
	});
};
