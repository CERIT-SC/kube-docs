interface ScenarioGridProps {
  children: React.ReactNode;
  columns?: 'cols-1' | 'cols-2' | 'cols-3';
}

export function ScenarioGrid({ children, columns = 'cols-2' }: ScenarioGridProps) {
  const gridClasses = {
    'cols-1': 'grid-cols-1',
    'cols-2': 'grid-cols-1 md:grid-cols-2',
    'cols-3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  };

  return (
    <div className={`grid gap-6 ${gridClasses[columns]}`}>
      {children}
    </div>
  );
}
