import { relations } from "drizzle-orm/relations";
import { authentications, authHistory, tokenRecords, users } from "./schema";

export const authHistoryRelations = relations(authHistory, ({ one }) => ({
	user: one(users, {
		fields: [authHistory.userId],
		references: [users.id],
	}),
	authentication: one(authentications, {
		fields: [authHistory.authId],
		references: [authentications.id],
	}),
}));

export const usersRelations = relations(users, ({ many }) => ({
	authHistories: many(authHistory),
	authentications: many(authentications),
	tokenRecords: many(tokenRecords),
}));

export const authenticationsRelations = relations(
	authentications,
	({ one, many }) => ({
		authHistories: many(authHistory),
		user: one(users, {
			fields: [authentications.userId],
			references: [users.id],
		}),
		tokenRecords: many(tokenRecords),
	}),
);

export const tokenRecordsRelations = relations(tokenRecords, ({ one }) => ({
	user: one(users, {
		fields: [tokenRecords.userId],
		references: [users.id],
	}),
	authentication: one(authentications, {
		fields: [tokenRecords.authId],
		references: [authentications.id],
	}),
}));
