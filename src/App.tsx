import { useState } from 'react';
import './App.css';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import ResultPage from './pages/ResultPage';

type Screen = 'home' | 'game' | 'result';

const SCREEN_LABELS: Record<Screen, string> = {
  home: '홈',
  game: '게임',
  result: '결과',
};

function App() {
  const [screen, setScreen] = useState<Screen>('home');

  return (
    <div className="app-shell">
      {/* 백엔드 연동 전 화면 검토용 임시 스위처 */}
      <div className="preview-switcher">
        {(Object.keys(SCREEN_LABELS) as Screen[]).map((key) => (
          <button
            key={key}
            className={key === screen ? 'active' : ''}
            onClick={() => setScreen(key)}
          >
            {SCREEN_LABELS[key]}
          </button>
        ))}
      </div>

      <div className="device-frame">
        {screen === 'home' && <HomePage onStart={() => setScreen('game')} />}
        {screen === 'game' && <GamePage onBack={() => setScreen('home')} />}
        {screen === 'result' && (
          <ResultPage
            onHome={() => setScreen('home')}
            onRematch={() => setScreen('game')}
          />
        )}
      </div>
    </div>
  );
}

export default App;
