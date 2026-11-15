function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-atys-background">
      <div className="rounded-2xl bg-atys-surface border border-atys-border p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-atys-primary">ATYS Admin</h1>

        <p className="mt-2 text-atys-muted">
          Your platform management dashboard.
        </p>

        <div className="mt-6 flex gap-3">
          <span className="rounded-lg bg-atys-client px-4 py-2 text-white">
            Client
          </span>

          <span className="rounded-lg bg-atys-provider px-4 py-2 text-white">
            Provider
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;
