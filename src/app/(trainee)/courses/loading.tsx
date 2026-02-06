export default function CoursesLoading() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-muted rounded w-1/4"></div>
        <div className="h-6 bg-muted rounded w-1/2"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-muted rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
