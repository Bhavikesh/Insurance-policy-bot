import { Menu, Moon, Sun, PanelRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { SidebarPanel } from '../documents/sidebar-panel';
import { ChatPanel } from '../chat/chat-panel';
import { DocumentViewerPanel } from '../viewer/document-viewer-panel';
import { Button } from '../ui/button';
import { useAppStore } from '../../store/app-store';

export function AppShell() {
  const { theme, toggleTheme, isMobileSidebarOpen, setMobileSidebar } = useAppStore();

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
          <div className="mx-auto flex h-14 max-w-[1800px] items-center justify-between px-3 lg:px-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileSidebar(!isMobileSidebarOpen)}>
                <Menu className="h-4 w-4" />
              </Button>
              <PanelRight className="h-4 w-4 text-primary-600" />
              <div>
                <h1 className="text-sm font-semibold">Intelligent Document Assistant</h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Enterprise Policy Intelligence Workspace</p>
              </div>
            </div>

            <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </header>

        <main className="mx-auto grid h-[calc(100vh-56px)] max-w-[1800px] grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-12">
          <section className="min-h-0 lg:col-span-2 lg:block">
            <SidebarPanel />
          </section>

          <section className="min-h-0 lg:col-span-7">
            <ChatPanel />
          </section>

          <section className="min-h-0 lg:col-span-3">
            <DocumentViewerPanel />
          </section>
        </main>

        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setMobileSidebar(false)}
          >
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              className="h-full w-[300px] bg-white p-3 dark:bg-slate-950"
              onClick={(e) => e.stopPropagation()}
            >
              <SidebarPanel />
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
