'use client';

import { X, UserPlus, LogIn } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function AlreadyRegisteredDialog({ isOpen, onClose, onConfirm }: DialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white/95 dark:bg-[#16212E]/95 border border-slate-250 dark:border-[#1E2D3D] rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 relative animate-in zoom-in-95 duration-200 text-foreground dark:text-[#B6C7C9]">
        {/* Close button */}
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center mt-2">
          <div className="p-3 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-[#00C2A9] rounded-full mb-4">
            <LogIn className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-[#E9F1F3] mb-2">Already Registered</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
            An account with this email already exists. Please continue with Login.
          </p>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onConfirm}
            className="w-full bg-[#00C2A9] dark:bg-[#00C2A9] text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-[#00A38E] dark:hover:bg-[#00A38E] transition-colors cursor-pointer text-sm shadow-md"
          >
            Continue to Login
          </button>
          <button
            onClick={onClose}
            className="w-full border border-border dark:border-[#1E2D3D] hover:bg-muted dark:hover:bg-slate-800 text-foreground dark:text-[#B6C7C9] px-4 py-2.5 rounded-lg font-semibold transition-colors cursor-pointer text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function RegisterFirstDialog({ isOpen, onClose, onConfirm, message }: DialogProps & { message?: string }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white/95 dark:bg-[#16212E]/95 border border-slate-250 dark:border-[#1E2D3D] rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 relative animate-in zoom-in-95 duration-200 text-foreground dark:text-[#B6C7C9]">
        {/* Close button */}
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center mt-2">
          <div className="p-3 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full mb-4">
            <UserPlus className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-[#E9F1F3] mb-2">Register First</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
            {message || "Account not found. Please register first."}
          </p>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onConfirm}
            className="w-full bg-[#00C2A9] dark:bg-[#00C2A9] text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-[#00A38E] dark:hover:bg-[#00A38E] transition-colors cursor-pointer text-sm shadow-md"
          >
            Create Account
          </button>
          <button
            onClick={onClose}
            className="w-full border border-border dark:border-[#1E2D3D] hover:bg-muted dark:hover:bg-slate-800 text-foreground dark:text-[#B6C7C9] px-4 py-2.5 rounded-lg font-semibold transition-colors cursor-pointer text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
