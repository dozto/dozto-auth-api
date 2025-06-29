export enum UserActions {
	USER_CREATED = "user.created",
	USER_UPDATED = "user.updated",
	USER_DELETED = "user.deleted",
	USER_LOGGED_IN = "user.logged_in",
	USER_LOGGED_OUT = "user.logged_out",
}

export enum UserExceptions {
	USER_NOT_FOUND = "user.not_found",
	USER_ALREADY_EXISTS = "user.already_exists",
	USER_INVALID_CREDENTIALS = "user.invalid_credentials",
	USER_INVALID_VERIFICATION_CODE = "user.invalid_verification_code",
	USER_INVALID_VERIFICATION_CODE_EXPIRED = "user.invalid_verification_code_expired",
	USER_INVALID_VERIFICATION_CODE_USED = "user.invalid_verification_code_used",
	USER_INVALID_VERIFICATION_CODE_NOT_FOUND = "user.invalid_verification_code_not_found",
}
