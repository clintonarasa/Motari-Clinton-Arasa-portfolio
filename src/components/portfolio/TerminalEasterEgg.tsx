import React, { useState, useEffect, useRef } from 'react';

export function TerminalEasterEgg() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{ command: string; output: string }[]>([
    { command: '', output: 'Welcome to clinton-os v1.0.0. Type "help" for a list of commands.' }
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open terminal when '>' is pressed and no input is currently focused
      if (e.key === '>' && !isOpen && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      // Close on escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    let output = '';

    switch (cmd) {
      case 'help':
        output = 'Available commands: whoami, skills, clear, exit';
        break;
      case 'whoami':
        output = 'Clinton Arasa - Full Stack Developer & Problem Solver.';
        break;
      case 'skills':
        output = 'React, TypeScript, Node.js, Tailwind CSS, Vite, and more...';
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      case 'exit':
        setIsOpen(false);
        setInput('');
        return;
      default:
        output = cmd ? `Command not found: ${cmd}` : '';
    }

    if (cmd) {
      setHistory(prev => [...prev, { command: cmd, output }]);
    }
    setInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 font-mono text-sm">
      <div className="max-w-3xl mx-auto bg-[#1e1e1e] text-[#00ff00] rounded-t-lg shadow-2xl overflow-hidden border border-slate-700">
        <div className="bg-[#2d2d2d] px-4 py-2 flex items-center justify-between text-slate-300 text-xs">
          <span>guest@clinton-portfolio:~</span>
          <button onClick={() => setIsOpen(false)} className="hover:text-white">✕</button>
        </div>
        <div className="p-4 h-64 overflow-y-auto">
          {history.map((item, i) => (
            <div key={i} className="mb-2">
              {item.command && <div><span className="text-blue-400">guest@clinton:~$</span> {item.command}</div>}
              <div className="text-slate-300">{item.output}</div>
            </div>
          ))}
          <form onSubmit={handleCommand} className="flex mt-2">
            <span className="text-blue-400 mr-2">guest@clinton:~$</span>
            <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 bg-transparent outline-none border-none text-[#00ff00]" spellCheck={false} />
          </form>
        </div>
      </div>
    </div>
  );
}
export default TerminalEasterEgg;