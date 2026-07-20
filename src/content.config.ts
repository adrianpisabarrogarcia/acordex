import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const songs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/songs' }),
  schema: z.object({
    title: z.string(),
    artist: z.string(),
    key: z.string(),
    capo: z.number().default(0),
    tempo: z.number().optional(),
    timeSignature: z.string().default('4/4'),
    strumming: z.string().optional(),
    tags: z.array(z.string()).default([]),
    difficulty: z.enum(['fácil', 'intermedio', 'avanzado']).default('fácil'),
    youtubeUrl: z.string().optional(),
  }),
});

export const collections = { songs };
