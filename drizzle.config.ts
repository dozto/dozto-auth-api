import { defineConfig } from "drizzle-kit";

if (!process.env.POSTGRESQL_CONNECTION_STRING) {
	throw new Error("POSTGRESQL_CONNECTION_STRING is not set");
}

console.log(process.env.POSTGRESQL_CONNECTION_STRING);

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/domains/**/*.entity.ts",
	out: "./drizzle",
	dbCredentials: {
		// biome-ignore lint/style/noNonNullAssertion: <TODO: Config File For Drizzle>
		url: process.env.POSTGRESQL_CONNECTION_STRING!,
	},
});
