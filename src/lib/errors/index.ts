export type AppErrorPayload = {
	readonly message: string;
	readonly code: string;
	readonly statusCode: number;
};

/** 带 `payload` 的业务错误；用工厂而非 `class`，避免依赖 `this`。 */
export type AppError = Error & { readonly payload: AppErrorPayload };

export const createAppError = (payload: AppErrorPayload): AppError => {
	const err = new Error(payload.message);
	err.name = "AppError";
	return Object.assign(err, { payload }) as AppError;
};

export const isAppError = (error: unknown): error is AppError => {
	if (!(error instanceof Error) || !("payload" in error)) {
		return false;
	}
	const p = (error as { payload: unknown }).payload;
	if (typeof p !== "object" || p === null) {
		return false;
	}
	return (
		"code" in p &&
		"message" in p &&
		"statusCode" in p &&
		typeof (p as AppErrorPayload).code === "string" &&
		typeof (p as AppErrorPayload).statusCode === "number"
	);
};

export const toErrorResponse = (error: unknown): Response => {
	if (isAppError(error)) {
		return Response.json(
			{
				error: {
					code: error.payload.code,
					message: error.payload.message,
				},
			},
			{ status: error.payload.statusCode },
		);
	}

	const message =
		error instanceof Error ? error.message : "Unexpected internal error.";

	return Response.json(
		{
			error: {
				code: "INTERNAL_ERROR",
				message,
			},
		},
		{ status: 500 },
	);
};
