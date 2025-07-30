import { eq } from "drizzle-orm";
import { users } from "@/domains/user/user.entity";
import { PostgreSQLFactory } from "@/infras/postgres/postgres.manager";

const pg = PostgreSQLFactory.getPool();

export const createUser = async (user: typeof users.$inferInsert) => {
	return await pg.insert(users).values(user).returning();
};

export const findUserById = async (id: string) => {
	return (
		(await pg.query.users.findFirst({
			where: eq(users.id, id),
		})) || null
	);
};

export const updateUser = async (
	targetUserId: string,
	updatedUserInfo: Partial<typeof users.$inferSelect>,
) => {
	return await pg
		.update(users)
		.set(updatedUserInfo)
		.where(eq(users.id, targetUserId))
		.returning();
};

export const deleteUser = async (userId: string) => {
	return await pg.delete(users).where(eq(users.id, userId)).returning();
};
