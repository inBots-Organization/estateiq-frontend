export default function AssessmentLoading() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-muted rounded w-2/3 mx-auto"></div>
        <div className="h-6 bg-muted rounded w-1/2 mx-auto"></div>
        <div className="h-64 bg-muted rounded-2xl"></div>
        <div className="h-12 bg-muted rounded-xl w-1/3 mx-auto"></div>
      </div>
    </div>
  );
}
