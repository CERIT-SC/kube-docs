'use client';

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

  return <button onClick={handleClick}>Ask AI assistent for help</button>;
}

