import { expect, test } from "bun:test";

import { envSchema } from "./schema.ts";

const base = {
	SUPABASE_URL: "https://example.supabase.co",
	SUPABASE_ANON_KEY: "anon",
};

test("NODE_ENV defaults to development when unset", () => {
	expect(envSchema.parse({ ...base }).NODE_ENV).toBe("development");
});

test("LOG_LEVEL defaults to info when unset", () => {
	expect(envSchema.parse({ ...base }).LOG_LEVEL).toBe("info");
});

test("AUTH_PASSWORD_ENABLED defaults to false when unset", () => {
	const r = envSchema.parse({ ...base });
	expect(r.AUTH_PASSWORD_ENABLED).toBe(false);
});

test('AUTH_PASSWORD_ENABLED is true only when value is "true"', () => {
	expect(
		envSchema.parse({ ...base, AUTH_PASSWORD_ENABLED: "true" })
			.AUTH_PASSWORD_ENABLED,
	).toBe(true);
	expect(
		envSchema.parse({ ...base, AUTH_PASSWORD_ENABLED: " true " })
			.AUTH_PASSWORD_ENABLED,
	).toBe(true);
	expect(
		envSchema.parse({ ...base, AUTH_PASSWORD_ENABLED: "false" })
			.AUTH_PASSWORD_ENABLED,
	).toBe(false);
	expect(
		envSchema.parse({ ...base, AUTH_PASSWORD_ENABLED: "1" })
			.AUTH_PASSWORD_ENABLED,
	).toBe(false);
});

test("PORT defaults to 3000", () => {
	const r = envSchema.parse({ ...base });
	expect(r.PORT).toBe(3000);
});

test("PORT coerces string", () => {
	const r = envSchema.parse({ ...base, PORT: "8080" });
	expect(r.PORT).toBe(8080);
});

test("SERVICE_NAME defaults to dozto-auth-api when unset", () => {
	const r = envSchema.parse({ ...base });
	expect(r.SERVICE_NAME).toBe("dozto-auth-api");
});

test("SERVICE_NAME uses trimmed value when set", () => {
	expect(
		envSchema.parse({ ...base, SERVICE_NAME: "my-service" }).SERVICE_NAME,
	).toBe("my-service");
	expect(
		envSchema.parse({ ...base, SERVICE_NAME: "  other  " }).SERVICE_NAME,
	).toBe("other");
});

test("SERVICE_NAME falls back when blank", () => {
	expect(envSchema.parse({ ...base, SERVICE_NAME: "" }).SERVICE_NAME).toBe(
		"dozto-auth-api",
	);
	expect(envSchema.parse({ ...base, SERVICE_NAME: "   " }).SERVICE_NAME).toBe(
		"dozto-auth-api",
	);
});
