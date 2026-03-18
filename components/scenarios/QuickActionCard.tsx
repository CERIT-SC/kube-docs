import React from 'react';

interface QuickActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}

export function QuickActionCard({ icon, title, description, href }: QuickActionCardProps) {
  return (
    <div className="group relative flex items-start gap-3 overflow-hidden rounded-lg border border-border bg-gradient-to-br from-accent/[0.02] via-transparent to-primary/[0.02] py-4 px-6 transition-all hover:shadow-md hover:border-primary/20">
      <div className="absolute -right-2 -top-2 h-32 w-32 opacity-[0.03]">
        {icon}
      </div>
      <div className="flex-1 min-w-0 relative z-10">
        <a 
          href={href}
          className="block text-xl font-bold text-foreground hover:text-primary transition-colors mb-3"
        >
          {title}
        </a>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

export const TransferIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 12H38C40.209 12 42 13.791 42 16V36C42 38.209 40.209 40 38 40H10C7.791 40 6 38.209 6 36V16C6 13.791 7.791 12 10 12Z" />
    <path d="M30 12V20H42" />
    <path d="M18 26H34" />
    <path d="M28 20L34 26L28 32" />
    <path d="M14 18V22" />
    <path d="M12 20H16" />
  </svg>
);

export const SyncIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="14" width="16" height="12" rx="2" />
    <path d="M10 26H18L16 30H12L10 26Z" />
    <rect x="30" y="18" width="10" height="16" rx="2" />
    <path d="M33 30H37" />
    <path d="M20 18H28M26 16L28 18L26 20" />
    <path d="M28 30H20M22 28L20 30L22 32" />
  </svg>
);

export const BackupIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="24" cy="12" rx="12" ry="5" />
    <path d="M12 12V28C12 30.76 17.37 33 24 33C30.63 33 36 30.76 36 28V12" />
    <path d="M12 20C12 22.76 17.37 25 24 25C30.63 25 36 22.76 36 20" />
    <path d="M18 38H30M21 33V38M27 33V38" />
    <path d="M34 30L38 34L42 30M38 26V34" />
  </svg>
);

export const SecureShareIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="10" y="20" width="28" height="22" rx="3" />
    <path d="M16 20V14C16 9.58 19.58 6 24 6C28.42 6 32 9.58 32 14V20" />
    <circle cx="24" cy="31" r="4" />
    <path d="M24 29V33" />
    <path d="M36 12L40 16L44 12M40 8V16" />
  </svg>
);

export const TeamAccessIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="16" cy="14" r="5" />
    <path d="M6 40C6 32 10 26 16 26C22 26 26 32 26 40" />
    <circle cx="36" cy="18" r="4" />
    <path d="M28 40C28 34 31 30 36 30C41 30 44 34 44 40" />
    <circle cx="28" cy="14" r="3" />
    <path d="M36 34L40 34M38 32V36" />
  </svg>
);

export const ApiAccessIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="12" width="14" height="10" rx="2" />
    <rect x="28" y="12" width="14" height="10" rx="2" />
    <rect x="6" y="30" width="14" height="10" rx="2" />
    <rect x="28" y="30" width="14" height="10" rx="2" />
    <path d="M20 17H28M20 35H28M24 22V30" />
    <circle cx="13" cy="17" r="2" fill="currentColor" stroke="none" />
    <circle cx="35" cy="17" r="2" fill="currentColor" stroke="none" />
    <circle cx="13" cy="35" r="2" fill="currentColor" stroke="none" />
    <circle cx="35" cy="35" r="2" fill="currentColor" stroke="none" />
  </svg>
);
