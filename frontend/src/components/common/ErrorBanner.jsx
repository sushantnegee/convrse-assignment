export default function ErrorBanner({ message, onRetry }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center text-white/80">
      <p className="max-w-sm text-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold hover:bg-white/20"
        >
          Retry
        </button>
      )}
    </div>
  );
}
