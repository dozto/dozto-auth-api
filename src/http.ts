import { Hono } from "hono";
import { authRoute } from "@/auth/auth.route";
import { userRoute } from "@/user/user.route";

const app = new Hono();
app.route("/users", userRoute);
app.route("/auth", authRoute);

export default app;
