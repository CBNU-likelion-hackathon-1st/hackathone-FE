import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Award,
  BarChart3,
  House,
  Medal,
  Quote,
  RotateCcw,
  Settings,
  Share2,
  Trophy,
  User,
} from 'lucide-react';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import character from '../assets/character.png';
import { ResultApiError, getGameResult, type GameResult } from './api';
import './ResultPage.css';

const METRIC_LABELS: Record<string, string> = {
  logic: '논리력',
  impact: '타격감',
  flow: '티키타카 유지력',
  angerPenalty: '분노 감점',
  completedRounds: '완료 라운드',
  violations: '규칙 위반',
  wordCount: '사용 단어 수',
  longestWordLength: '최장 단어 길이',
  agreement: '취향 일치도',
  difference: '취향 차이',
};

const BATTLE_METRIC_ORDER = ['logic', 'impact', 'flow'];

type ResultViewModel = {
  badgeLabel: string;
  heading: string;
  badgeTone: 'winner' | 'loser' | 'draw';
  score: number;
  opponentName: string;
  analysisItems: { label: string; value: number; barValue: number }[];
  highlight: string;
  reason?: string;
};

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, value));
}

function formatMetricLabel(key: string) {
  return METRIC_LABELS[key] ?? key;
}

function toAnalysisItems(result: GameResult) {
  const metricKeys =
    result.mode === 'battle'
      ? BATTLE_METRIC_ORDER.filter((key) => result.metrics[key] !== undefined)
      : Object.keys(result.metrics);

  return metricKeys.map((key) => {
    const value = result.metrics[key];

    return {
      label: formatMetricLabel(key),
      value,
      barValue: clampPercent(value),
    };
  });
}

function toResultViewModel(result: GameResult): ResultViewModel {
  const badgeByWinner: Record<GameResult['winner'], ResultViewModel['badgeLabel']> = {
    me: 'WINNER',
    ai: 'LOSE',
    draw: 'DRAW',
  };
  const fallbackHeading: Record<GameResult['winner'], string> = {
    me: '통쾌한 승리!',
    ai: '아쉬운 패배!',
    draw: '막상막하 무승부!',
  };

  return {
    badgeLabel: badgeByWinner[result.winner],
    heading: result.title || fallbackHeading[result.winner],
    badgeTone:
      result.winner === 'me' ? 'winner' : result.winner === 'ai' ? 'loser' : 'draw',
    score: result.finalScore,
    opponentName: result.opponentName ?? '땅콩이',
    analysisItems: toAnalysisItems(result),
    highlight: result.bestLine || '오늘의 명장면이 아직 없어요.',
    reason: result.reason,
  };
}

function ResultPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<GameResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadResult = async () => {
      await Promise.resolve();

      if (cancelled) return;

      if (!id?.trim()) {
        setResult(null);
        setError('결과 id가 없어 결과를 조회할 수 없어요.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');
        const nextResult = await getGameResult(id);

        if (cancelled) return;

        setResult(nextResult);
      } catch (err) {
        if (cancelled) return;

        setResult(null);
        setError(
          err instanceof ResultApiError
            ? err.message
            : '결과를 불러오지 못했어요.',
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadResult();

    return () => {
      cancelled = true;
    };
  }, [id, retryCount]);

  const retryLoadResult = () => {
    if (!isLoading) {
      setRetryCount((count) => count + 1);
    }
  };

  const viewModel = useMemo(
    () => (result ? toResultViewModel(result) : null),
    [result],
  );

  return (
    <div className="screen result-screen">
      <TopBar
        left={
          <button
            className="icon-btn"
            onClick={() => navigate('/main')}
            aria-label="홈으로"
          >
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
        {isLoading && (
          <div className="result-state-card">
            <Trophy size={28} />
            <p>결과를 불러오고 있어요...</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="result-state-card error">
            <p>{error}</p>
            <button className="rematch-btn" type="button" onClick={retryLoadResult}>
              다시 시도
            </button>
          </div>
        )}

        {!isLoading && viewModel && (
          <>
            <div className={`winner-badge ${viewModel.badgeTone}`}>
              <Medal size={14} /> {viewModel.badgeLabel}
            </div>
            <h2 className="result-heading">{viewModel.heading}</h2>

            <div className="result-card">
              <div className="result-mascot">
                <img src={character} alt={viewModel.opponentName} />
              </div>
              <div className="score-pill">
                <span className="score-label">최종 점수</span>
                <span className="score-value">
                  {viewModel.score}
                  <span className="score-total"> / 100</span>
                </span>
              </div>
            </div>

            {viewModel.analysisItems.length > 0 && (
              <div className="analysis-card">
                <h3 className="analysis-title">
                  <BarChart3 size={16} /> 상세 분석
                </h3>
                {viewModel.analysisItems.map((stat) => (
                  <div className="analysis-row" key={stat.label}>
                    <div className="analysis-row-head">
                      <span>{stat.label}</span>
                      <span>{stat.value}</span>
                    </div>
                    <div className="analysis-bar">
                      <div
                        className="analysis-bar-fill"
                        style={{ width: `${stat.barValue}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="highlight-section">
              <p className="highlight-label">
                <Quote size={14} /> 오늘의 명장면
              </p>
              <div className="highlight-quote">"{viewModel.highlight}"</div>
              {viewModel.reason && (
                <p className="result-reason">{viewModel.reason}</p>
              )}
            </div>

            <button
              className="rematch-btn"
              type="button"
              onClick={() => navigate('/main')}
            >
              <RotateCcw size={18} /> 다시 겨루기
            </button>
            <button className="share-btn" type="button">
              <Share2 size={16} /> 친구에게 결과 공유하기
            </button>
          </>
        )}
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
