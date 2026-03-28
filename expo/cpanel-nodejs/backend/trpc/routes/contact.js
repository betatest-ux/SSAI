import { createTRPCRouter, publicProcedure, protectedProcedure } from "../create-context.js";
import { createContactRequest, getAllContactRequests, getContactRequest, updateContactRequest, deleteContactRequest } from "../../db/contacts.js";
import { sendEmail, getMailConfig, updateMailConfig, testMailConnection } from "../../utils/mailer.js";
import { getUserData } from "../../db/users.js";
import { z } from "zod";

export const contactRouter = createTRPCRouter({
  submit: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
      subject: z.string().min(1),
      message: z.string().min(10),
    }))
    .mutation(async ({ input, ctx }) => {
      const request = await createContactRequest({
        ...input,
        userId: ctx.userId || undefined,
      });

      return { success: true, requestId: request.id };
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const user = await getUserData(ctx.userId);
    if (!user?.isAdmin) {
      throw new Error("Unauthorized");
    }

    return await getAllContactRequests();
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await getUserData(ctx.userId);
      if (!user?.isAdmin) {
        throw new Error("Unauthorized");
      }

      const request = await getContactRequest(input.id);
      if (!request) {
        throw new Error("Contact request not found");
      }

      return request;
    }),

  updateStatus: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(['pending', 'in-progress', 'resolved']),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await getUserData(ctx.userId);
      if (!user?.isAdmin) {
        throw new Error("Unauthorized");
      }

      await updateContactRequest(input.id, { status: input.status });
      return { success: true };
    }),

  reply: protectedProcedure
    .input(z.object({
      id: z.string(),
      reply: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await getUserData(ctx.userId);
      if (!user?.isAdmin) {
        throw new Error("Unauthorized");
      }

      const request = await getContactRequest(input.id);
      if (!request) {
        throw new Error("Contact request not found");
      }

      try {
        await sendEmail(
          request.email,
          `Re: ${request.subject}`,
          `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #3B82F6;">Response to Your Inquiry</h2>
              <p>Dear ${request.name},</p>
              <p>Thank you for contacting SocialStoryAI. Here is our response to your inquiry:</p>
              <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; white-space: pre-wrap;">${input.reply}</p>
              </div>
              <p>If you have any further questions, please don't hesitate to reach out.</p>
              <p style="margin-top: 30px;">Best regards,<br/>The SocialStoryAI Team</p>
            </div>
          `
        );

        await updateContactRequest(input.id, {
          adminReply: input.reply,
          repliedAt: new Date().toISOString(),
          status: 'resolved',
        });

        return { success: true };
      } catch (error) {
        throw new Error(`Failed to send email: ${error.message}`);
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await getUserData(ctx.userId);
      if (!user?.isAdmin) {
        throw new Error("Unauthorized");
      }

      await deleteContactRequest(input.id);
      return { success: true };
    }),

  getMailConfig: protectedProcedure.query(async ({ ctx }) => {
    const user = await getUserData(ctx.userId);
    if (!user?.isAdmin) {
      throw new Error("Unauthorized");
    }

    const config = getMailConfig();
    return {
      ...config,
      password: config.password ? '********' : '',
    };
  }),

  updateMailConfig: protectedProcedure
    .input(z.object({
      host: z.string().optional(),
      port: z.number().optional(),
      secure: z.boolean().optional(),
      user: z.string().optional(),
      password: z.string().optional(),
      fromEmail: z.string().email().optional(),
      fromName: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await getUserData(ctx.userId);
      if (!user?.isAdmin) {
        throw new Error("Unauthorized");
      }

      updateMailConfig(input);
      return { success: true };
    }),

  testMailConnection: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await getUserData(ctx.userId);
    if (!user?.isAdmin) {
      throw new Error("Unauthorized");
    }

    const isConnected = await testMailConnection();
    return { success: isConnected };
  }),
});
