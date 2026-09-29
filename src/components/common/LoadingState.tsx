interface LoadingStateProps {
  message: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  return (
    <div className="state-panel loading-state" role="status">
      <span className="loading-indicator" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}