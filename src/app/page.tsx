export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full space-y-4">
      <div className="text-4xl">📚</div>
      <h1 className="text-2xl font-bold tracking-tight">University Portal</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Select a course and a file from the sidebar to view your materials.
      </p>
    </div>
  );
}
