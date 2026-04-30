interface SupportCTAProps {
  title?: string;
  description?: string;
  href?: string;
  buttonText?: string;
}

export function SupportCTA({
  title = 'Not sure what you need?',
  description = 'Our support team can help you find the right storage solution for your needs.',
  href = '/docs/introduction/support',
  buttonText = 'Contact Support',
}: SupportCTAProps) {
  return (
    <div className="rounded-lg border border-border bg-muted/50 p-8 text-center">
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="mb-6 text-muted-foreground">{description}</p>
      <a
        href={href}
        className="inline-flex items-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {buttonText}
        <svg
          className="ml-2 h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </a>
    </div>
  );
}
