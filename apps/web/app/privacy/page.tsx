export default function PrivacyPage() {
  return (
    <main className="main">
      <h1>Privacy Architecture</h1>
      <p className="lede">v0.1 is local-first and does not upload raw source history.</p>
      <div className="grid">
        {["discovered", "authorized", "scanned", "excluded", "blocked"].map((state) => (
          <section className="box" key={state}>
            <h2>{state}</h2>
            <p className="muted">Source state is explicit and auditable before any content is read.</p>
          </section>
        ))}
      </div>
    </main>
  );
}
