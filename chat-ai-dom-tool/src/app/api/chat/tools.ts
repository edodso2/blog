import { InferUITools, tool } from 'ai';
import { z } from 'zod';

export const tools = {
  highlight: tool({
    description:
      'Highlight a DOM element for a user to see. The following elements can be highlighted: #example-button, #example-card',
    inputSchema: z.object({
      element: z.string().describe('The element to highlight'),
    }),
    execute: async ({ element }) => {
      return { element };
    },
  }),
} as const;

// Extract the tool types using the official helper
export type ChatTools = InferUITools<typeof tools>;
