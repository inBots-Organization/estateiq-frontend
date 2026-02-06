export default function VoiceTrainingLoading() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-muted rounded w-1/3"></div>
        <div className="h-6 bg-muted rounded w-2/3"></div>
        <div className="h-80 bg-muted rounded-xl"></div>
      </div>
    </div>
  );
}
