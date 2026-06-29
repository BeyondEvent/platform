export function Footer() {
  return (
    <footer className="w-full max-w-5xl mx-auto px-4 mt-auto pb-8 pointer-events-none">
      <div className="pointer-events-auto flex items-center justify-between gap-6 px-6 py-4 rounded-none border border-border bg-card/50 backdrop-blur-md text-xs text-muted-foreground shadow-sm">
        <span>&copy; {new Date().getFullYear()} BeyondEvent. All rights reserved.</span>
        <div className="flex gap-4">
          <a
            href="https://github.com/BeyondEvent"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
          <a href="/docs" className="hover:text-foreground transition-colors">
            Documentation
          </a>
        </div>
      </div>
    </footer>
  );
}
