import { Bot, Copy, RefreshCw, ThumbsDown, ThumbsUp, User } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { ChatMessage, Citation } from '../../types/chat';
import { formatTime } from '../../lib/utils';

interface Props {
  message: ChatMessage;
  onCitationClick: (citation: Citation) => void;
  onRegenerate: () => void;
}

export function MessageBubble({ message, onCitationClick, onRegenerate }: Props) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[92%] rounded-2xl border p-4 shadow-sm ${
        isUser
          ? 'border-primary-200 bg-primary-50 text-primary-950 dark:border-primary-900/60 dark:bg-primary-950/30 dark:text-primary-100'
          : 'border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100'
      }`}>
        <div className="mb-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
          </span>
          <span>{isUser ? 'You' : 'Assistant'}</span>
          <span>•</span>
          <span>{formatTime(message.createdAt)}</span>
        </div>

        <article className="prose prose-sm max-w-none dark:prose-invert prose-pre:rounded-lg prose-pre:bg-slate-950 prose-code:before:content-none prose-code:after:content-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
        </article>

        {!isUser && (
          <div className="mt-3 space-y-2">
            {message.citations && message.citations.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {message.citations.map((citation) => (
                  <button key={`${message.id}-${citation.clause_id}-${citation.page_number}`} onClick={() => onCitationClick(citation)}>
                    <Badge className="cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/50">
                      Clause {citation.clause_id} • P{citation.page_number}
                    </Badge>
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(message.content)}>
                <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
              </Button>
              <Button size="sm" variant="ghost" onClick={onRegenerate}>
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Regenerate
              </Button>
              <Button size="sm" variant="ghost"><ThumbsUp className="h-3.5 w-3.5" /></Button>
              <Button size="sm" variant="ghost"><ThumbsDown className="h-3.5 w-3.5" /></Button>
              {typeof message.confidence === 'number' && (
                <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">Confidence {Math.round(message.confidence * 100)}%</span>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
