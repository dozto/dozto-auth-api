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
import {
	authentications,
	authHistory,
	tokenRecords,
	totpTempRecords,
} from "@/domains/auth/auth.entity";
import {
	createAuthentication,
	createAuthHistory,
	createTokenRecord,
	createTotpTempRecord,
	findAuthenticationById,
	findTokenRecordById,
	findTokenRecordByRefreshToken,
	findTotpTempRecordByIdentifier,
	updateAuthentication,
	updateTokenRecord,
	updateTotpTempRecord,
} from "@/domains/auth/auth.repository";
import { AuthMethod, type LocationInfo } from "@/domains/auth/auth.type";
import * as userSchema from "@/domains/user/user.entity";
import { users } from "@/domains/user/user.entity";
import { createUser } from "@/domains/user/user.repository";
import { UserRole, UserStatus } from "@/domains/user/user.type";
import { PostgreSQLFactory } from "@/infras/postgres/postgres.manager";

let pg: PostgreSQLFactory;

// 测试数据生成器
const generateTotpTempRecord = () => ({
	tempUserId: faker.string.uuid(),
	method: faker.helpers.enumValue(AuthMethod),
	identifier: faker.internet.email().slice(0, 255),
	credential: faker.string.alphanumeric(32),
	attempts: faker.number.int({ min: 0, max: 3 }),
	maxAttempts: 5,
	expiresAt: faker.date.future(),
	userInfo: {
		username: faker.internet.username().slice(0, 50),
		firstName: faker.person.firstName().slice(0, 50),
		lastName: faker.person.lastName().slice(0, 50),
		email: faker.internet.email().slice(0, 255),
		phone: faker.phone.number().slice(0, 20),
		preferences: {
			language: faker.helpers.arrayElement(["zh-CN", "en-US", "ja-JP"]),
		},
	},
});

const generateLocationInfo = (): LocationInfo => ({
	country: faker.location.country(),
	region: faker.location.state(),
	city: faker.location.city(),
	address: faker.location.streetAddress(),
	latitude: faker.location.latitude(),
	longitude: faker.location.longitude(),
});

const generateAuthentication = (userId: string) => ({
	userId,
	method: faker.helpers.enumValue(AuthMethod),
	identifier: faker.internet.email().slice(0, 255),
	credential: faker.string.alphanumeric(64),
	isEnabled: faker.datatype.boolean(),
	expiresAt: faker.date.future(),
	attempts: faker.number.int({ min: 0, max: 3 }),
	maxAttempts: 5,
	metadata: {
		createdFrom: faker.helpers.arrayElement(["web", "mobile", "api"]),
		lastUsed: faker.date.recent().toISOString(),
	},
});

const generateTokenRecord = (userId: string, authId: string) => ({
	userId,
	authId,
	authMethod: faker.helpers.enumValue(AuthMethod),
	refreshToken: faker.string.alphanumeric(128),
	isRevoked: false,
	isExpired: false,
	userAgent: faker.internet.userAgent().slice(0, 500),
	ipAddress: faker.internet.ip(),
	deviceId: faker.string.uuid(),
	deviceType: faker.helpers.arrayElement(["mobile", "desktop", "tablet"]),
	deviceName: faker.system.commonFileName().slice(0, 255),
	location: generateLocationInfo(),
	expiresAt: faker.date.future(),
	refreshTokenExpiresAt: faker.date.future(),
});

const generateAuthHistory = (userId: string, authId: string) => ({
	userId,
	authId,
	method: faker.helpers.enumValue(AuthMethod),
	identifier: faker.internet.email().slice(0, 255),
	success: faker.datatype.boolean(),
	failureReason: faker.helpers.maybe(() =>
		faker.lorem.sentence().slice(0, 255),
	),
	userAgent: faker.internet.userAgent().slice(0, 500),
	ipAddress: faker.internet.ip(),
	deviceId: faker.string.uuid(),
	location: generateLocationInfo(),
});

const generateTestUser = () => ({
	username: faker.internet.username().slice(0, 50),
	firstName: faker.person.firstName().slice(0, 50),
	lastName: faker.person.lastName().slice(0, 50),
	email: faker.internet.email().slice(0, 255),
	phone: faker.phone.number().slice(0, 20),
	status: UserStatus.ACTIVE,
	role: UserRole.USER,
});

describe("Auth Repository Integration Tests", () => {
	beforeAll(async () => {
		if (!process.env.POSTGRESQL_CONNECTION_STRING) {
			throw new Error("POSTGRESQL_CONNECTION_STRING is not set");
		}

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
		const pool = PostgreSQLFactory.getPool();
		await pool.delete(authHistory);
		await pool.delete(tokenRecords);
		await pool.delete(authentications);
		await pool.delete(totpTempRecords);
		await pool.delete(users);
	});

	beforeEach(async () => {
		const pool = PostgreSQLFactory.getPool();
		await pool.delete(authHistory);
		await pool.delete(tokenRecords);
		await pool.delete(authentications);
		await pool.delete(totpTempRecords);
		await pool.delete(users);
	});

	describe("TOTP Temp Records", () => {
		describe("createTotpTempRecord", () => {
			it("Should create TOTP temp record with all fields", async () => {
				// Arrange
				const testRecord = generateTotpTempRecord();

				// Act
				const result = await createTotpTempRecord(testRecord);

				// Assert
				expect(result).toBeDefined();
				expect(result.length).toBe(1);
			});

			it("Should create TOTP temp record with minimal fields", async () => {
				// Arrange
				const minimalRecord = {
					tempUserId: faker.string.uuid(),
					method: AuthMethod.EMAIL_TOTP,
					identifier: faker.internet.email().slice(0, 255),
					credential: faker.string.alphanumeric(32),
					expiresAt: faker.date.future(),
				};

				// Act
				const result = await createTotpTempRecord(minimalRecord);

				// Assert
				expect(result).toBeDefined();
				expect(result.length).toBe(1);
			});
		});

		describe("findTotpTempRecordByIdentifier", () => {
			it("Should find TOTP temp record by identifier", async () => {
				// Arrange
				const testRecord = generateTotpTempRecord();
				await createTotpTempRecord(testRecord);

				// Act
				const foundRecord = await findTotpTempRecordByIdentifier(
					testRecord.identifier,
				);

				// Assert
				expect(foundRecord).toBeDefined();
				expect(foundRecord?.identifier).toBe(testRecord.identifier);
				expect(foundRecord?.method).toBe(testRecord.method);
				expect(foundRecord?.credential).toBe(testRecord.credential);
				expect(foundRecord?.userInfo).toEqual(testRecord.userInfo);
			});

			it("Should return null when record does not exist", async () => {
				// Arrange
				const nonExistentIdentifier = faker.internet.email();

				// Act
				const foundRecord = await findTotpTempRecordByIdentifier(
					nonExistentIdentifier,
				);

				// Assert
				expect(foundRecord).toBeNull();
			});
		});

		describe("updateTotpTempRecord", () => {
			it("Should update TOTP temp record", async () => {
				// Arrange
				const testRecord = generateTotpTempRecord();
				await createTotpTempRecord(testRecord);

				const updateData = {
					attempts: 3,
					verifiedAt: new Date(),
					userInfo: {
						username: "updated_username",
						email: "updated@example.com",
					},
				};

				// Act
				const result = await updateTotpTempRecord(
					testRecord.identifier,
					updateData,
				);

				// Assert
				expect(result).toBeDefined();
				expect(result.length).toBe(1);

				// Verify update
				const updatedRecord = await findTotpTempRecordByIdentifier(
					testRecord.identifier,
				);
				expect(updatedRecord?.attempts).toBe(3);
				expect(updatedRecord?.verifiedAt).toBeDefined();
				expect(updatedRecord?.userInfo?.username).toBe("updated_username");
				expect(updatedRecord?.userInfo?.email).toBe("updated@example.com");
			});
		});
	});

	describe("Authentications", () => {
		let testUserId: string;

		beforeEach(async () => {
			const testUser = generateTestUser();
			const createdUser = await createUser(testUser);
			testUserId = createdUser[0]!.id;
		});

		describe("createAuthentication", () => {
			it("Should create authentication with all fields", async () => {
				// Arrange
				const testAuth = generateAuthentication(testUserId);

				// Act
				const result = await createAuthentication(testAuth);

				// Assert
				expect(result).toBeDefined();
				expect(result.length).toBe(1);
			});

			it("Should create authentication with minimal fields", async () => {
				// Arrange
				const minimalAuth = {
					userId: testUserId,
					method: AuthMethod.USERNAME_PASSWORD,
					identifier: faker.internet.email().slice(0, 255),
					credential: faker.string.alphanumeric(64),
				};

				// Act
				const result = await createAuthentication(minimalAuth);

				// Assert
				expect(result).toBeDefined();
				expect(result.length).toBe(1);
			});
		});

		describe("findAuthenticationById", () => {
			it("Should find authentication by ID", async () => {
				// Arrange
				const testAuth = generateAuthentication(testUserId);
				const createResult = await createAuthentication(testAuth);
				const authId = createResult[0]!.id;
				expect(authId).toBeDefined();

				// Act
				const foundAuth = await findAuthenticationById(authId!);

				// Assert
				expect(foundAuth).toBeDefined();
				expect(foundAuth?.id).toBe(authId);
				expect(foundAuth?.userId).toBe(testUserId);
				expect(foundAuth?.method).toBe(testAuth.method);
				expect(foundAuth?.identifier).toBe(testAuth.identifier);
			});

			it("Should return null when authentication does not exist", async () => {
				// Arrange
				const nonExistentId = faker.string.uuid();

				// Act
				const foundAuth = await findAuthenticationById(nonExistentId);

				// Assert
				expect(foundAuth).toBeNull();
			});
		});

		describe("updateAuthentication", () => {
			it("Should update authentication", async () => {
				// Arrange
				const testAuth = generateAuthentication(testUserId);
				const createResult = await createAuthentication(testAuth);
				const authId = createResult[0]!.id;
				expect(authId).toBeDefined();

				const updateData = {
					isEnabled: false,
					attempts: 3,
					lockedUntil: faker.date.future(),
					metadata: {
						lastFailedLogin: new Date().toISOString(),
						reason: "too_many_attempts",
					},
				};

				// Act
				const result = await updateAuthentication(authId!, updateData);

				// Assert
				expect(result).toBeDefined();
				expect(result.length).toBe(1);

				// Verify update
				const updatedAuth = await findAuthenticationById(authId!);
				expect(updatedAuth?.isEnabled).toBe(false);
				expect(updatedAuth?.attempts).toBe(3);
				expect(updatedAuth?.lockedUntil).toBeDefined();
			});
		});
	});

	describe("Token Records", () => {
		let testUserId: string;
		let testAuthId: string;

		beforeEach(async () => {
			const testUser = generateTestUser();
			const createdUser = await createUser(testUser);
			testUserId = createdUser[0]!.id;

			const testAuth = generateAuthentication(testUserId);
			const createdAuth = await createAuthentication(testAuth);
			testAuthId = createdAuth[0]!.id;
		});

		describe("createTokenRecord", () => {
			it("Should create token record with all fields", async () => {
				// Arrange
				const testToken = generateTokenRecord(testUserId, testAuthId);

				// Act
				const result = await createTokenRecord(testToken);

				// Assert
				expect(result).toBeDefined();
				expect(result.length).toBe(1);
			});

			it("Should create token record with minimal fields", async () => {
				// Arrange
				const minimalToken = {
					userId: testUserId,
					authId: testAuthId,
					authMethod: AuthMethod.USERNAME_PASSWORD,
					refreshToken: faker.string.alphanumeric(128),
					expiresAt: faker.date.future(),
					refreshTokenExpiresAt: faker.date.future(),
				};

				// Act
				const result = await createTokenRecord(minimalToken);

				// Assert
				expect(result).toBeDefined();
				expect(result.length).toBe(1);
			});
		});

		describe("findTokenRecordByRefreshToken", () => {
			it("Should find token record by refresh token", async () => {
				// Arrange
				const testToken = generateTokenRecord(testUserId, testAuthId);
				await createTokenRecord(testToken);

				// Act
				const foundToken = await findTokenRecordByRefreshToken(
					testToken.refreshToken,
				);

				// Assert
				expect(foundToken).toBeDefined();
				expect(foundToken?.refreshToken).toBe(testToken.refreshToken);
				expect(foundToken?.userId).toBe(testUserId);
				expect(foundToken?.authId).toBe(testAuthId);
				expect(foundToken?.authMethod).toBe(testToken.authMethod);
				expect(foundToken?.location).toEqual(testToken.location);
			});

			it("Should return null when token does not exist", async () => {
				// Arrange
				const nonExistentToken = faker.string.alphanumeric(128);

				// Act
				const foundToken =
					await findTokenRecordByRefreshToken(nonExistentToken);

				// Assert
				expect(foundToken).toBeNull();
			});
		});

		describe("findTokenRecordById", () => {
			it("Should find token record by ID", async () => {
				// Arrange
				const testToken = generateTokenRecord(testUserId, testAuthId);
				const createResult = await createTokenRecord(testToken);
				const tokenId = createResult[0]!.id;
				expect(tokenId).toBeDefined();

				// Act
				const foundToken = await findTokenRecordById(tokenId!);

				// Assert
				expect(foundToken).toBeDefined();
				expect(foundToken?.id).toBe(tokenId);
				expect(foundToken?.refreshToken).toBe(testToken.refreshToken);
			});

			it("Should return null when token does not exist", async () => {
				// Arrange
				const nonExistentId = faker.string.uuid();

				// Act
				const foundToken = await findTokenRecordById(nonExistentId);

				// Assert
				expect(foundToken).toBeNull();
			});
		});

		describe("updateTokenRecord", () => {
			it("Should update token record", async () => {
				// Arrange
				const testToken = generateTokenRecord(testUserId, testAuthId);
				const createResult = await createTokenRecord(testToken);
				const tokenId = createResult[0]!.id;
				expect(tokenId).toBeDefined();

				const updateData = {
					isRevoked: true,
					isExpired: true,
					revokedAt: new Date(),
					lastUsedAt: new Date(),
				};

				// Act
				const result = await updateTokenRecord(tokenId!, updateData);

				// Assert
				expect(result).toBeDefined();
				expect(result.length).toBe(1);

				// Verify update
				const updatedToken = await findTokenRecordById(tokenId!);
				expect(updatedToken?.isRevoked).toBe(true);
				expect(updatedToken?.isExpired).toBe(true);
				expect(updatedToken?.revokedAt).toBeDefined();
				expect(updatedToken?.lastUsedAt).toBeDefined();
			});
		});
	});

	describe("Auth History", () => {
		let testUserId: string;
		let testAuthId: string;

		beforeEach(async () => {
			const testUser = generateTestUser();
			const createdUser = await createUser(testUser);
			testUserId = createdUser[0]!.id;

			const testAuth = generateAuthentication(testUserId);
			const createdAuth = await createAuthentication(testAuth);
			testAuthId = createdAuth[0]!.id;
		});

		describe("createAuthHistory", () => {
			it("Should create auth history with all fields", async () => {
				// Arrange
				const testHistory = generateAuthHistory(testUserId, testAuthId);

				// Act
				const result = await createAuthHistory(testHistory);

				// Assert
				expect(result).toBeDefined();
				expect(result.rowCount).toBe(1);
			});

			it("Should create auth history with minimal fields", async () => {
				// Arrange
				const minimalHistory = {
					userId: testUserId,
					authId: testAuthId,
					method: AuthMethod.USERNAME_PASSWORD,
					identifier: faker.internet.email().slice(0, 255),
					success: true,
				};

				// Act
				const result = await createAuthHistory(minimalHistory);

				// Assert
				expect(result).toBeDefined();
				expect(result.rowCount).toBe(1);
			});

			it("Should create failed auth history", async () => {
				// Arrange
				const failedHistory = {
					userId: testUserId,
					authId: testAuthId,
					method: AuthMethod.USERNAME_PASSWORD,
					identifier: faker.internet.email().slice(0, 255),
					success: false,
					failureReason: "invalid_credentials",
					userAgent: faker.internet.userAgent().slice(0, 500),
					ipAddress: faker.internet.ip(),
					location: generateLocationInfo(),
				};

				// Act
				const result = await createAuthHistory(failedHistory);

				// Assert
				expect(result).toBeDefined();
				expect(result.rowCount).toBe(1);
			});
		});
	});

	describe("Data Integrity Tests", () => {
		let testUserId: string;

		beforeEach(async () => {
			const testUser = generateTestUser();
			const createdUser = await createUser(testUser);
			testUserId = createdUser[0]!.id;
		});

		it("Should maintain unique constraint on TOTP temp record tempUserId", async () => {
			// Arrange
			const tempUserId = faker.string.uuid();
			const record1 = { ...generateTotpTempRecord(), tempUserId };
			const record2 = { ...generateTotpTempRecord(), tempUserId };

			// Act & Assert
			await createTotpTempRecord(record1);
			await expect(createTotpTempRecord(record2)).rejects.toThrow();
		});

		it("Should maintain unique constraint on authentication method+identifier", async () => {
			// Arrange
			const identifier = faker.internet.email().slice(0, 255);
			const method = AuthMethod.EMAIL_TOTP;
			const auth1 = {
				...generateAuthentication(testUserId),
				method,
				identifier,
			};
			const auth2 = {
				...generateAuthentication(testUserId),
				method,
				identifier,
			};

			// Act & Assert
			await createAuthentication(auth1);
			await expect(createAuthentication(auth2)).rejects.toThrow();
		});

		it("Should maintain unique constraint on token refresh token", async () => {
			// Arrange
			const testAuth = generateAuthentication(testUserId);
			const createdAuth = await createAuthentication(testAuth);
			const testAuthId = createdAuth[0]!.id;

			const refreshToken = faker.string.alphanumeric(128);
			const token1 = {
				...generateTokenRecord(testUserId, testAuthId),
				refreshToken,
			};
			const token2 = {
				...generateTokenRecord(testUserId, testAuthId),
				refreshToken,
			};

			// Act & Assert
			await createTokenRecord(token1);
			await expect(createTokenRecord(token2)).rejects.toThrow();
		});

		it("Should handle JSON fields correctly", async () => {
			// Arrange
			const complexLocation: LocationInfo = {
				country: "China",
				region: "Shanghai",
				city: "Shanghai",
				address: "Nanjing Road 123",
				latitude: 31.2304,
				longitude: 121.4737,
			};

			const complexUserInfo = {
				username: "test_user",
				firstName: "Test",
				lastName: "User",
				email: "test@example.com",
				preferences: {
					language: "zh-CN",
					timezone: "Asia/Shanghai",
					notifications: {
						email: true,
						sms: false,
					},
				},
			};

			const totpRecord = {
				...generateTotpTempRecord(),
				userInfo: complexUserInfo,
			};

			// Act
			const totpResult = await createTotpTempRecord(totpRecord);
			const foundRecord = await findTotpTempRecordByIdentifier(
				totpRecord.identifier,
			);

			// Assert
			expect(totpResult.length).toBe(1);
			expect(foundRecord?.userInfo).toEqual(complexUserInfo);

			// Test token record with location
			const testAuth = generateAuthentication(testUserId);
			const createdAuth = await createAuthentication(testAuth);
			const testAuthId = createdAuth[0]!.id;

			const tokenRecord = {
				...generateTokenRecord(testUserId, testAuthId),
				location: complexLocation,
			};

			const tokenResult = await createTokenRecord(tokenRecord);
			const foundToken = await findTokenRecordByRefreshToken(
				tokenRecord.refreshToken,
			);

			expect(tokenResult.length).toBe(1);
			expect(foundToken?.location).toEqual(complexLocation);
		});
	});

	describe("Edge Cases", () => {
		let testUserId: string;

		beforeEach(async () => {
			const testUser = generateTestUser();
			const createdUser = await createUser(testUser);
			testUserId = createdUser[0]!.id;
		});

		it("Should handle null values correctly", async () => {
			// Arrange
			const recordWithNulls = {
				tempUserId: faker.string.uuid(),
				method: AuthMethod.EMAIL_TOTP,
				identifier: faker.internet.email().slice(0, 255),
				credential: faker.string.alphanumeric(32),
				expiresAt: faker.date.future(),
				verifiedAt: null,
				userInfo: null,
			};

			// Act
			const result = await createTotpTempRecord(recordWithNulls);
			const found = await findTotpTempRecordByIdentifier(
				recordWithNulls.identifier,
			);

			// Assert
			expect(result.length).toBe(1);
			expect(found?.attempts).toBe(0); // 默认值
			expect(found?.verifiedAt).toBeNull();
			expect(found?.userInfo).toBeNull();
		});

		it("Should handle maximum length fields", async () => {
			// Arrange
			const longIdentifier = "a".repeat(255);
			const longUserAgent = "a".repeat(500);
			const longDeviceName = "a".repeat(255);

			const authRecord = {
				userId: testUserId,
				method: AuthMethod.USERNAME_PASSWORD,
				identifier: longIdentifier,
				credential: faker.string.alphanumeric(64),
			};

			const authResult = await createAuthentication(authRecord);
			const testAuthId = authResult[0]!.id;

			const tokenRecord = {
				...generateTokenRecord(testUserId, testAuthId),
				userAgent: longUserAgent,
				deviceName: longDeviceName,
			};

			// Act
			const result = await createTokenRecord(tokenRecord);
			const found = await findTokenRecordByRefreshToken(
				tokenRecord.refreshToken,
			);

			// Assert
			expect(result.length).toBe(1);
			expect(found?.userAgent).toBe(longUserAgent);
			expect(found?.deviceName).toBe(longDeviceName);
		});
	});
});
