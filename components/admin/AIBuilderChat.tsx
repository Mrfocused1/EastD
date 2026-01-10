'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Check, AlertCircle, Code, GitCommit } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolCalls?: any[];
  toolResults?: any[];
  timestamp: Date;
}

interface DeploymentPreview {
  files: Array<{ path: string; content: string }>;
  message: string;
}

export default function AIBuilderChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deploymentPreview, setDeploymentPreview] = useState<DeploymentPreview | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send message to API
      const response = await fetch('/api/ai-builder/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Read the streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        toolCalls: [],
        toolResults: [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === 'content') {
                assistantMessage.content += parsed.content;
                setMessages((prev) => [...prev.slice(0, -1), { ...assistantMessage }]);
              } else if (parsed.type === 'tool_calls') {
                assistantMessage.toolCalls = parsed.tool_calls;
                setMessages((prev) => [...prev.slice(0, -1), { ...assistantMessage }]);
              } else if (parsed.type === 'tool_result') {
                assistantMessage.toolResults = assistantMessage.toolResults || [];
                assistantMessage.toolResults.push(parsed);
                setMessages((prev) => [...prev.slice(0, -1), { ...assistantMessage }]);

                // Check if this is a deployment preview
                if (parsed.result?.action === 'preview') {
                  setDeploymentPreview({
                    files: parsed.result.files,
                    message: parsed.result.message,
                  });
                }
              } else if (parsed.type === 'tool_error') {
                assistantMessage.content += `\n\n❌ Error executing ${parsed.name}: ${parsed.error}`;
                setMessages((prev) => [...prev.slice(0, -1), { ...assistantMessage }]);
              } else if (parsed.type === 'error') {
                assistantMessage.content += `\n\n❌ Error: ${parsed.error}`;
                setMessages((prev) => [...prev.slice(0, -1), { ...assistantMessage }]);
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `❌ Error: ${error.message || 'Something went wrong'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeploy = async () => {
    if (!deploymentPreview) return;

    setIsDeploying(true);

    try {
      const response = await fetch('/api/ai-builder/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'deploy',
          files: deploymentPreview.files,
          message: deploymentPreview.message,
        }),
      });

      const result = await response.json();

      if (result.success) {
        const successMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `✅ ${result.message}\n\nCommit: ${result.commitUrl}\n\nYour changes will be live in ~2-3 minutes.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, successMessage]);
        setDeploymentPreview(null);
      } else {
        throw new Error(result.error || 'Deployment failed');
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `❌ Deployment failed: ${error.message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
          aria-label="Open AI Builder Chat"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 bg-green-500 w-3 h-3 rounded-full animate-pulse"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-2 rounded-lg">
                <Code className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">EastDock AI Builder</h3>
                <p className="text-xs text-white/80">Your coding assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1 rounded transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <Code className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">
                  Hi! I'm your AI coding assistant.
                  <br />
                  I can help you build and debug your website.
                </p>
                <div className="mt-4 text-xs text-left bg-white p-3 rounded-lg">
                  <p className="font-semibold mb-2">Try asking:</p>
                  <ul className="space-y-1 text-gray-600">
                    <li>• "Add a testimonials section"</li>
                    <li>• "Fix the navigation on mobile"</li>
                    <li>• "Create a new about page"</li>
                    <li>• "Update the hero section styling"</li>
                  </ul>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  {message.toolCalls && message.toolCalls.length > 0 && (
                    <div className="mb-2 text-xs opacity-70">
                      <Loader2 className="w-3 h-3 inline animate-spin mr-1" />
                      Executing tools...
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.toolResults && message.toolResults.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.toolResults.map((result, idx) => (
                        <div
                          key={idx}
                          className="text-xs bg-gray-100 p-2 rounded flex items-start gap-1"
                        >
                          <Check className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600">{result.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Deployment Preview */}
          {deploymentPreview && (
            <div className="bg-yellow-50 border-t border-yellow-200 p-3">
              <div className="flex items-start gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-yellow-800">
                    Ready to deploy
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    {deploymentPreview.files.length} file(s) will be modified
                  </p>
                  <div className="mt-2 space-y-1">
                    {deploymentPreview.files.map((file, idx) => (
                      <div key={idx} className="text-xs text-yellow-700 flex items-center gap-1">
                        <Code className="w-3 h-3" />
                        {file.path}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeploying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <GitCommit className="w-4 h-4" />
                      Deploy to Production
                    </>
                  )}
                </button>
                <button
                  onClick={() => setDeploymentPreview(null)}
                  className="px-3 py-2 text-sm text-yellow-800 hover:bg-yellow-100 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me to build or fix something..."
                className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-end"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </>
  );
}
