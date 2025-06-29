import { findUserByUsername } from "@/domains/user/user.repository";
import { signJWTToken, verifyPassword } from "./auth.helper";

export const authWithPassword = async (username: string, password: string) => {
	const user = await findUserByUsername(username);
	if (!user) {
		throw new Error("User not found");
	}

	if (!user.hashedPassword) {
		throw new Error("User has no password");
	}

	const isPasswordValid = await verifyPassword(user.hashedPassword, password);

	if (!isPasswordValid) {
		throw new Error("Invalid password");
	}

	const token = signJWTToken({
		sub: user.id,
		username: user.username,
		role: user.role,
	});

	return token;
};
