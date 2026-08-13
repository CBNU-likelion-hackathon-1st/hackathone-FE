import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import MainPage from './main/MainPage';
import GamePage from './game/GamePage';
import ResultPage from './result/ResultPage';

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <div className="device-frame">
          <Routes>
            <Route path="/" element={<Navigate to="/main" replace />} />
            <Route path="/main" element={<MainPage />} />
            <Route path="/game" element={<GamePage />} />
            <Route path="/result" element={<ResultPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
