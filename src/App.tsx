import { useRef } from 'react';
import TheVoid from './components/TheVoid';
import { type HUDRef } from './components/HUD';

function App() {
  const hudRef = useRef<HUDRef>(null);

  return (
    <main className="w-full h-screen relative bg-void text-ink-high overflow-hidden">
      <TheVoid hudRef={hudRef} />
      {/* <HUD ref={hudRef} /> */}
    </main>
  )
}

export default App
