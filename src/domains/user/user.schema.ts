import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { users } from "./user.entity";
import { UserTheme } from "./user.type";

export const insertUsersSchema = createInsertSchema(users);
export const selectUsersSchema = createSelectSchema(users);

export const UserInfoSchema = z.object({
	username: z.string().min(3),
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	avatar: z.string().url().optional(),
	email: z.string().email("邮箱格式不正确").optional(),
	phone: z.string().optional(),
	preferences: z
		.object({
			language: z.string().optional(),
			timezone: z.string().optional(),
			theme: z.nativeEnum(UserTheme).optional(),
			notifications: z
				.object({
					email: z.boolean().optional(),
					sms: z.boolean().optional(),
					push: z.boolean().optional(),
				})
				.optional(),
		})
		.optional(),
	metadata: z.record(z.any()).optional(),
});
