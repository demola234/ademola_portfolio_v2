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
    order: z.number().optional(),
  }),
});

const notesCollection = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z
      .object({
        date: z.string().transform((str) => new Date(str)),
        tags: z.array(z.string()).optional(),
        excerpt: z.string().optional(),
        // A note about a book. Cover path is relative to the note, e.g.
        // "../../assets/books/database-internals.jpg"
        book: z
          .object({
            title: z.string(),
            author: z.string(),
            cover: image(),
            status: z.enum(['reading', 'read']),
          })
          .optional(),
      })
      // Every book note is filterable under "Books" without tagging it by hand
      .transform((d) =>
        d.book ? { ...d, tags: [...new Set([...(d.tags ?? []), 'Books'])] } : d,
      ),
});

export const collections = {
  blog: blogCollection,
  writing: writingCollection,
  projects: projectsCollection,
  notes: notesCollection,
};
