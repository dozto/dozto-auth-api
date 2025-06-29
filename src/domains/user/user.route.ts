import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import logger from "@/utils/logger";
import { createUserDtoSchema } from "./dtos/create-user.dto";
import { UserActions } from "./user.events";
import { createUser } from "./user.service";

export const userRoute = new Hono();

userRoute.post("/", zValidator("json", createUserDtoSchema), async (c) => {
	logger.info(
		{ action: UserActions.USER_CREATED },
		`[${UserActions.USER_CREATED}] Create User Throught Http`,
	);
	const createDto = await c.req.json();

	const res = await createUser(createDto);

	// Auto Login With user Creation

	return c.json(res);
});
