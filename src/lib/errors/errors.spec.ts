import { describe, expect, test } from "bun:test";

import { createAppError, isAppError, toErrorResponse } from "./index.ts";

describe("createAppError", () => {
	test("creates an AppError with correct payload", () => {
		const err = createAppError({
			message: "fail",
			code: "FAIL",
			statusCode: 422,
		});
		expect(err).toBeInstanceOf(Error);
		expect(err.name).toBe("AppError");
		expect(err.message).toBe("fail");
		expect(err.payload).toEqual({
			message: "fail",
			code: "FAIL",
			statusCode: 422,
		});
	});
});

describe("isAppError", () => {
	test("returns true for AppError", () => {
		const err = createAppError({ message: "m", code: "C", statusCode: 400 });
		expect(isAppError(err)).toBe(true);
	});

	test("returns false for plain Error", () => {
		expect(isAppError(new Error("x"))).toBe(false);
	});

	test("returns false for non-error", () => {
		expect(isAppError("text")).toBe(false);
		expect(isAppError(null)).toBe(false);
		expect(isAppError(undefined)).toBe(false);
	});
});

describe("toErrorResponse", () => {
	test("returns structured body for AppError", async () => {
		const err = createAppError({
			message: "not found",
			code: "NOT_FOUND",
			statusCode: 404,
		});
		const res = toErrorResponse(err);
		expect(res.status).toBe(404);
		const body = (await res.json()) as {
			error: { code: string; message: string };
		};
		expect(body.error.code).toBe("NOT_FOUND");
		expect(body.error.message).toBe("not found");
	});

	test("returns 500 for plain Error", async () => {
		const res = toErrorResponse(new Error("boom"));
		expect(res.status).toBe(500);
		const body = (await res.json()) as {
			error: { code: string; message: string };
		};
		expect(body.error.code).toBe("INTERNAL_ERROR");
		expect(body.error.message).toBe("boom");
	});

	test("returns 500 for non-error values", async () => {
		const res = toErrorResponse("random");
		expect(res.status).toBe(500);
		const body = (await res.json()) as { error: { code: string } };
		expect(body.error.code).toBe("INTERNAL_ERROR");
	});
});
