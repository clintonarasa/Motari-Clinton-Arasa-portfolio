import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { Search, User, Briefcase, FolderGit2, Mail, LayoutDashboard, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Toggle the menu when ⌘K or ^K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <Command className="w-full h-full" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800">
            <Search className="w-5 h-5 text-slate-400 mr-2" />
            <Command.Input 
              autoFocus
              placeholder="Type a command or search..." 
              className="flex-1 bg-transparent outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
            <kbd className="hidden sm:inline-flex px-2 py-1 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-slate-500">
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="text-xs font-medium text-slate-500 px-2 py-2">
              <Command.Item 
                onSelect={() => runCommand(() => navigate('/'))}
                className="flex items-center px-2 py-3 mt-1 text-sm rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <User className="w-4 h-4 mr-3" />
                Home / Profile
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => navigate('/resume'))}
                className="flex items-center px-2 py-3 mt-1 text-sm rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <FileText className="w-4 h-4 mr-3" />
                View Resume
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => navigate('/#projects'))}
                className="flex items-center px-2 py-3 mt-1 text-sm rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <FolderGit2 className="w-4 h-4 mr-3" />
                Projects
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => navigate('/#contact'))}
                className="flex items-center px-2 py-3 mt-1 text-sm rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <Mail className="w-4 h-4 mr-3" />
                Contact Me
              </Command.Item>
            </Command.Group>

            <Command.Group heading="System" className="text-xs font-medium text-slate-500 px-2 py-2 mt-2 border-t border-slate-200 dark:border-slate-800">
              <Command.Item 
                onSelect={() => runCommand(() => navigate('/admin/login'))}
                className="flex items-center px-2 py-3 mt-1 text-sm rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <LayoutDashboard className="w-4 h-4 mr-3" />
                Admin Login
              </Command.Item>
            </Command.Group>

          </Command.List>
        </Command>
      </div>
    </div>
  );
}
export default CommandPalette;