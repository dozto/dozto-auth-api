/** biome-ignore-all lint/style/noNonNullAssertion: <Test file> */

import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "bun:test";
import { faker } from "@faker-js/faker";
import * as authSchema from "@/domains/auth/auth.entity";
import * as userSchema from "@/domains/user/user.entity";
import { users } from "@/domains/user/user.entity";
import {
	createUser,
	deleteUser,
	findUserById,
	updateUser,
} from "@/domains/user/user.repository";
import { UserRole, UserStatus, UserTheme } from "@/domains/user/user.type";
import { PostgreSQLFactory } from "@/infras/postgres/postgres.manager";

let pg: PostgreSQLFactory;

// 测试数据生成器
const generateTestUser = () => ({
	username: faker.internet.username(),
	firstName: faker.person.firstName(),
	lastName: faker.person.lastName(),
	avatar: faker.image.avatar(),
	email: faker.internet.email(),
	phone: faker.phone.number().slice(0, 20), // 限制长度为20
	status: faker.helpers.enumValue(UserStatus),
	role: faker.helpers.enumValue(UserRole),
	preferences: {
		language: faker.helpers.arrayElement(["zh-CN", "en-US", "ja-JP"]),
		timezone: faker.helpers.arrayElement([
			"Asia/Shanghai",
			"UTC",
			"America/New_York",
		]),
		theme: faker.helpers.enumValue(UserTheme),
		notifications: {
			email: faker.datatype.boolean(),
			sms: faker.datatype.boolean(),
			push: faker.datatype.boolean(),
		},
	},
	metadata: {
		lastLoginIp: faker.internet.ip(),
		deviceInfo: faker.system.commonFileName(),
		registrationSource: faker.helpers.arrayElement(["web", "mobile", "api"]),
	},
});

describe("User Repository Integration Tests", () => {
	beforeAll(async () => {
		// 确保环境变量已加载
		if (!process.env.POSTGRESQL_CONNECTION_STRING) {
			throw new Error("POSTGRESQL_CONNECTION_STRING is not set");
		}

		// 初始化测试数据库连接，传入完整的 schema
		pg = PostgreSQLFactory.initialize(
			process.env.POSTGRESQL_CONNECTION_STRING,
			{
				...userSchema,
				...authSchema,
			},
		);
		await pg.testConnection();
	});

	afterAll(async () => {
		// 清理测试数据
		const pool = PostgreSQLFactory.getPool();
		await pool.delete(users);
	});

	beforeEach(async () => {
		// 每个测试前清理用户表
		const pool = PostgreSQLFactory.getPool();
		await pool.delete(users);
	});

	describe("Create User", () => {
		it("Should create user with all fields", async () => {
			// Arrange
			const testUser = generateTestUser();

			// Act
			const result = await createUser(testUser);

			// Assert
			expect(result).toBeDefined();
			expect(result.length).toBe(1);
			expect(result[0]!.username).toBe(testUser.username);
			expect(result[0]!.email).toBe(testUser.email);
			expect(result[0]!.firstName).toBe(testUser.firstName);
			expect(result[0]!.lastName).toBe(testUser.lastName);
			expect(result[0]!.status).toBe(testUser.status);
			expect(result[0]!.role).toBe(testUser.role);
			expect(result[0]!.preferences).toEqual(testUser.preferences);
			expect(result[0]!.metadata).toEqual(testUser.metadata);
			expect(result[0]!.id).toBeDefined();
			expect(result[0]!.createdAt).toBeDefined();
			expect(result[0]!.updatedAt).toBeDefined();
		});

		it("Should create user with minimal fields", async () => {
			// Arrange
			const minimalUser = {
				username: faker.internet.username(),
			};

			// Act
			const result = await createUser(minimalUser);

			// Assert
			expect(result).toBeDefined();
			expect(result.length).toBe(1);
			expect(result[0]!.username).toBe(minimalUser.username);
			expect(result[0]!.status).toBe(UserStatus.ACTIVE); // 默认值
			expect(result[0]!.role).toBe(UserRole.USER); // 默认值
		});

		it("Should create multiple users", async () => {
			// Arrange
			const users = [
				generateTestUser(),
				generateTestUser(),
				generateTestUser(),
			];

			// Act
			const results = await Promise.all(users.map((user) => createUser(user)));

			// Assert
			expect(results).toHaveLength(3);
			results.forEach((result: any, index: number) => {
				expect(result[0]!.username).toBe(users[index]!.username);
			});
		});
	});

	describe("Find User By Id", () => {
		it("Should find user by id", async () => {
			// Arrange
			const testUser = generateTestUser();
			const createdUser = await createUser(testUser);
			await new Promise((resolve) => setTimeout(resolve, 100));
			const userId = createdUser[0]!.id;

			// Act
			const foundUser = await findUserById(userId);

			// Assert
			expect(foundUser).toBeDefined();
			expect(foundUser?.id).toBe(userId);
			expect(foundUser?.username).toBe(testUser.username);
		});

		it("Should return null when user does not exist", async () => {
			// Arrange
			const nonExistentId = faker.string.uuid();

			// Act
			const foundUser = await findUserById(nonExistentId);

			// Assert
			expect(foundUser).toBeNull();
		});
	});

	describe("Update User", () => {
		it("Should update user information correctly", async () => {
			// Arrange
			const testUser = generateTestUser();
			const createdUser = await createUser(testUser);
			const userId = createdUser[0]!.id;

			const updateData = {
				firstName: faker.person.firstName(),
				lastName: faker.person.lastName(),
				email: faker.internet.email(),
				status: UserStatus.INACTIVE,
				preferences: {
					language: "en-US",
					theme: UserTheme.dark,
				},
			};

			// Act
			const result = await updateUser(userId, updateData);

			// Assert
			expect(result).toBeDefined();
			expect(result.length).toBe(1);
			expect(result[0]!.firstName).toBe(updateData.firstName);
			expect(result[0]!.lastName).toBe(updateData.lastName);
			expect(result[0]!.email).toBe(updateData.email);
			expect(result[0]!.status).toBe(updateData.status);
			expect(result[0]!.preferences?.language).toBe(
				updateData.preferences.language,
			);
			expect(result[0]!.preferences?.theme).toBe(updateData.preferences.theme);
			expect(result[0]!.username).toBe(testUser.username); // 未更新的字段保持不变
		});

		it("Should partially update user information", async () => {
			// Arrange
			const testUser = generateTestUser();
			const createdUser = await createUser(testUser);
			const userId = createdUser[0]!.id;

			const partialUpdate = {
				firstName: faker.person.firstName(),
			};

			// Act
			const result = await updateUser(userId, partialUpdate);

			// Assert
			expect(result).toBeDefined();
			expect(result[0]!.firstName).toBe(partialUpdate.firstName);
			expect(result[0]!.lastName).toBe(testUser.lastName); // 保持不变
			expect(result[0]!.email).toBe(testUser.email); // 保持不变
		});

		it("Should update user role and status", async () => {
			// Arrange
			const testUser = generateTestUser();
			const createdUser = await createUser(testUser);
			const userId = createdUser[0]!.id;

			const roleStatusUpdate = {
				role: UserRole.ADMIN,
				status: UserStatus.SUSPENDED,
			};

			// Act
			const result = await updateUser(userId, roleStatusUpdate);

			// Assert
			expect(result[0]!.role).toBe(UserRole.ADMIN);
			expect(result[0]!.status).toBe(UserStatus.SUSPENDED);
		});

		it("Should update user preferences", async () => {
			// Arrange
			const testUser = generateTestUser();
			const createdUser = await createUser(testUser);
			const userId = createdUser[0]!.id;

			const newPreferences = {
				language: "ja-JP",
				timezone: "Asia/Tokyo",
				theme: UserTheme.auto,
				notifications: {
					email: true,
					sms: false,
					push: true,
				},
			};

			// Act
			const result = await updateUser(userId, { preferences: newPreferences });

			// Assert
			expect(result[0]!.preferences).toEqual(newPreferences);
		});

		it("Should update user metadata", async () => {
			// Arrange
			const testUser = generateTestUser();
			const createdUser = await createUser(testUser);
			const userId = createdUser[0]!.id;

			const newMetadata = {
				lastLoginAt: faker.date.recent().toISOString(),
				loginCount: faker.number.int({ min: 1, max: 100 }),
				preferredDevice: faker.system.commonFileName(),
			};

			// Act
			const result = await updateUser(userId, { metadata: newMetadata });

			// Assert
			expect(result[0]!.metadata).toEqual(newMetadata);
		});
	});

	describe("Delete User", () => {
		it("Should delete user correctly", async () => {
			// Arrange
			const testUser = generateTestUser();
			const createdUser = await createUser(testUser);
			const userId = createdUser[0]!.id;

			// Act
			const result = await deleteUser(userId);

			// Assert
			expect(result).toBeDefined();
			expect(result.length).toBe(1);
			expect(result[0]!.id).toBe(userId);

			// 验证用户已被删除
			const foundUser = await findUserById(userId);
			expect(foundUser).toBeNull();
		});

		it("Should return empty array when deleting non-existent user", async () => {
			// Arrange
			const nonExistentId = faker.string.uuid();

			// Act
			const result = await deleteUser(nonExistentId);

			// Assert
			expect(result).toHaveLength(0);
		});
	});

	describe("Data Integrity Tests", () => {
		it("Should maintain username uniqueness", async () => {
			// Arrange
			const username = faker.internet.username();
			const user1 = { ...generateTestUser(), username };
			const user2 = { ...generateTestUser(), username };

			// Act & Assert
			await createUser(user1);
			await new Promise((resolve) => setTimeout(resolve, 100));
			expect(createUser(user2)).rejects.toThrow();
		});

		it("Should handle JSON fields correctly", async () => {
			// Arrange
			const testUser = generateTestUser();
			const complexPreferences = {
				language: "zh-CN",
				timezone: "Asia/Shanghai",
				theme: UserTheme.light,
				notifications: {
					email: true,
					sms: false,
					push: true,
				},
				customSettings: {
					fontSize: "medium",
					colorScheme: "blue",
				},
			};

			const complexMetadata = {
				registrationInfo: {
					source: "web",
					referrer: "google.com",
					campaign: "summer2024",
				},
				usageStats: {
					loginCount: 42,
					lastActive: faker.date.recent().toISOString(),
					preferredFeatures: ["dashboard", "analytics"],
				},
			};

			const userWithComplexData = {
				...testUser,
				preferences: complexPreferences,
				metadata: complexMetadata,
			};

			// Act
			const result = await createUser(userWithComplexData);

			// Assert
			expect(result[0]!.preferences).toEqual(complexPreferences);
			expect(result[0]!.metadata).toEqual(complexMetadata);
		});

		it("Should handle timestamp fields correctly", async () => {
			// Arrange
			const testUser = generateTestUser();
			const beforeCreate = new Date();

			// Act
			await new Promise((resolve) => setTimeout(resolve, 100));
			const result = await createUser(testUser);
			await new Promise((resolve) => setTimeout(resolve, 100));
			const afterCreate = new Date();

			// Assert
			const createdAt = new Date(result[0]!.createdAt);
			const updatedAt = new Date(result[0]!.updatedAt);

			expect(createdAt.getTime()).toBeGreaterThanOrEqual(
				beforeCreate.getTime(),
			);
			expect(createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
			expect(updatedAt.getTime()).toBeGreaterThanOrEqual(
				beforeCreate.getTime(),
			);
			expect(updatedAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
		});
	});

	describe("Edge Cases", () => {
		it("Should handle empty string fields", async () => {
			// Arrange
			const userWithEmptyFields = {
				username: faker.internet.username(),
				firstName: "",
				lastName: "",
				email: "",
				phone: "",
			};

			// Act
			const result = await createUser(userWithEmptyFields);

			// Assert
			expect(result[0]!.firstName).toBe("");
			expect(result[0]!.lastName).toBe("");
			expect(result[0]!.email).toBe("");
			expect(result[0]!.phone).toBe("");
		});

		it("Should handle null fields", async () => {
			// Arrange
			const userWithNullFields = {
				username: faker.internet.username(),
				firstName: null,
				lastName: null,
				email: null,
				phone: null,
				avatar: null,
				preferences: null,
				metadata: null,
			};

			// Act
			const result = await createUser(userWithNullFields);

			// Assert
			expect(result[0]!.firstName).toBeNull();
			expect(result[0]!.lastName).toBeNull();
			expect(result[0]!.email).toBeNull();
			expect(result[0]!.phone).toBeNull();
			expect(result[0]!.avatar).toBeNull();
			expect(result[0]!.preferences).toBeNull();
			expect(result[0]!.metadata).toBeNull();
		});

		it("Should handle maximum length fields", async () => {
			// Arrange
			const longUsername = "a".repeat(50); // 最大长度
			const longEmail = `${"a".repeat(220)}@example.com`; // 接近最大长度
			const longPhone = "1".repeat(20); // 最大长度

			const userWithLongFields = {
				username: longUsername,
				email: longEmail,
				phone: longPhone,
			};

			// Act
			const result = await createUser(userWithLongFields);

			// Assert
			expect(result[0]!.username).toBe(longUsername);
			expect(result[0]!.email).toBe(longEmail);
			expect(result[0]!.phone).toBe(longPhone);
		});
	});
});
