export interface PlaceholderProps {
  message?: string;
}

export function Placeholder({ message = 'Hello from Storybook 👋' }: PlaceholderProps) {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Secret Traitor</h1>
      <p style={{ color: '#666' }}>{message}</p>
    </div>
  );
}
