import { eq } from "drizzle-orm";
import { users } from "@/domains/user/user.entity";
import { PostgreSQLFactory } from "@/infras/postgres/postgres.manager";

const pg = PostgreSQLFactory.getPool();

export const createUser = async (user: typeof users.$inferInsert) => {
	return await pg.insert(users).values(user);
};

export const findUserByUsername = async (username: string) => {
	const pg = PostgreSQLFactory.getPool();

	return await pg.query.users.findFirst({
		where: eq(users.username, username),
	});
};

export const findUserById = async (id: string) => {
	return await pg.query.users.findFirst({
		where: eq(users.id, id),
	});
};

export const findUserByWechatOpenId = async (wechatOpenId: string) => {
	return await pg.query.users.findFirst({
		where: eq(users.wechatOpenId, wechatOpenId),
	});
};

export const findUserByWechatUnionId = async (wechatUnionId: string) => {
	return await pg.query.users.findFirst({
		where: eq(users.wechatUnionId, wechatUnionId),
	});
};

export const updateUser = async (
	id: string,
	user: typeof users.$inferSelect,
) => {
	return await pg.update(users).set(user).where(eq(users.id, id));
};
