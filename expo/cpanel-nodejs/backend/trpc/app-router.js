import { createTRPCRouter } from "./create-context.js";
import { authRouter } from "./routes/auth.js";
import { storiesRouter } from "./routes/stories.js";
import { adminRouter } from "./routes/admin.js";
import { contactRouter } from "./routes/contact.js";
import { contentRouter } from "./routes/content.js";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  stories: storiesRouter,
  admin: adminRouter,
  contact: contactRouter,
  content: contentRouter,
});
