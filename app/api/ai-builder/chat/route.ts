import { NextRequest, NextResponse } from 'next/server';
import { createChatCompletion, glmClient } from '@/lib/glm-client';
import {
  readFileSafe,
  writeFileSafe,
  listFilesSafe,
  searchCode,
  canModifyFile,
} from '@/lib/file-safety';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max

interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tool_calls?: any[];
  tool_call_id?: string;
  name?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Process any pending tool calls first
          let processedMessages = [...messages];
          let needsToolExecution = true;

          while (needsToolExecution) {
            needsToolExecution = false;

            // Get completion from GLM-4.7
            const completion = await createChatCompletion(processedMessages, {
              stream: false, // We'll handle streaming manually
            });

            const response = completion.choices[0].message;

            // Check if there are tool calls
            if (response.tool_calls && response.tool_calls.length > 0) {
              needsToolExecution = true;

              // Add assistant's response with tool calls to messages
              processedMessages.push({
                role: 'assistant',
                content: response.content || '',
                tool_calls: response.tool_calls,
              });

              // Send tool call notification to client
              const toolCallData = JSON.stringify({
                type: 'tool_calls',
                tool_calls: response.tool_calls.map((tc) => ({
                  id: tc.id,
                  name: tc.function.name,
                  arguments: tc.function.arguments,
                })),
              });
              controller.enqueue(encoder.encode(`data: ${toolCallData}\n\n`));

              // Execute each tool call
              for (const toolCall of response.tool_calls) {
                const functionName = toolCall.function.name;
                const functionArgs = JSON.parse(toolCall.function.arguments);

                let toolResult: any;

                try {
                  // Execute the tool
                  toolResult = await executeToolCall(functionName, functionArgs);

                  // Add successful tool result to messages
                  processedMessages.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    name: functionName,
                    content: JSON.stringify(toolResult),
                  });

                  // Send tool result to client
                  const resultData = JSON.stringify({
                    type: 'tool_result',
                    tool_call_id: toolCall.id,
                    name: functionName,
                    result: toolResult,
                  });
                  controller.enqueue(encoder.encode(`data: ${resultData}\n\n`));
                } catch (error: any) {
                  // Add error result to messages
                  const errorMessage = error.message || 'Tool execution failed';
                  processedMessages.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    name: functionName,
                    content: JSON.stringify({ error: errorMessage }),
                  });

                  // Send error to client
                  const errorData = JSON.stringify({
                    type: 'tool_error',
                    tool_call_id: toolCall.id,
                    name: functionName,
                    error: errorMessage,
                  });
                  controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
                }
              }
            } else {
              // No more tool calls, send final response
              const content = response.content || '';

              // Stream the content word by word for better UX
              const words = content.split(' ');
              for (let i = 0; i < words.length; i++) {
                const word = words[i] + (i < words.length - 1 ? ' ' : '');
                const messageData = JSON.stringify({
                  type: 'content',
                  content: word,
                });
                controller.enqueue(encoder.encode(`data: ${messageData}\n\n`));
                // Small delay for streaming effect
                await new Promise((resolve) => setTimeout(resolve, 20));
              }

              // Send done signal
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            }
          }
        } catch (error: any) {
          console.error('Chat error:', error);
          const errorData = JSON.stringify({
            type: 'error',
            error: error.message || 'An error occurred',
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Execute a tool call based on function name and arguments
 */
async function executeToolCall(
  functionName: string,
  args: any
): Promise<any> {
  switch (functionName) {
    case 'read_file': {
      const { path } = args;
      const content = await readFileSafe(path);
      return {
        success: true,
        path,
        content,
        lines: content.split('\n').length,
      };
    }

    case 'write_file': {
      const { path, content } = args;

      // Check if file can be modified
      const safetyCheck = canModifyFile(path);
      if (!safetyCheck.allowed) {
        return {
          success: false,
          error: safetyCheck.reason,
        };
      }

      await writeFileSafe(path, content);
      return {
        success: true,
        path,
        message: 'File written successfully',
      };
    }

    case 'list_files': {
      const { directory } = args;
      const files = await listFilesSafe(directory);
      return {
        success: true,
        directory,
        files,
        count: files.length,
      };
    }

    case 'search_code': {
      const { query, filePattern } = args;
      const results = await searchCode(query, filePattern);
      return {
        success: true,
        query,
        results,
        count: results.length,
      };
    }

    case 'preview_deployment': {
      const { files, message } = args;
      // This is a special case - we don't actually deploy here
      // We just return the preview data for the frontend to show
      return {
        success: true,
        action: 'preview',
        files,
        message,
        requiresApproval: true,
      };
    }

    default:
      throw new Error(`Unknown function: ${functionName}`);
  }
}
