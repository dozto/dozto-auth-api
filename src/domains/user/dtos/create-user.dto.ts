import { z } from "zod";

export const createByUserNamePasswordDtoSchema = z.object({
	username: z.string().min(1),
	password: z.string().min(1),
	name: z.string().min(1).optional(),
	avatar: z.string().optional(),
});

export type CreateByUserNamePasswordDto = z.infer<
	typeof createByUserNamePasswordDtoSchema
>;

export const createByEmailVerifyCodeDtoSchema = z.object({
	email: z.string().email(),
	verifyCode: z.string().min(1),
	username: z.string().min(1).optional(),
	password: z.string().min(1).optional(),
	name: z.string().min(1).optional(),
	avatar: z.string().optional(),
});

export type CreateByEmailVerifyCodeDto = z.infer<
	typeof createByEmailVerifyCodeDtoSchema
>;

export const createByPhoneVerifyCodeDtoSchema = z.object({
	phone: z.string().min(1),
	phoneCountryCode: z.string().min(1),
	verifyCode: z.string().min(1),
	username: z.string().min(1).optional(),
	password: z.string().min(1).optional(),
	name: z.string().min(1).optional(),
	avatar: z.string().optional(),
});

export type CreateByPhoneVerifyCodeDto = z.infer<
	typeof createByPhoneVerifyCodeDtoSchema
>;

export const createUserDtoSchema = z.union([
	createByUserNamePasswordDtoSchema,
	createByEmailVerifyCodeDtoSchema,
	createByPhoneVerifyCodeDtoSchema,
]);
