export default function Loading() {
  return (
    <div
      className="container section"
      role="status"
      aria-label="Loading sign in"
    >
      <div className="card mx-auto max-w-md animate-pulse p-7">
        <div className="h-3 w-28 rounded bg-gray-200" />
        <div className="mt-4 h-9 w-64 rounded bg-gray-200" />
        <div className="mt-3 h-4 w-full rounded bg-gray-100" />
        <div className="mt-8 h-12 rounded-lg bg-gray-100" />
        <div className="mt-4 h-12 rounded-lg bg-gray-100" />
        <div className="mt-5 h-12 rounded-lg bg-yellow-100" />
        <span className="sr-only">Loading login form…</span>
      </div>
    </div>
  );
}
