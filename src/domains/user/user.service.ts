import type { users } from "./user.entity";
import {
	createUser as createUserRepo,
	deleteUser as deleteUserRepo,
	findUserById,
	updateUser as updateUserRepo,
} from "./user.repository";
import { UserInfoSchema } from "./user.schema";
import { UserRole, type UserStatus } from "./user.type";

export const createUser = async (
	user: typeof users.$inferInsert,
): Promise<typeof users.$inferSelect> => {
	// 校验用户输入
	const parseResult = UserInfoSchema.safeParse(user);
	const { success: isSuccess, data: validateduser } = parseResult;
	if (!isSuccess) {
		throw new Error("Invalid user input");
	}

	// 创建并返回用户
	const createdUser = await createUserRepo(validateduser);

	if (!createdUser[0]) {
		throw new Error("User creation failed");
	}

	return createdUser[0];
};

export const updateUser = async (
	targetUserId: string,
	updateUserInfo: Partial<typeof users.$inferSelect>,
	byUserId: string,
): Promise<typeof users.$inferSelect> => {
	// 校验用户输入
	const parseResult = UserInfoSchema.safeParse(updateUserInfo);
	const { success: isSuccess, data: validateduser } = parseResult;
	if (!isSuccess) {
		throw new Error("Invalid user input");
	}

	// 检查用户是否有权限更新目标用户
	if (targetUserId !== byUserId) {
		const byUser = await findUserById(byUserId);
		if (
			byUser?.role !== UserRole.SUPER_ADMIN &&
			byUser?.role !== UserRole.ADMIN
		) {
			throw new Error("You are not authorized to update this user");
		}
	}

	const updatedUser = await updateUserRepo(targetUserId, validateduser);

	if (!updatedUser[0]) {
		throw new Error("User update failed");
	}

	return updatedUser[0];
};

export const changeUserStatus = async (
	userId: string,
	status: UserStatus,
	byUserId: string,
): Promise<typeof users.$inferSelect> => {
	const byUser = await findUserById(byUserId);

	if (
		!byUser ||
		![UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(byUser.role as UserRole)
	) {
		throw new Error("You are not authorized to change user status");
	}

	const updatedUser = await updateUserRepo(userId, { status });

	if (!updatedUser[0]) {
		throw new Error("User status change failed");
	}

	return updatedUser[0];
};

export const changeuserRole = async (
	userId: string,
	role: UserRole,
	byUserId: string,
): Promise<typeof users.$inferSelect> => {
	const byUser = await findUserById(byUserId);

	if (
		!byUser ||
		![UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(byUser.role as UserRole)
	) {
		throw new Error("You are not authorized to change user role");
	}

	const updatedUser = await updateUserRepo(userId, { role });

	if (!updatedUser[0]) {
		throw new Error("User role change failed");
	}

	return updatedUser[0];
};

export const deleteUser = async (
	userId: string,
	byUserId: string,
): Promise<typeof users.$inferSelect> => {
	const byUser = await findUserById(byUserId);

	if (
		!byUser ||
		![UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(byUser.role as UserRole)
	) {
		throw new Error("You are not authorized to delete this user");
	}

	const deletedUser = await deleteUserRepo(userId);

	if (!deletedUser[0]) {
		throw new Error("User deletion failed");
	}

	return deletedUser[0];
};
