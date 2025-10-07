/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

const Header = () => {
  return (
    <header className="sticky top-0 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm p-4 z-40 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <div className="flex items-center gap-3 text-base">
          <span className="text-slate-900 dark:text-slate-50 font-bold text-lg">
            build with Emilio AI
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            | Built with{' '}
            <a
              href="https://ai.google.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Gemini
            </a>
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
