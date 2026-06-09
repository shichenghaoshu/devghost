export default function MethodologyPage() {
  return (
    <main className="main">
      <h1>Benchmark Methodology</h1>
      <p className="lede">
        Scores compare vanilla, generic, and personalized conditions. Results are
        partitioned by model, agent, harness, task set, and budget.
      </p>
      <table>
        <tbody>
          <tr>
            <th>Metric</th>
            <th>Definition</th>
          </tr>
          <tr>
            <td>Personalization Lift</td>
            <td>Score(personalized) - Score(generic)</td>
          </tr>
          <tr>
            <td>Skill Lift</td>
            <td>Score(personalized) - Score(vanilla)</td>
          </tr>
          <tr>
            <td>Specificity Gap</td>
            <td>Score(personalized) - Score(cross_user)</td>
          </tr>
        </tbody>
      </table>
    </main>
  );
}
