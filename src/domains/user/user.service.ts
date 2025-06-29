import { users } from "@/domains/user/user.entity";
import { PostgreSQLFactory } from "@/infras/postgres/postgres.manager";
import { hashPassword } from "../auth/auth.helper";
import type {
	CreateByEmailVerifyCodeDto,
	CreateByPhoneVerifyCodeDto,
	CreateByUserNamePasswordDto,
} from "./dtos/create-user.dto";

const pg = PostgreSQLFactory.getPool();

export const createUser = async (
	dto:
		| CreateByUserNamePasswordDto
		| CreateByEmailVerifyCodeDto
		| CreateByPhoneVerifyCodeDto,
) => {
	// Verification Code
	if (
		(dto as CreateByEmailVerifyCodeDto | CreateByPhoneVerifyCodeDto).verifyCode
	) {
		// TODO: Verify verification code
	}

	const userData: typeof users.$inferInsert = {
		username:
			(dto as CreateByUserNamePasswordDto).username ||
			`dozto_user_${Math.random().toString(36).substring(2, 15)}`,
		...((dto as CreateByUserNamePasswordDto).password && {
			hashedPassword: await hashPassword(
				(dto as CreateByUserNamePasswordDto).password,
			),
		}),
		...((dto as CreateByEmailVerifyCodeDto).email && {
			email: (dto as CreateByEmailVerifyCodeDto).email,
		}),
		...((dto as CreateByPhoneVerifyCodeDto).phoneCountryCode && {
			phoneCountryCode: (dto as CreateByPhoneVerifyCodeDto).phoneCountryCode,
		}),
		...((dto as CreateByPhoneVerifyCodeDto).phone && {
			phone: (dto as CreateByPhoneVerifyCodeDto).phone,
		}),
		...((dto as CreateByUserNamePasswordDto).name && {
			name: (dto as CreateByUserNamePasswordDto).name,
		}),
		...((dto as CreateByUserNamePasswordDto).avatar && {
			avatar: (dto as CreateByUserNamePasswordDto).avatar,
		}),
	};

	return await pg.insert(users).values(userData);
};
