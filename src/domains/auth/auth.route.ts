import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { authWithPassword } from "@/domains/auth/auth.service";
import { authLoginDtoSchema } from "@/domains/auth/dtos/auth-login.dto";

export const authRoute = new Hono();

authRoute.post("/login", zValidator("json", authLoginDtoSchema), async (c) => {
	const { username, password } = await c.req.json();
	const token = await authWithPassword(username, password);
	return c.json({ token });
});
