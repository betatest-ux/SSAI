import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/backend/trpc/create-context";
import { 
  getAllPages, 
  getPage, 
  createPage, 
  updatePage, 
  deletePage,
  getPageContents,
  getPageContentsBySection,
  createPageContent,
  updatePageContent,
  deletePageContent,
  reorderPageContents,
  getThemeSettings,
  updateThemeSettings,
  getHeaderFooterContent,
  updateHeaderFooterContent,
  getAllHeaderFooterContents,
} from "@/backend/db/content";
import { getUserData } from "@/backend/db/users";
import { z } from "zod";

export const contentRouter = createTRPCRouter({
  getAllPages: publicProcedure.query(async () => {
    const pages = await getAllPages();
    return pages.filter(p => p.isPublished);
  }),

  getAllPagesAdmin: protectedProcedure.query(async ({ ctx }) => {
    const user = await getUserData(ctx.userId);
    if (!user?.isAdmin) {
      throw new Error("Unauthorized");
    }
    return await getAllPages();
  }),

  getPage: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const page = await getPage(input.slug);
      if (!page) {
        throw new Error("Page not found");
      }
      return page;
    }),

  getPageWithContent: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const page = await getPage(input.slug);
      if (!page) {
        throw new Error("Page not found");
      }
      const contents = await getPageContents(page.id);
      return { page, contents };
    }),

  createPage: protectedProcedure
    .input(z.object({
      slug: z.string(),
      title: z.string(),
      isPublished: z.boolean().optional(),
      showInMenu: z.boolean().optional(),
      menuOrder: z.number().optional(),
      showHeader: z.boolean().optional(),
      showFooter: z.boolean().optional(),
      metadata: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await getUserData(ctx.userId);
      if (!user?.isAdmin) {
        throw new Error("Unauthorized");
      }
      return await createPage({
        slug: input.slug,
        title: input.title,
        isPublished: input.isPublished ?? false,
        showInMenu: input.showInMenu ?? true,
        menuOrder: input.menuOrder ?? 0,
        showHeader: input.showHeader ?? true,
        showFooter: input.showFooter ?? true,
        metadata: input.metadata,
      });
    }),

  updatePage: protectedProcedure
    .input(z.object({
      pageId: z.string(),
      slug: z.string().optional(),
      title: z.string().optional(),
      isPublished: z.boolean().optional(),
      showInMenu: z.boolean().optional(),
      menuOrder: z.number().optional(),
      showHeader: z.boolean().optional(),
      showFooter: z.boolean().optional(),
      metadata: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await getUserData(ctx.userId);
      if (!user?.isAdmin) {
        throw new Error("Unauthorized");
      }
      const { pageId, ...updates } = input;
      await updatePage(pageId, updates);
      return { success: true };
    }),

  deletePage: protectedProcedure
    .input(z.object({ pageId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await getUserData(ctx.userId);
      if (!user?.isAdmin) {
        throw new Error("Unauthorized");
      }
      await deletePage(input.pageId);
      return { success: true };
    }),

  getPageContents: publicProcedure
    .input(z.object({ pageId: z.string() }))
    .query(async ({ input }) => {
      return await getPageContents(input.pageId);
    }),

  getPageContentsBySection: publicProcedure
    .input(z.object({ 
      pageId: z.string(),
      sectionId: z.string(),
    }))
    .query(async ({ input }) => {
      return await getPageContentsBySection(input.pageId, input.sectionId);
    }),

  createPageContent: protectedProcedure
    .input(z.object({
      pageId: z.string(),
      sectionId: z.string(),
      type: z.enum(['text', 'heading', 'html', 'image', 'button']),
      content: z.string(),
      order: z.number(),
      styles: z.record(z.string(), z.any()).optional(),
      metadata: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await getUserData(ctx.userId);
      if (!user?.isAdmin) {
        throw new Error("Unauthorized");
      }
      return await createPageContent(input);
    }),

  updatePageContent: protectedProcedure
    .input(z.object({
      contentId: z.string(),
      pageId: z.string().optional(),
      sectionId: z.string().optional(),
      type: z.enum(['text', 'heading', 'html', 'image', 'button']).optional(),
      content: z.string().optional(),
      order: z.number().optional(),
      styles: z.record(z.string(), z.any()).optional(),
      metadata: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await getUserData(ctx.userId);
      if (!user?.isAdmin) {
        throw new Error("Unauthorized");
      }
      const { contentId, ...updates } = input;
      await updatePageContent(contentId, updates);
      return { success: true };
    }),

  deletePageContent: protectedProcedure
    .input(z.object({ contentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await getUserData(ctx.userId);
      if (!user?.isAdmin) {
        throw new Error("Unauthorized");
      }
      await deletePageContent(input.contentId);
      return { success: true };
    }),

  reorderPageContents: protectedProcedure
    .input(z.object({
      pageId: z.string(),
      sectionId: z.string(),
      contentIds: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await getUserData(ctx.userId);
      if (!user?.isAdmin) {
        throw new Error("Unauthorized");
      }
      await reorderPageContents(input.pageId, input.sectionId, input.contentIds);
      return { success: true };
    }),

  getThemeSettings: publicProcedure.query(async () => {
    return await getThemeSettings();
  }),

  updateThemeSettings: protectedProcedure
    .input(z.object({
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
      accentColor: z.string().optional(),
      backgroundColor: z.string().optional(),
      textColor: z.string().optional(),
      headerBackgroundColor: z.string().optional(),
      headerTextColor: z.string().optional(),
      footerBackgroundColor: z.string().optional(),
      footerTextColor: z.string().optional(),
      buttonBackgroundColor: z.string().optional(),
      buttonTextColor: z.string().optional(),
      borderRadius: z.number().optional(),
      fontSize: z.number().optional(),
      fontFamily: z.string().optional(),
      headerHeight: z.number().optional(),
      footerHeight: z.number().optional(),
      customCSS: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await getUserData(ctx.userId);
      if (!user?.isAdmin) {
        throw new Error("Unauthorized");
      }
      return await updateThemeSettings(input);
    }),

  getHeaderFooterContent: publicProcedure
    .input(z.object({ type: z.enum(['header', 'footer']) }))
    .query(async ({ input }) => {
      return await getHeaderFooterContent(input.type);
    }),

  getAllHeaderFooterContents: publicProcedure.query(async () => {
    return await getAllHeaderFooterContents();
  }),

  updateHeaderFooterContent: protectedProcedure
    .input(z.object({
      type: z.enum(['header', 'footer']),
      content: z.string().optional(),
      logo: z.string().optional(),
      links: z.array(z.object({
        label: z.string(),
        url: z.string(),
        icon: z.string().optional(),
      })).optional(),
      showSearch: z.boolean().optional(),
      showUserMenu: z.boolean().optional(),
      customHTML: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await getUserData(ctx.userId);
      if (!user?.isAdmin) {
        throw new Error("Unauthorized");
      }
      const { type, ...updates } = input;
      await updateHeaderFooterContent(type, updates);
      return { success: true };
    }),
});
