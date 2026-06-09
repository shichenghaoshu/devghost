export default function TasksPage() {
  const tasks = ["Bug Cave", "Repository Maze", "Feature Forge", "Legacy City"];
  return (
    <main className="main">
      <h1>Public Task Explorer</h1>
      <div className="grid">
        {tasks.map((task) => (
          <section className="box" key={task}>
            <h2>{task}</h2>
            <p className="muted">Public fixture task for Local Arena demos.</p>
          </section>
        ))}
      </div>
    </main>
  );
}
