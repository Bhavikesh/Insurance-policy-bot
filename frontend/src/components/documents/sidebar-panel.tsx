import { FileText, FileType2, FileArchive, Search, Upload, PanelLeftClose, PanelLeftOpen, History } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useDocuments } from '../../hooks/use-documents';
import { useAppStore } from '../../store/app-store';
import { formatFileSize, getFileType } from '../../lib/utils';
import type { DocumentItem } from '../../types/chat';

const iconMap = {
  pdf: FileText,
  docx: FileType2,
  eml: FileArchive,
  unknown: FileText
};

export function SidebarPanel() {
  const { data, isLoading } = useDocuments();
  const {
    documentSearch,
    setDocumentSearch,
    selectedDocument,
    setSelectedDocument,
    isSidebarCollapsed,
    toggleSidebar,
    suggestions,
    setInputDraft
  } = useAppStore();

  const docs = (data?.documents ?? []).map((doc) => ({ ...doc, type: getFileType(doc.filename) as DocumentItem['type'] }));
  const filteredDocs = docs.filter((doc) => {
    const query = documentSearch.toLowerCase();
    return doc.display_name.toLowerCase().includes(query) || doc.company.toLowerCase().includes(query);
  });

  return (
    <motion.aside
      layout
      className={`h-full border-r border-slate-200 bg-white/80 p-3 dark:border-slate-800 dark:bg-slate-950/70 ${isSidebarCollapsed ? 'w-[72px]' : 'w-full'}`}
    >
      <Card className="h-full">
        <CardHeader className="items-center gap-2">
          {!isSidebarCollapsed && <CardTitle>Documents</CardTitle>}
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle sidebar">
              {isSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {!isSidebarCollapsed && (
            <>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={documentSearch}
                  onChange={(e) => setDocumentSearch(e.target.value)}
                  placeholder="Search documents"
                  className="pl-9"
                />
              </div>

              <Button className="w-full justify-center gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </Button>

              <div className="max-h-[66vh] space-y-2 overflow-auto pr-1">
                {isLoading && Array.from({ length: 4 }).map((_, idx) => <div key={idx} className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />)}

                {!isLoading && filteredDocs.map((doc) => {
                  const Icon = iconMap[doc.type ?? 'unknown'];
                  const active = selectedDocument?.id === doc.id;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDocument(doc)}
                      className={`w-full rounded-xl px-3 py-4 text-left transition ${
                        active
                          ? 'bg-primary-50 dark:bg-primary-950/30'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                          <Icon className="h-5 w-5 text-slate-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{doc.display_name}</p>
                          <p className="text-xs text-slate-500">{doc.company} · {formatFileSize(doc.size)}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 text-xs text-slate-500">Recent</div>
              <div className="flex flex-col gap-2">
                {(data?.documents ?? []).slice(0,4).map((d) => (
                  <button key={d.id} onClick={() => setSelectedDocument(d)} className="text-left text-sm text-slate-700 dark:text-slate-300 truncate">
                    {d.display_name}
                  </button>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.aside>
  );
}
