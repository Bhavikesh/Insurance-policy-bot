import { useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SendHorizonal, Sparkles } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { MessageBubble } from './message-bubble';
import { CitationCard } from './citation-card';
import { useAppStore } from '../../store/app-store';
import { useChatQuery } from '../../hooks/use-chat';
import type { Citation } from '../../types/chat';

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ChatPanel() {
  const { messages, addMessage, setTyping, isAssistantTyping, selectedDocument, inputDraft, setInputDraft, setFocusedCitation } = useAppStore();
  const query = useChatQuery();
  const listRef = useRef<HTMLDivElement | null>(null);

  const lastAssistantCitations = useMemo(() => {
    const latest = [...messages].reverse().find((m) => m.role === 'assistant' && m.citations?.length);
    return latest?.citations ?? [];
  }, [messages]);

  const submit = async () => {
    const question = inputDraft.trim();
    if (!question || !selectedDocument) return;

    const userMessageId = uid();
    const assistantMessageId = uid();

    addMessage({
      id: userMessageId,
      role: 'user',
      content: question,
      createdAt: new Date().toISOString()
    });

    addMessage({
      id: assistantMessageId,
      role: 'assistant',
      content: 'Analyzing clauses and generating answer...',
      createdAt: new Date().toISOString(),
      isStreaming: true
    });

    setInputDraft('');
    setTyping(true);

    try {
      const response = await query.mutateAsync({ document_id: selectedDocument.id, questions: [question] });
      const answer = response.answer ?? response.answers?.[0] ?? 'No answer generated.';
      const citations = (response.citations ?? []).map((c) => ({
        clause_id: c.clause_id,
        page_number: c.page_number ?? (c as { page?: number }).page ?? 1,
        similarity_score: c.similarity_score ?? (c as { score?: number }).score ?? 0.75,
        highlighted_text: c.highlighted_text ?? (c as { text?: string }).text ?? 'Relevant clause text'
      }));

      useAppStore.getState().updateMessage(assistantMessageId, {
        content: answer,
        isStreaming: false,
        citations,
        confidence: citations[0]?.similarity_score ?? 0.86
      });
    } catch (error) {
      useAppStore.getState().updateMessage(assistantMessageId, {
        content: 'I could not complete this request. Please retry.',
        isStreaming: false,
        error: (error as Error).message
      });
    } finally {
      setTyping(false);
      setTimeout(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const onCitation = (citation: Citation) => {
    setFocusedCitation(citation);
  };

  return (
    <section className="flex h-full min-h-0 flex-col gap-3">
      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div ref={listRef} className="flex-1 space-y-6 overflow-auto p-6">
          <AnimatePresence>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} onCitationClick={onCitation} onRegenerate={() => setInputDraft(messages.find((m) => m.role === 'user')?.content ?? '')} />
            ))}
          </AnimatePresence>

          {isAssistantTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <Sparkles className="h-3.5 w-3.5" /> Streaming response...
            </motion.div>
          )}
        </div>

        <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-white/80 p-6 dark:border-slate-800 dark:bg-slate-950/80">
          <div className="mb-3 text-sm text-slate-600 dark:text-slate-400">Ask anything about the selected policy document.</div>
          <div className="flex items-end gap-4">
            <Textarea
              value={inputDraft}
              onChange={(e) => setInputDraft(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={selectedDocument ? 'Ask about waiting period, exclusions, coverage clauses...' : 'Select a document to start chat'}
              className="max-h-56 min-h-[80px] flex-1"
            />
            <Button onClick={submit} disabled={!selectedDocument || !inputDraft.trim() || query.isPending} className="h-12 w-12 p-0">
              <SendHorizonal className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>

      {lastAssistantCitations.length > 0 && (
        <Card className="p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Sources</p>
          <div className="grid gap-2 md:grid-cols-2">
            {lastAssistantCitations.map((citation) => (
              <CitationCard key={`${citation.clause_id}-${citation.page_number}`} citation={citation} onSelect={onCitation} />
            ))}
          </div>
        </Card>
      )}
    </section>
  );
}
