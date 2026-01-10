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
          className="fixed bottom-6 right-6 z-50 bg-black text-white p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-black/90 group font-montserrat"
          aria-label="Open AI Builder Chat"
        >
          <MessageSquare className="w-6 h-6" strokeWidth={1.5} />
          <span className="absolute -top-1 -right-1 bg-black w-3 h-3 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] bg-white shadow-2xl flex flex-col overflow-hidden border border-black/10">
          {/* Header */}
          <div className="bg-black text-white p-6 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="border border-white/20 p-2">
                <Code className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-montserrat text-sm tracking-widest font-light">AI BUILDER</h3>
                <p className="text-xs text-white/60 tracking-wide mt-0.5">Your Coding Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/10 p-1.5 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#fdfbf8]">
            {messages.length === 0 && (
              <div className="text-center text-[#636363] mt-8">
                <Code className="w-12 h-12 mx-auto mb-4 text-black/40" strokeWidth={1.5} />
                <p className="text-sm font-roboto leading-relaxed">
                  Hi! I'm your AI coding assistant.
                  <br />
                  I can help you build and debug your website.
                </p>
                <div className="mt-6 text-xs text-left bg-white p-4 border border-black/5">
                  <p className="font-montserrat tracking-wide text-black/80 mb-3">TRY ASKING:</p>
                  <ul className="space-y-2 text-[#636363] font-roboto">
                    <li className="flex items-start gap-2">
                      <span className="text-black/40 mt-0.5">•</span>
                      <span>"Add a testimonials section"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-black/40 mt-0.5">•</span>
                      <span>"Fix the navigation on mobile"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-black/40 mt-0.5">•</span>
                      <span>"Create a new about page"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-black/40 mt-0.5">•</span>
                      <span>"Update the hero section styling"</span>
                    </li>
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
                  className={`max-w-[80%] p-4 font-roboto ${
                    message.role === 'user'
                      ? 'bg-black text-white'
                      : 'bg-white text-[#636363] border border-black/10'
                  }`}
                >
                  {message.toolCalls && message.toolCalls.length > 0 && (
                    <div className="mb-2 text-xs opacity-60 font-montserrat tracking-wide">
                      <Loader2 className="w-3 h-3 inline animate-spin mr-1" strokeWidth={1.5} />
                      Executing tools...
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  {message.toolResults && message.toolResults.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {message.toolResults.map((result, idx) => (
                        <div
                          key={idx}
                          className="text-xs bg-[#fdfbf8] p-2 border border-black/5 flex items-start gap-1.5"
                        >
                          <Check className="w-3 h-3 text-black mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                          <span className="text-[#636363] font-montserrat tracking-wide">{result.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-black/10 p-4">
                  <Loader2 className="w-4 h-4 animate-spin text-black/60" strokeWidth={1.5} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Deployment Preview */}
          {deploymentPreview && (
            <div className="bg-white border-t border-black/10 p-5">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-4 h-4 text-black/60 mt-0.5" strokeWidth={1.5} />
                <div className="flex-1">
                  <p className="text-sm font-montserrat tracking-wide text-black">
                    READY TO DEPLOY
                  </p>
                  <p className="text-xs text-[#636363] mt-1.5 font-roboto">
                    {deploymentPreview.files.length} file(s) will be modified
                  </p>
                  <div className="mt-3 space-y-1.5">
                    {deploymentPreview.files.map((file, idx) => (
                      <div key={idx} className="text-xs text-[#636363] flex items-center gap-2 font-roboto">
                        <Code className="w-3 h-3 text-black/40" strokeWidth={1.5} />
                        {file.path}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  className="flex-1 bg-black text-white py-3 px-4 text-sm font-montserrat tracking-widest hover:bg-black/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeploying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                      DEPLOYING...
                    </>
                  ) : (
                    <>
                      <GitCommit className="w-4 h-4" strokeWidth={1.5} />
                      DEPLOY
                    </>
                  )}
                </button>
                <button
                  onClick={() => setDeploymentPreview(null)}
                  className="px-4 py-3 text-sm font-montserrat tracking-wide text-black/60 hover:bg-black/5 transition-colors border border-black/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-5 bg-white border-t border-black/10">
            <div className="flex gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me to build or fix something..."
                className="flex-1 resize-none border border-black/10 px-4 py-3 text-sm font-roboto text-[#636363] focus:outline-none focus:border-black transition-colors placeholder:text-[#636363]/40"
                rows={2}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-black text-white p-3 hover:bg-black/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-end"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" strokeWidth={1.5} />
                ) : (
                  <Send className="w-5 h-5" strokeWidth={1.5} />
                )}
              </button>
            </div>
            <p className="text-xs text-[#636363]/60 mt-3 font-roboto">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </>
  );
}
