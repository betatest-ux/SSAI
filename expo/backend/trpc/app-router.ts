import { createTRPCRouter } from "./create-context";
import { authRouter } from "./routes/auth";
import { storiesRouter } from "./routes/stories";
import { adminRouter } from "./routes/admin";
import { contactRouter } from "./routes/contact";
import { contentRouter } from "./routes/content";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  stories: storiesRouter,
  admin: adminRouter,
  contact: contactRouter,
  content: contentRouter,
});

export type AppRouter = typeof appRouter;
