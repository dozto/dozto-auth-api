import { describe, expect, it } from "bun:test";

import {
	emailPasswordSchema,
	emailVerificationSchema,
	passwordCredentialBodySchema,
	passwordRule,
	phoneOtpVerificationSchema,
	phonePasswordSchema,
	phoneRule,
} from "./auth.schemas.ts";

describe("phoneRule", () => {
	it("accepts phone length 5–20", () => {
		expect(phoneRule.parse("12345")).toBe("12345");
		expect(phoneRule.parse("+8613800138000")).toBe("+8613800138000");
		expect(phoneRule.parse("1".repeat(20))).toBe("1".repeat(20));
	});

	it("rejects phone shorter than 5 or longer than 20", () => {
		expect(() => phoneRule.parse("1234")).toThrow();
		expect(() => phoneRule.parse("1".repeat(21))).toThrow();
	});
});

describe("passwordRule", () => {
	it("accepts password with 8-72 characters", () => {
		expect(() => passwordRule.parse("password123")).not.toThrow();
		expect(() => passwordRule.parse("a".repeat(8))).not.toThrow();
		expect(() => passwordRule.parse("a".repeat(72))).not.toThrow();
	});

	it("rejects password shorter than 8 characters", () => {
		expect(() => passwordRule.parse("short1")).toThrow();
		expect(() => passwordRule.parse("a".repeat(7))).toThrow();
	});

	it("rejects password longer than 72 characters", () => {
		expect(() => passwordRule.parse("a".repeat(73))).toThrow();
	});
});

describe("emailPasswordSchema", () => {
	it("accepts valid email and password", () => {
		const result = emailPasswordSchema.parse({
			email: "user@example.com",
			password: "securePassword123",
		});
		expect(result.email).toBe("user@example.com");
		expect(result.password).toBe("securePassword123");
	});

	it("rejects invalid email", () => {
		expect(() =>
			emailPasswordSchema.parse({
				email: "not-an-email",
				password: "password123",
			}),
		).toThrow();
	});

	it("rejects missing email", () => {
		expect(() =>
			emailPasswordSchema.parse({
				password: "password123",
			}),
		).toThrow();
	});

	it("rejects missing password", () => {
		expect(() =>
			emailPasswordSchema.parse({
				email: "user@example.com",
			}),
		).toThrow();
	});

	it("rejects short password", () => {
		expect(() =>
			emailPasswordSchema.parse({
				email: "user@example.com",
				password: "short",
			}),
		).toThrow();
	});
});

describe("phonePasswordSchema", () => {
	it("accepts valid phone and password", () => {
		const result = phonePasswordSchema.parse({
			phone: "+8613800138000",
			password: "securePassword123",
		});
		expect(result.phone).toBe("+8613800138000");
		expect(result.password).toBe("securePassword123");
	});

	it("accepts phone number without country code", () => {
		const result = phonePasswordSchema.parse({
			phone: "13800138000",
			password: "password123",
		});
		expect(result.phone).toBe("13800138000");
	});

	it("rejects missing phone", () => {
		expect(() =>
			phonePasswordSchema.parse({
				password: "password123",
			}),
		).toThrow();
	});

	it("rejects missing password", () => {
		expect(() =>
			phonePasswordSchema.parse({
				phone: "13800138000",
			}),
		).toThrow();
	});

	it("rejects phone shorter than 5 characters", () => {
		expect(() =>
			phonePasswordSchema.parse({
				phone: "1234",
				password: "password123",
			}),
		).toThrow();
	});

	it("rejects phone longer than 20 characters", () => {
		expect(() =>
			phonePasswordSchema.parse({
				phone: "1".repeat(21),
				password: "password123",
			}),
		).toThrow();
	});

	it("rejects short password", () => {
		expect(() =>
			phonePasswordSchema.parse({
				phone: "13800138000",
				password: "short",
			}),
		).toThrow();
	});
});

describe("phoneOtpVerificationSchema", () => {
	it("accepts phone + token and defaults type to sms", () => {
		const result = phoneOtpVerificationSchema.parse({
			phone: "+8613800138000",
			token: "123456",
		});
		expect(result.phone).toBe("+8613800138000");
		expect(result.token).toBe("123456");
		expect(result.type).toBe("sms");
	});

	it("accepts explicit type phone_change", () => {
		const result = phoneOtpVerificationSchema.parse({
			phone: "+8613800138000",
			token: "123456",
			type: "phone_change",
		});
		expect(result.type).toBe("phone_change");
	});

	it("rejects token with non-digits", () => {
		expect(() =>
			phoneOtpVerificationSchema.parse({
				phone: "+8613800138000",
				token: "12ab56",
			}),
		).toThrow();
	});

	it("rejects token shorter than 4 digits", () => {
		expect(() =>
			phoneOtpVerificationSchema.parse({
				phone: "+8613800138000",
				token: "123",
			}),
		).toThrow();
	});

	it("rejects missing token", () => {
		expect(() =>
			phoneOtpVerificationSchema.parse({
				phone: "+8613800138000",
			}),
		).toThrow();
	});
});

describe("passwordCredentialBodySchema", () => {
	it("accepts email + password", () => {
		const result = passwordCredentialBodySchema.parse({
			email: "user@example.com",
			password: "securePassword123",
		});
		expect("email" in result).toBe(true);
	});

	it("accepts phone + password", () => {
		const result = passwordCredentialBodySchema.parse({
			phone: "+8613800138000",
			password: "securePassword123",
		});
		expect("phone" in result).toBe(true);
	});

	it("rejects body with both email and phone", () => {
		expect(() =>
			passwordCredentialBodySchema.parse({
				email: "user@example.com",
				phone: "+8613800138000",
				password: "securePassword123",
			}),
		).toThrow();
	});
});

describe("emailVerificationSchema", () => {
	it("accepts token, type, and optional redirect_to", () => {
		const result = emailVerificationSchema.parse({
			token: "abc123",
			type: "signup",
			redirect_to: "https://app.example.com/callback",
		});
		expect(result.token).toBe("abc123");
		expect(result.type).toBe("signup");
		expect(result.redirect_to).toBe("https://app.example.com/callback");
	});

	it("accepts token and type without redirect_to", () => {
		const result = emailVerificationSchema.parse({
			token: "hash",
			type: "signup",
		});
		expect(result.redirect_to).toBeUndefined();
	});

	it("rejects empty token", () => {
		expect(() =>
			emailVerificationSchema.parse({ token: "", type: "signup" }),
		).toThrow();
	});

	it("rejects missing type", () => {
		expect(() => emailVerificationSchema.parse({ token: "abc" })).toThrow();
	});
});
