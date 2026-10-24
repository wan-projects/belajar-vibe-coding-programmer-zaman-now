import { Elysia } from "elysia";
import { userRoutes } from "./routes/users";

const PORT = Number(process.env.PORT) || 3000;

const app = new Elysia()
  .get("/", () => ({ message: "REST API is running 🚀" }))
  .use(userRoutes)
  .listen(PORT);

console.log(`🦊 Server running at http://localhost:${PORT}`);

export type App = typeof app;
