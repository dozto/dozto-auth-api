import { Hono } from "hono";
import { authRoute } from "@/domains/auth/auth.route";
import { userRoute } from "@/domains/user/user.route";

const app = new Hono();
app.route("/users", userRoute);
app.route("/auth", authRoute);

export default app;
