export default function DashboardLoading() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-muted rounded w-1/3"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-xl"></div>
          ))}
        </div>
        <div className="h-64 bg-muted rounded-xl"></div>
      </div>
    </div>
  );
}
