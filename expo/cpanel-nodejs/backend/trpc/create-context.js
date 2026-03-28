import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { verifyToken } from "../utils/jwt.js";

export const createContext = async (opts) => {
  const authHeader = opts.req.headers.get("authorization");
  let userId = null;
  
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

const t = initTRPC.context().create({
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
