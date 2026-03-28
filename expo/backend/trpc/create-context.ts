import { initTRPC } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import superjson from "superjson";
import { verifyToken } from "@/backend/utils/jwt";

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const authHeader = opts.req.headers.get("authorization");
  let userId: string | null = null;
  
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    const payload = verifyToken(token);
    if (payload) {
      userId = payload.userId;
    }
  }
  
  return {
    req: opts.req,
    userId,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new Error("Unauthorized");
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
    },
  });
});
