import "../../test/test-env.ts";
import { describe, expect, test } from "bun:test";

import { getAppName, renderEmailTemplate } from "./webhook.templates.ts";

describe("webhooks email templates", () => {
	test("renders signup template with Eta variables", async () => {
		const result = await renderEmailTemplate("signup", {
			confirmation_url: "https://example.com/confirm",
			token: "123456",
			app_name: "DOZTO",
		});

		expect(result?.subject).toBe("确认您的邮箱地址");
		expect(result?.html).toContain("https://example.com/confirm");
		expect(result?.html).toContain("123456");
		expect(result?.html).toContain("DOZTO");
		expect(result?.text).toContain("https://example.com/confirm");
		expect(result?.text).toContain("123456");
		expect(result?.text).toContain("DOZTO");
	});

	test("renders recovery template with Eta variables", async () => {
		const result = await renderEmailTemplate("recovery", {
			confirmation_url: "https://example.com/recovery",
			token: "654321",
			app_name: "DOZTO",
		});

		expect(result?.subject).toBe("重置您的密码");
		expect(result?.html).toContain("https://example.com/recovery");
		expect(result?.html).toContain("654321");
		expect(result?.text).toContain("https://example.com/recovery");
		expect(result?.text).toContain("654321");
	});

	test("returns null for action without configured template", async () => {
		const result = await renderEmailTemplate("magiclink", {
			confirmation_url: "https://example.com/magic",
			token: "000000",
			app_name: "DOZTO",
		});

		expect(result).toBeNull();
	});
});

describe("getAppName", () => {
	test("returns env service name when available", () => {
		expect(getAppName()).toBe("dozto-auth-api");
	});
});
