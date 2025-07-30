import { eq } from "drizzle-orm";
import { PostgreSQLFactory } from "@/infras/postgres/postgres.manager";
import {
	authentications,
	authHistory,
	tokenRecords,
	totpTempRecords,
} from "./auth.entity";

const pg = PostgreSQLFactory.getPool();

// TOTP临时记录表
export const createTotpTempRecord = async (
	totp: typeof totpTempRecords.$inferInsert,
) => {
	return await pg.insert(totpTempRecords).values(totp).returning();
};

export const findTotpTempRecordByIdentifier = async (identifier: string) => {
	return (
		(await pg.query.totpTempRecords.findFirst({
			where: eq(totpTempRecords.identifier, identifier),
		})) || null
	);
};

export const updateTotpTempRecord = async (
	identifier: string,
	totp: Partial<typeof totpTempRecords>,
) => {
	return await pg
		.update(totpTempRecords)
		.set(totp)
		.where(eq(totpTempRecords.identifier, identifier))
		.returning();
};

// 登录认证表
export const createAuthentication = async (
	auth: typeof authentications.$inferInsert,
) => {
	return await pg.insert(authentications).values(auth).returning();
};

export const findAuthenticationById = async (id: string) => {
	return (
		(await pg.query.authentications.findFirst({
			where: eq(authentications.id, id),
		})) || null
	);
};

export const updateAuthentication = async (
	id: string,
	auth: Partial<typeof authentications>,
) => {
	return await pg
		.update(authentications)
		.set(auth)
		.where(eq(authentications.id, id))
		.returning();
};

// Token记录表
export const createTokenRecord = async (
	token: typeof tokenRecords.$inferInsert,
) => {
	return await pg.insert(tokenRecords).values(token).returning();
};

export const findTokenRecordByRefreshToken = async (refreshToken: string) => {
	return (
		(await pg.query.tokenRecords.findFirst({
			where: eq(tokenRecords.refreshToken, refreshToken),
		})) || null
	);
};

export const findTokenRecordById = async (id: string) => {
	return (
		(await pg.query.tokenRecords.findFirst({
			where: eq(tokenRecords.id, id),
		})) || null
	);
};

export const updateTokenRecord = async (
	id: string,
	token: Partial<typeof tokenRecords>,
) => {
	return await pg
		.update(tokenRecords)
		.set(token)
		.where(eq(tokenRecords.id, id))
		.returning();
};

// 认证历史表
export const createAuthHistory = async (
	auth: typeof authHistory.$inferInsert,
) => {
	return await pg.insert(authHistory).values(auth);
};
