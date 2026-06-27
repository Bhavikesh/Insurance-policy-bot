import { motion } from 'framer-motion';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import type { Citation } from '../../types/chat';
import { confidenceFromScore } from '../../lib/utils';

interface Props {
  citation: Citation;
  onSelect: (citation: Citation) => void;
}

export function CitationCard({ citation, onSelect }: Props) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(citation)}
      className="w-full rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-left shadow-sm transition hover:border-amber-300 dark:border-amber-900/50 dark:bg-amber-950/20"
    >
      <div className="mb-2 flex items-center justify-between">
        <Badge className="border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-100">
          Clause {citation.clause_id}
        </Badge>
        <span className="text-xs text-slate-600 dark:text-slate-300">Page {citation.page_number}</span>
      </div>

      <p className="line-clamp-2 text-xs text-slate-700 dark:text-slate-200">{citation.highlighted_text}</p>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Similarity {(citation.similarity_score * 100).toFixed(0)}%</span>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px]">
          Focus
        </Button>
      </div>

      <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
        Confidence {confidenceFromScore(citation.similarity_score)}%
      </div>
    </motion.button>
  );
}
