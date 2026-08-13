import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MoreVertical,
  PersonStanding,
  Send,
  Smile,
  Swords,
} from 'lucide-react';
import character from '../assets/character.png';
import './GamePage.css';

const MODES = ['말싸움 모드', '끝말잇기', '밸런스 게임'];

const QUICK_REPLIES = ['너나 잘해 🤬', '어이없네 👋', '반박불가 🤐', '킹받네 🐔'];

function GamePage() {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [draft, setDraft] = useState('');

  return (
    <div className="screen game-screen">
      <header className="game-topbar">
        <button
          className="icon-btn"
          onClick={() => navigate('/main')}
          aria-label="뒤로가기"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="game-topbar-info">
          <img src={character} alt="" className="game-avatar" />
          <div>
            <p className="game-name">10년지기 친구 땅콩이</p>
            <p className="game-status">
              <span className="status-dot" />
              접속중...
            </p>
          </div>
        </div>
        <button className="icon-btn" aria-label="더보기">
          <MoreVertical size={18} />
        </button>
      </header>

      <div className="win-rate">
        <div className="win-rate-labels">
          <span>나의 승리</span>
          <span>땅콩이의 승리</span>
        </div>
        <div className="win-rate-bar">
          <div className="win-rate-fill mine" style={{ width: '55%' }} />
          <div className="win-rate-avatar">
            <PersonStanding size={16} />
          </div>
          <div className="win-rate-fill theirs" style={{ width: '45%' }} />
        </div>
      </div>

      <div className="mode-tabs">
        {MODES.map((mode, index) => (
          <button
            key={mode}
            className={`mode-tab${index === activeMode ? ' active' : ''}`}
            onClick={() => setActiveMode(index)}
          >
            {index === 0 ? '🔥 ' : ''}
            {mode}
          </button>
        ))}
      </div>

      <div className="chat-area">
        <div className="chat-date">오늘 오전 10:23</div>

        <div className="chat-row received">
          <img src={character} alt="" className="chat-avatar" />
          <div className="chat-col">
            <span className="chat-sender">땅콩이</span>
            <div className="chat-bubble bubble-received">
              그게 최선이야? ㅋㅋㅋ 어이가 없네 🔥
            </div>
          </div>
        </div>

        <div className="chat-row sent">
          <div className="chat-bubble bubble-sent">
            너 지금 나랑 장난해? 내가 어제 얼마나 고생했는데!
          </div>
        </div>

        <div className="attack-card">
          <p className="attack-label">땅콩이의 공격!</p>
          <div className="attack-box">
            <p className="attack-question">
              <Swords size={16} /> 이게 더 킹받는 상황은?
            </p>
            <button
              className={`attack-option${selectedOption === 0 ? ' selected' : ''}`}
              onClick={() => setSelectedOption(0)}
            >
              평생 라면만 먹기
              <span className="radio" />
            </button>
            <div className="attack-vs">VS</div>
            <button
              className={`attack-option${selectedOption === 1 ? ' selected' : ''}`}
              onClick={() => setSelectedOption(1)}
            >
              평생 치킨만 먹기
              <span className="radio" />
            </button>
          </div>
        </div>
      </div>

      <div className="quick-replies">
        {QUICK_REPLIES.map((reply) => (
          <button
            key={reply}
            className="quick-reply"
            onClick={() => setDraft(reply)}
          >
            {reply}
          </button>
        ))}
      </div>

      <div className="chat-input-bar">
        <div className="chat-input">
          <input
            type="text"
            placeholder="땅콩이에게 반박하기..."
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button className="emoji-btn" aria-label="이모지">
            <Smile size={18} />
          </button>
        </div>
        <button className="send-btn" aria-label="전송">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

export default GamePage;
