/**
 * Email Templates (Chinese)
 * Templates for Supabase Send Email Hook
 */

export interface EmailTemplate {
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

/**
 * Chinese email templates
 */
export const emailTemplates: Record<EmailActionType, EmailTemplate> = {
	signup: {
		subject: "确认您的邮箱地址",
		html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>确认您的邮箱地址</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">欢迎注册！</h1>
              <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">您好，</p>
              <p style="margin: 0 0 24px 0; color: #666666; font-size: 16px; line-height: 1.5;">请点击下方按钮确认您的邮箱地址：</p>
              <table role="presentation" style="margin: 32px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="{{confirmation_url}}" style="display: inline-block; padding: 14px 32px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500;">确认邮箱地址</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">或者输入验证码：</p>
              <p style="margin: 0 0 24px 0; padding: 16px; background-color: #f8f9fa; border-radius: 6px; text-align: center; font-size: 28px; font-weight: 600; color: #007bff; letter-spacing: 4px;">{{token}}</p>
              <p style="margin: 0; color: #999999; font-size: 14px; line-height: 1.5;">此验证码 <strong>10 分钟内</strong>有效。如非本人操作，请忽略此邮件。</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; background-color: #f8f9fa; border-top: 1px solid #eeeeee; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #999999; font-size: 12px; text-align: center;">{{app_name}}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`,
		text: `欢迎注册！

您好，

请点击以下链接确认您的邮箱地址：
{{confirmation_url}}

或者输入验证码：{{token}}

此验证码 10 分钟内有效。如非本人操作，请忽略此邮件。

{{app_name}}
`,
	},
	recovery: {
		subject: "重置您的密码",
		html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>重置您的密码</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">重置密码</h1>
              <p style="margin: 0 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">您好，</p>
              <p style="margin: 0 0 24px 0; color: #666666; font-size: 16px; line-height: 1.5;">我们收到了您的密码重置请求。点击下方按钮重置密码：</p>
              <table role="presentation" style="margin: 32px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="{{confirmation_url}}" style="display: inline-block; padding: 14px 32px; background-color: #dc3545; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500;">重置密码</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 16px 0; color: #666666; font-size: 16px; line-height: 1.5;">或者输入验证码：</p>
              <p style="margin: 0 0 24px 0; padding: 16px; background-color: #f8f9fa; border-radius: 6px; text-align: center; font-size: 28px; font-weight: 600; color: #dc3545; letter-spacing: 4px;">{{token}}</p>
              <p style="margin: 0; color: #999999; font-size: 14px; line-height: 1.5;">此验证码 <strong>10 分钟内</strong>有效。如非本人操作，请忽略此邮件。</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; background-color: #f8f9fa; border-top: 1px solid #eeeeee; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #999999; font-size: 12px; text-align: center;">{{app_name}}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`,
		text: `重置密码

您好，

我们收到了您的密码重置请求。请点击以下链接重置密码：
{{confirmation_url}}

或者输入验证码：{{token}}

此验证码 10 分钟内有效。如非本人操作，请忽略此邮件。

{{app_name}}
`,
	},
	magiclink: {
		subject: "您的魔法链接",
		html: "", // Not used in current scope
		text: "",
	},
	invite: {
		subject: "您被邀请加入",
		html: "", // Not used in current scope
		text: "",
	},
	email_change: {
		subject: "确认邮箱地址变更",
		html: "", // Not used in current scope
		text: "",
	},
	email_change_new: {
		subject: "确认新邮箱地址",
		html: "", // Not used in current scope
		text: "",
	},
	reauthentication: {
		subject: "确认重新认证",
		html: "", // Not used in current scope
		text: "",
	},
};

/**
 * Render email template with variables
 */
export const renderTemplate = (
	template: EmailTemplate,
	variables: Record<string, string>,
): EmailTemplate => {
	let html = template.html;
	let text = template.text;
	let subject = template.subject;

	for (const [key, value] of Object.entries(variables)) {
		const placeholder = `{{${key}}}`;
		html = html.replaceAll(placeholder, value);
		text = text.replaceAll(placeholder, value);
		subject = subject.replaceAll(placeholder, value);
	}

	return { subject, html, text };
};

/**
 * Get app name from env or use default
 */
export const getAppName = (): string => {
	const env = getEnv();
	return env.SERVICE_NAME || "DOZTO Auth";
};

import { getEnv } from "../../lib/env/index.ts";
