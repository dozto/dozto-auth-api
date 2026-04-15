import { join } from "node:path";
import { Eta } from "eta";

import { env } from "../lib/env/index.ts";

interface EmailTemplateDefinition {
	subject: string;
	htmlTemplateFile: string | null;
	textTemplateFile: string | null;
}

export interface RenderEmailTemplateInput {
	confirmation_url: string;
	token: string;
	app_name: string;
}

export interface RenderedEmailTemplate {
	subject: string;
	html: string;
	text: string;
}

export type EmailActionType =
	| "signup"
	| "recovery"
	| "magiclink"
	| "invite"
	| "email_change"
	| "email_change_new"
	| "reauthentication";

const eta = new Eta();

const EMAIL_TEMPLATE_DIR = join(process.cwd(), "src", "resources", "email");

const emailTemplateDefinitions: Record<
	EmailActionType,
	EmailTemplateDefinition
> = {
	signup: {
		subject: "确认您的邮箱地址",
		htmlTemplateFile: "signup-confirmation.html.eta",
		textTemplateFile: "signup-confirmation.text.eta",
	},
	recovery: {
		subject: "重置您的密码",
		htmlTemplateFile: "password-recovery.html.eta",
		textTemplateFile: "password-recovery.text.eta",
	},
	magiclink: {
		subject: "您的魔法链接",
		htmlTemplateFile: null,
		textTemplateFile: null,
	},
	invite: {
		subject: "您被邀请加入",
		htmlTemplateFile: null,
		textTemplateFile: null,
	},
	email_change: {
		subject: "确认邮箱地址变更",
		htmlTemplateFile: null,
		textTemplateFile: null,
	},
	email_change_new: {
		subject: "确认新邮箱地址",
		htmlTemplateFile: null,
		textTemplateFile: null,
	},
	reauthentication: {
		subject: "确认重新认证",
		htmlTemplateFile: null,
		textTemplateFile: null,
	},
};

const readTemplateFile = async (filename: string): Promise<string> =>
	Bun.file(join(EMAIL_TEMPLATE_DIR, filename)).text();

export const getAppName = (): string => env.SERVICE_NAME || "DOZTO Auth";

export const renderEmailTemplate = async (
	actionType: string,
	input: RenderEmailTemplateInput,
): Promise<RenderedEmailTemplate | null> => {
	const definition =
		emailTemplateDefinitions[
			actionType as keyof typeof emailTemplateDefinitions
		];
	if (!definition?.htmlTemplateFile || !definition?.textTemplateFile) {
		return null;
	}

	const [htmlTemplate, textTemplate] = await Promise.all([
		readTemplateFile(definition.htmlTemplateFile),
		readTemplateFile(definition.textTemplateFile),
	]);

	const html = eta.renderString(htmlTemplate, input);
	const text = eta.renderString(textTemplate, input);

	return {
		subject: definition.subject,
		html: html ?? "",
		text: text ?? "",
	};
};
