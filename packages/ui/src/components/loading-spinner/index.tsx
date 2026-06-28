export interface LoadingSpinnerProps {
  readonly size?: 'sm' | 'md' | 'lg';
  readonly label?: string;
}

const sizeClasses = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' } as const;

export function LoadingSpinner({ size = 'md', label = 'Loading…' }: LoadingSpinnerProps) {
  return (
    <output aria-label={label} className="flex items-center justify-center">
      <span
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-current border-t-transparent`}
      />
      <span className="sr-only">{label}</span>
    </output>
  );
}
