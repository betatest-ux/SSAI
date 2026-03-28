import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../create-context.js";
import { getUserData, createUser, updateUser, verifyPassword, updatePassword } from "../../db/users.js";
import { checkRateLimit } from "../../middleware/rate-limit.js";
import { generateToken } from "../../utils/jwt.js";

export const authRouter = createTRPCRouter({
  login: publicProcedure
    .input(z.object({ 
      email: z.string().email(),
      password: z.string().min(6)
    }))
    .mutation(async ({ input }) => {
      if (!(await checkRateLimit(input.email, 'login'))) {
        throw new Error('Too many login attempts. Please try again later.');
      }
      
      const user = await getUserData(input.email);
      if (!user || !verifyPassword(input.password, user.password || '')) {
        throw new Error("Invalid credentials");
      }
      await updateUser(user.id, { lastLoginAt: new Date().toISOString() });
      
      const token = generateToken({
        userId: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      });
      
      return {
        userId: user.id,
        email: user.email,
        name: user.name,
        isPremium: user.isPremium,
        storiesGenerated: user.storiesGenerated,
        isAdmin: user.isAdmin,
        subscriptionEndDate: user.subscriptionEndDate,
        token,
      };
    }),

  register: publicProcedure
    .input(z.object({ 
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string().min(2)
    }))
    .mutation(async ({ input }) => {
      if (!(await checkRateLimit(input.email, 'register'))) {
        throw new Error('Too many registration attempts. Please try again later.');
      }
      
      const existingUser = await getUserData(input.email);
      if (existingUser) {
        throw new Error("User already exists");
      }
      
      const user = await createUser({
        email: input.email,
        password: input.password,
        name: input.name,
      });
      
      const token = generateToken({
        userId: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      });
      
      return {
        userId: user.id,
        email: user.email,
        name: user.name,
        isPremium: user.isPremium,
        storiesGenerated: user.storiesGenerated,
        isAdmin: user.isAdmin,
        subscriptionEndDate: user.subscriptionEndDate,
        token,
      };
    }),

  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().min(2).optional(),
      email: z.string().email().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (input.email) {
        const existingUser = await getUserData(input.email);
        if (existingUser && existingUser.id !== ctx.userId) {
          throw new Error("Email already in use");
        }
      }
      await updateUser(ctx.userId, input);
      const user = await getUserData(ctx.userId);
      if (!user) throw new Error("User not found");
      return {
        userId: user.id,
        email: user.email,
        name: user.name,
        isPremium: user.isPremium,
        storiesGenerated: user.storiesGenerated,
        isAdmin: user.isAdmin,
        subscriptionEndDate: user.subscriptionEndDate,
      };
    }),

  changePassword: protectedProcedure
    .input(z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(6),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await getUserData(ctx.userId);
      if (!user) throw new Error("User not found");
      if (!verifyPassword(input.currentPassword, user.password || '')) {
        throw new Error("Current password is incorrect");
      }
      await updatePassword(ctx.userId, input.newPassword);
      return { success: true };
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await getUserData(ctx.userId);
    if (!user) {
      throw new Error("User not found");
    }
    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      isPremium: user.isPremium,
      storiesGenerated: user.storiesGenerated,
      isAdmin: user.isAdmin,
      subscriptionEndDate: user.subscriptionEndDate,
    };
  }),

  upgrade: protectedProcedure.mutation(async ({ ctx }) => {
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
    await updateUser(ctx.userId, { 
      isPremium: true,
      subscriptionEndDate: subscriptionEndDate.toISOString(),
    });
    return { success: true };
  }),

  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    await updateUser(ctx.userId, { 
      isPremium: false,
      subscriptionEndDate: undefined,
    });
    return { success: true };
  }),
});
