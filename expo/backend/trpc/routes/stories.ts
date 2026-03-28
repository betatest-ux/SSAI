import * as z from "zod";
import { createTRPCRouter, protectedProcedure } from "@/backend/trpc/create-context";
import { 
  createStory, 
  getStory, 
  getUserStories, 
  updateStory,
  deleteStory
} from "@/backend/db/stories";
import { getUserData, updateUser } from "@/backend/db/users";

export const storiesRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ 
      childName: z.string(),
      situation: z.string(),
      complexity: z.enum(["very-simple", "simple", "moderate"]),
      tone: z.enum(["friendly", "calm", "encouraging", "straightforward"]),
      imageStyle: z.enum(["cartoon", "realistic", "minimal", "illustrated"]),
      content: z.string(),
      images: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await getUserData(ctx.userId);
      if (!user) {
        throw new Error("User not found");
      }

      if (!user.isPremium && user.storiesGenerated >= 3) {
        throw new Error("Free limit reached. Please upgrade to premium.");
      }

      const story = await createStory({
        userId: ctx.userId,
        childName: input.childName,
        situation: input.situation,
        complexity: input.complexity,
        tone: input.tone,
        imageStyle: input.imageStyle,
        content: input.content,
        images: input.images,
      });

      await updateUser(ctx.userId, { 
        storiesGenerated: user.storiesGenerated + 1 
      });

      return story;
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const story = await getStory(input.id);
      if (!story || story.userId !== ctx.userId) {
        throw new Error("Story not found");
      }
      return story;
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return await getUserStories(ctx.userId);
  }),

  update: protectedProcedure
    .input(z.object({ 
      id: z.string(),
      content: z.string().optional(),
      images: z.array(z.string()).optional(),
      videoUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const story = await getStory(input.id);
      if (!story || story.userId !== ctx.userId) {
        throw new Error("Story not found");
      }

      await updateStory(input.id, {
        content: input.content,
        images: input.images,
        videoUrl: input.videoUrl,
      });

      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const story = await getStory(input.id);
      if (!story || story.userId !== ctx.userId) {
        throw new Error("Story not found");
      }

      await deleteStory(input.id);
      return { success: true };
    }),

  generateVideo: protectedProcedure
    .input(z.object({ storyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await getUserData(ctx.userId);
      if (!user?.isPremium) {
        throw new Error("Video generation is only available for premium users");
      }
      
      const story = await getStory(input.storyId);
      if (!story) {
        throw new Error("Story not found");
      }
      
      if (story.userId !== ctx.userId) {
        throw new Error("Unauthorized");
      }

      const videoUrl = `https://storage.socialstoryai.com/videos/${input.storyId}.mp4`;
      await updateStory(input.storyId, { videoUrl });
      
      console.log(`Video generation initiated for story ${input.storyId}`);
      
      return { videoUrl };
    }),
});
