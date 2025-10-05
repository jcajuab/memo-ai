export function MemoHeader() {
  return (
    <header className="w-full py-8 px-6 border-b border-border bg-card" style={{ boxShadow: "var(--shadow-soft)" }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Memo.ai
        </h1>
      </div>
    </header>
  );
}
