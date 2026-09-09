"use client";
export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <div className="panel admin-card">
      <h1>Unable to load this page</h1>
      <p>
        Check the Supabase connection and migrations, then try again. No
        successful save is implied by this error.
      </p>
      <button className="button button-primary" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
