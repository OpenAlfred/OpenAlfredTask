export default function NotFound() {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <p className="text-sm font-semibold text-primary">404</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Task not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">We couldn&apos;t find that task.</p>
    </div>
  );
}
