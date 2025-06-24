'use client';

import { twMerge as cn } from 'tailwind-merge';
import { buttonVariants } from '@/components/button';
import { MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    runllm?: {
      open: () => void;
    };
  }
}

export default function RunLLMButton() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkLLM = () => {
        if (window.runllm && typeof window.runllm.open === 'function') {
          setLoaded(true);
        } else {
          // Try again after a short delay in case it's still loading
          setTimeout(checkLLM, 500);
        }
      };
      checkLLM();
    }
  }, []);

  const handleClick = () => {
    if (window.runllm?.open) {
      window.runllm.open();
    } else {
      alert('LLM is not ready yet.');
    }
  };

  if (!loaded) return null;

  return (
    <div className="flex items-center justify-center w-full h-full">
      <button
        className={cn(
          buttonVariants({ variant: 'secondary' }),
          'gap-2 rounded-xl text-fd-secondary-foreground/80 shadow-lg backdrop-blur-lg',
          'bg-fd-secondary ring-1 ring-[#24a9c2]'
        )}
        onClick={handleClick}
      >
        <MessageCircle className="size-4" />
        Need help? Ask the AI
      </button>
    </div>
  );
}

