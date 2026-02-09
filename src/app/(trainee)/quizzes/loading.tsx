export default function QuizzesLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <div className="h-4 w-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
      <div className="flex gap-2">
        <div className="h-10 flex-1 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-10 w-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-10 w-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
