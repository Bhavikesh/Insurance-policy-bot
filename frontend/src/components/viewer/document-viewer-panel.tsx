import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, ZoomIn, ZoomOut, FileText, Highlighter } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useAppStore } from '../../store/app-store';

export function DocumentViewerPanel() {
  const {
    selectedDocument,
    focusedCitation,
    viewerPage,
    setViewerPage,
    viewerZoom,
    setViewerZoom,
    documentSearch,
    setDocumentSearch
  } = useAppStore();

  const totalPages = 42;

  const relatedClauses = useMemo(
    () => [
      'Clause 4.2.1 Waiting Period for Planned Surgery',
      'Clause 4.2.3 Pre-existing Condition Exclusions',
      'Clause 7.1 Claim Filing Timelines'
    ],
    []
  );

  return (
    <section className="flex h-full min-h-0 flex-col gap-3">
      <Card className="flex items-center justify-between gap-2 p-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Document Viewer</h3>
          <p className="max-w-[260px] truncate text-xs text-slate-500 dark:text-slate-400">{selectedDocument?.display_name ?? 'No document selected'}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setViewerZoom(viewerZoom - 0.1)}><ZoomOut className="h-4 w-4" /></Button>
          <span className="w-12 text-center text-xs text-slate-500">{Math.round(viewerZoom * 100)}%</span>
          <Button variant="ghost" size="icon" onClick={() => setViewerZoom(viewerZoom + 0.1)}><ZoomIn className="h-4 w-4" /></Button>
        </div>
      </Card>

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="border-b border-slate-200 p-3 dark:border-slate-800">
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={documentSearch} onChange={(e) => setDocumentSearch(e.target.value)} className="pl-9" placeholder="Search inside document" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={() => setViewerPage(Math.max(1, viewerPage - 1))}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-xs text-slate-600 dark:text-slate-300">Page {viewerPage} / {totalPages}</span>
              <Button variant="outline" size="icon" onClick={() => setViewerPage(Math.min(totalPages, viewerPage + 1))}><ChevronRight className="h-4 w-4" /></Button>
            </div>

            {focusedCitation && (
              <Badge className="border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-100">
                Focus: Clause {focusedCitation.clause_id}
              </Badge>
            )}
          </div>
        </div>

        <div className="relative flex-1 overflow-auto p-4">
          <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900" style={{ transform: `scale(${viewerZoom})`, transformOrigin: 'top center' }}>
            <div className="mb-4 flex items-center gap-2 text-slate-500 dark:text-slate-300">
              <FileText className="h-4 w-4" />
              <span className="text-xs">PDF.js viewer surface</span>
            </div>

            <p className="mb-3 text-sm leading-7 text-slate-700 dark:text-slate-200">
              This panel is wired for citation-driven navigation. In production, replace this area with <strong>PDF.js/react-pdf canvas pages</strong>, overlay spans for clause highlights, and synchronized scroll.
            </p>

            <motion.div
              key={focusedCitation?.clause_id ?? 'none'}
              initial={{ opacity: 0.4, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-lg border p-3 ${
                focusedCitation
                  ? 'border-amber-300 bg-yellow-100/80 dark:border-amber-600 dark:bg-yellow-900/30'
                  : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60'
              }`}
            >
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <Highlighter className="h-3.5 w-3.5" />
                {focusedCitation ? `Clause ${focusedCitation.clause_id} • Page ${focusedCitation.page_number}` : 'Citation focus indicator'}
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-200">
                {focusedCitation?.highlighted_text ?? 'Click any citation chip to jump, highlight, and focus the relevant clause.'}
              </p>
            </motion.div>
          </div>
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        <Card className="p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Document Summary</p>
          <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
            <li>• Coverage includes hospitalization and day-care procedures.</li>
            <li>• Waiting period applies to planned surgery and PED conditions.</li>
            <li>• Exclusions include cosmetic and non-medical treatment.</li>
          </ul>
        </Card>

        <Card className="p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Related Clauses</p>
          <div className="space-y-1">
            {relatedClauses.map((clause) => (
              <button key={clause} className="block w-full rounded-lg px-2 py-1 text-left text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                {clause}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
