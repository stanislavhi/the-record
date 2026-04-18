import TheVoid from './components/TheVoid';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <main className="w-full h-screen relative bg-void text-ink-high overflow-hidden transition-base duration-300">
      <ErrorBoundary>
        <TheVoid />
      </ErrorBoundary>
    </main>
  );
}

export default App;
