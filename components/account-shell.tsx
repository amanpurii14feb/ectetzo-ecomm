export function AccountShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="account-page">
      <main className="container account-content account-content-full">
        {children}
      </main>
    </div>
  );
}
