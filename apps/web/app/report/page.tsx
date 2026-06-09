export default function ReportPage() {
  const worlds = [
    ["Bug Cave", 91],
    ["Repository Maze", 84],
    ["Feature Forge", 82],
    ["Legacy City", 79]
  ] as const;

  return (
    <main className="main">
      <h1>Local Run Report</h1>
      <p className="lede accent">Local Run - Unverified</p>
      <div className="grid">
        <div className="box">Model<br /><strong>mock-model</strong></div>
        <div className="box">Agent<br /><strong>mock</strong></div>
        <div className="box">Skill Hash<br /><strong>sha256:demo</strong></div>
        <div className="box">Safety Grade<br /><strong>A</strong></div>
      </div>
      <table>
        <tbody>
          {worlds.map(([world, score]) => (
            <tr key={world}>
              <td>{world}</td>
              <td>{score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
