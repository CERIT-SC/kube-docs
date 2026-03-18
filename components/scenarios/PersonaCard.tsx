import React from 'react';

interface Scenario {
  title: string;
  href: string;
}

interface PersonaCardProps {
  icon: React.ReactNode;
  title: string;
  scenarios: Scenario[];
}

export function PersonaCard({ icon, title, scenarios }: PersonaCardProps) {
  return (
    <div className="group relative flex items-start gap-3 overflow-hidden rounded-lg border border-border bg-gradient-to-br from-primary/[0.02] via-transparent to-accent/[0.02] py-4 px-6 transition-all hover:shadow-md hover:border-primary/20">
      <div className="absolute -right-2 -top-2 h-32 w-32 opacity-[0.03]">
        {icon}
      </div>
      <div className="flex-1 min-w-0 relative z-10">
        <h3 className="text-xl font-bold text-foreground leading-snug mb-3">
          {title}
        </h3>
        <ul className="space-y-2">
          {scenarios.map((scenario, index) => (
            <li key={index}>
              <a
                href={scenario.href}
                className="text-sm text-primary"
              >
                {scenario.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export const ResearcherIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 6H33" />
    <path d="M18 6V16" />
    <path d="M30 6V16" />
    <path d="M18 16L12 38" />
    <path d="M30 16L36 38" />
    <path d="M12 38H36" />
    <path d="M15 28H33" />
    <circle cx="20" cy="22" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="26" cy="24" r="1" fill="currentColor" stroke="none" />
    <circle cx="23" cy="20" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const AdminIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="10" y="8" width="28" height="12" rx="2" />
    <rect x="10" y="24" width="28" height="12" rx="2" />
    <circle cx="16" cy="14" r="2" fill="currentColor" stroke="none" />
    <circle cx="16" cy="30" r="2" fill="currentColor" stroke="none" />
    <path d="M22 14H26M22 30H26" />
    <circle cx="38" cy="14" r="4" />
    <path d="M38 10V12M38 16V18M34 14H36M40 14H42" />
  </svg>
);

export const StudentIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M24 8L6 18L24 28L42 18L24 8Z" />
    <path d="M12 22V32C12 32 17 38 24 38C31 38 36 32 36 32V22" />
    <path d="M42 18V26" />
    <circle cx="42" cy="30" r="3" />
  </svg>
);

export const VOManagerIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="16" cy="14" r="5" />
    <path d="M6 40C6 32 10 26 16 26C22 26 26 32 26 40" />
    <circle cx="34" cy="18" r="4" />
    <path d="M26 40C26 34 29 30 34 30C39 30 42 34 42 40" />
    <circle cx="38" cy="10" r="4" fill="currentColor" stroke="none" />
    <path d="M35.5 10L37 12L40.5 8" stroke="white" strokeWidth="2" />
  </svg>
);

export const DeveloperIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="8" width="36" height="28" rx="3" />
    <path d="M6 16H42" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="18" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="24" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <path d="M14 24L18 28L14 32" />
    <path d="M24 28H32" />
  </svg>
);

export const LeaderIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M24 6L28 14H36L30 20L32 28L24 24L16 28L18 20L12 14H20L24 6Z" />
    <circle cx="10" cy="34" r="4" />
    <circle cx="24" cy="34" r="4" />
    <circle cx="38" cy="34" r="4" />
    <path d="M10 38V42M24 38V42M38 38V42" />
  </svg>
);
