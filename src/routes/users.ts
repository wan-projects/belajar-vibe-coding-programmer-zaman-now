import { Elysia, t } from "elysia";
import { db } from "../db";
import { users } from "../schema/users";
import { eq } from "drizzle-orm";

export const userRoutes = new Elysia({ prefix: "/users" })
  // GET /users - list semua user
  .get("/", async () => {
    const result = await db.select().from(users);
    return { data: result };
  })

  // GET /users/:id - ambil user by id
  .get("/:id", async ({ params, status }) => {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(params.id)));

    if (result.length === 0) {
      return status(404, { message: "User not found" });
    }
    return { data: result[0] };
  })

  // POST /users - buat user baru
  .post(
    "/",
    async ({ body, status }) => {
      try {
        await db.insert(users).values(body);
        const inserted = await db
          .select()
          .from(users)
          .where(eq(users.email, body.email));
        return { message: "User created", data: inserted[0] };
      } catch (e: any) {
        if (e.code === "ER_DUP_ENTRY") {
          return status(409, { message: "Email already exists" });
        }
        throw e;
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        email: t.String({ format: "email" }),
      }),
    }
  )

  // PUT /users/:id - update user
  .put(
    "/:id",
    async ({ params, body, status }) => {
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.id, Number(params.id)));

      if (existing.length === 0) {
        return status(404, { message: "User not found" });
      }

      await db
        .update(users)
        .set(body)
        .where(eq(users.id, Number(params.id)));

      const updated = await db
        .select()
        .from(users)
        .where(eq(users.id, Number(params.id)));
      return { message: "User updated", data: updated[0] };
    },
    {
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1 })),
        email: t.Optional(t.String({ format: "email" })),
      }),
    }
  )

  // DELETE /users/:id - hapus user
  .delete("/:id", async ({ params, status }) => {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(params.id)));

    if (existing.length === 0) {
      return status(404, { message: "User not found" });
    }

    await db.delete(users).where(eq(users.id, Number(params.id)));
    return { message: "User deleted" };
  });
