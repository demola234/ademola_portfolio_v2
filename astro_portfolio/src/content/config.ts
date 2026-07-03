import { defineCollection, z } from 'astro:content';

// Kept for backward-compat while old /blogs pages exist (removed in Phase 4)
const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    short_description: z.string(),
    author: z.string(),
    publish_date: z.string().transform((str) => new Date(str)),
    reading_time: z.string().transform((str) => Number(str)),
    tags: z.array(z.string()),
    image_url: z.string().optional(),
    medium_blog_link: z.string().optional(),
  }),
});

const writingCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    date: z.string().transform((str) => new Date(str)),
    readMins: z.number(),
    tags: z.array(z.string()),
    image_url: z.string().optional(),
    medium_link: z.string().optional(),
  }),
});

const projectsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    image_url: z.string().optional(),
    github: z.string().optional(),
    play_store: z.string().optional(),
    app_store: z.string().optional(),
    category: z.string().optional(),
  }),
});

const notesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    date: z.string().transform((str) => new Date(str)),
    tags: z.array(z.string()).optional(),
    excerpt: z.string().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
  writing: writingCollection,
  projects: projectsCollection,
  notes: notesCollection,
};
