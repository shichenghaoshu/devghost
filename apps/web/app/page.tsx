export default function HomePage() {
  return (
    <main className="main hero">
      <section>
        <h1>DevGhost</h1>
        <p className="lede">
          Compile your developer memory into an AI coding ghost. GhostBench then
          measures how that skill performs with a fixed agent, model, harness,
          budget, and task set.
        </p>
        <div className="grid">
          <div className="box">
            <h2>Local First</h2>
            <p className="muted">Discovery starts with metadata. Raw memories and private code stay local.</p>
          </div>
          <div className="box">
            <h2>Evidence Before Claims</h2>
            <p className="muted">Capabilities trace back to normalized EvidenceRecord identifiers.</p>
          </div>
        </div>
      </section>
      <aside className="terminal" aria-label="DevGhost demo terminal">
        <div>$ devghost discover</div>
        <div className="muted">No file content has been read.</div>
        <div>$ devghost scan --source synthetic</div>
        <div>EvidenceRecord: 42</div>
        <div>Secret findings: 3</div>
        <div>$ devghost compile --target universal</div>
        <div>skillHash: sha256:...</div>
        <div>$ devghost play --agent mock</div>
        <div className="accent">Local Run - Unverified</div>
      </aside>
    </main>
  );
}
