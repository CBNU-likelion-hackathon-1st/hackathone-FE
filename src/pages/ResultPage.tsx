import {
  Award,
  BarChart3,
  House,
  Medal,
  Quote,
  RotateCcw,
  Settings,
  Share2,
  User,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import character from '../assets/character.png';
import './ResultPage.css';

const STATS = [
  { label: '논리력', value: 90 },
  { label: '타격감', value: 82 },
  { label: '티키타카 유지력', value: 88 },
];

type ResultPageProps = {
  onHome: () => void;
  onRematch: () => void;
};

function ResultPage({ onHome, onRematch }: ResultPageProps) {
  return (
    <div className="screen result-screen">
      <TopBar
        left={
          <button className="icon-btn" onClick={onHome} aria-label="홈으로">
            <House size={18} />
          </button>
        }
        title="말싸움 땅콩"
        right={
          <button className="icon-btn" aria-label="설정">
            <Settings size={18} />
          </button>
        }
      />

      <div className="result-content">
        <div className="winner-badge">
          <Medal size={14} /> WINNER
        </div>
        <h2 className="result-heading">통쾌한 승리!</h2>

        <div className="result-card">
          <div className="result-mascot">
            <img src={character} alt="땅콩이" />
          </div>
          <div className="score-pill">
            <span className="score-label">최종 점수</span>
            <span className="score-value">
              85 <span className="score-total">/ 100</span>
            </span>
          </div>
        </div>

        <div className="analysis-card">
          <h3 className="analysis-title">
            <BarChart3 size={16} /> 상세 분석
          </h3>
          {STATS.map((stat) => (
            <div className="analysis-row" key={stat.label}>
              <div className="analysis-row-head">
                <span>{stat.label}</span>
                <span>{stat.value}</span>
              </div>
              <div className="analysis-bar">
                <div
                  className="analysis-bar-fill"
                  style={{ width: `${stat.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="highlight-section">
          <p className="highlight-label">
            <Quote size={14} /> 오늘의 명장면
          </p>
          <div className="highlight-quote">
            "그게 최선이야? ㅋㅋㅋ 어이가 없네 🤙"
          </div>
        </div>

        <button className="rematch-btn" type="button" onClick={onRematch}>
          <RotateCcw size={18} /> 다시 겨루기
        </button>
        <button className="share-btn" type="button">
          <Share2 size={16} /> 친구에게 승리 결과 공유하기
        </button>
      </div>

      <BottomNav
        activeKey="home"
        items={[
          { key: 'home', label: '홈', icon: <House /> },
          { key: 'record', label: '기록', icon: <Award /> },
          { key: 'ranking', label: '랭킹', icon: <BarChart3 /> },
          { key: 'profile', label: '프로필', icon: <User /> },
        ]}
      />
    </div>
  );
}

export default ResultPage;
