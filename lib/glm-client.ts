import OpenAI from 'openai';

// GLM-4.7 API client configuration
// GLM-4.7 is OpenAI-compatible, so we use the OpenAI SDK
export const glmClient = new OpenAI({
  apiKey: process.env.GLM_API_KEY,
  baseURL: 'https://open.bigmodel.cn/api/paas/v4', // GLM API endpoint
});

// Tool definitions for file operations
export const fileOperationTools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'read_file',
      description: 'Read the contents of a file in the codebase. Use this to understand existing code before making changes.',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'File path relative to project root (e.g., "app/page.tsx" or "components/Header.tsx")',
          },
        },
        required: ['path'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'write_file',
      description: 'Create or update a file in the codebase. Only UI files (components, pages, styles) can be modified.',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'File path relative to project root',
          },
          content: {
            type: 'string',
            description: 'Complete file content to write',
          },
        },
        required: ['path', 'content'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_files',
      description: 'List files in a directory to understand the codebase structure',
      parameters: {
        type: 'object',
        properties: {
          directory: {
            type: 'string',
            description: 'Directory path relative to project root (e.g., "components" or "app")',
          },
        },
        required: ['directory'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_code',
      description: 'Search for code patterns in the codebase',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query (text or regex pattern)',
          },
          filePattern: {
            type: 'string',
            description: 'File pattern to search (e.g., "*.tsx" or "components/**")',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'preview_deployment',
      description: 'Preview changes before deploying to production. Shows file diffs.',
      parameters: {
        type: 'object',
        properties: {
          files: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                path: { type: 'string' },
                content: { type: 'string' },
              },
            },
            description: 'Array of files to preview',
          },
          message: {
            type: 'string',
            description: 'Deployment commit message',
          },
        },
        required: ['files', 'message'],
      },
    },
  },
];

// System prompt for the AI builder
export const SYSTEM_PROMPT = `You are an AI coding assistant for the EastDock Studios website. You help the admin build and debug their website.

## Your Capabilities:
- Read and modify UI components in /app and /components directories
- Create new pages, sections, and components
- Fix bugs in the frontend code
- Update styles using Tailwind CSS
- Search and understand the existing codebase

## Tech Stack:
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Payments**: Stripe
- **Email**: Resend

## Important Rules:
1. **ONLY modify files in these directories:**
   - /app (pages and layouts)
   - /components (React components)
   - /app/globals.css (global styles)
   - /tailwind.config.ts (Tailwind config)

2. **NEVER modify these:**
   - API routes (/app/api)
   - Environment files (.env)
   - Database config (/lib/supabase.ts)
   - Payment config (/lib/stripe.ts)
   - Package files (package.json)
   - Next.js config (next.config.js)

3. **Code Quality:**
   - Always read existing files before modifying them
   - Follow existing code patterns and conventions
   - Use TypeScript with proper types
   - Use Tailwind CSS for all styling (no inline styles)
   - Ensure components are responsive
   - Add proper error handling

4. **Workflow:**
   - First, understand the request
   - Read relevant files to understand existing code
   - Plan your changes
   - Implement changes following existing patterns
   - Preview changes before deployment
   - Only deploy when user approves

## Current Project Structure:
- /app - Next.js App Router pages
  - /admin - Admin dashboard (15+ management pages)
  - /studios - Studio showcase pages
  - /auth - Authentication pages
  - /booking - Booking pages
- /components - Reusable React components
  - /admin - Admin-specific components
- /lib - Utility functions and configurations

Be helpful, precise, and always prioritize code quality and user experience.`;

// Helper to create chat completion with preserved thinking
export async function createChatCompletion(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  options?: {
    stream?: boolean;
    temperature?: number;
  }
) {
  // GLM-specific parameters not in OpenAI types
  const glmParams: any = {
    model: 'glm-4.7',
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      ...messages,
    ],
    tools: fileOperationTools,
    thinking: { type: 'enabled' }, // Enable thinking mode (GLM-specific)
    clear_thinking: false, // Preserve thinking across turns (GLM-specific)
    stream: options?.stream ?? false,
    temperature: options?.temperature ?? 0.7,
  };

  return glmClient.chat.completions.create(glmParams);
}
