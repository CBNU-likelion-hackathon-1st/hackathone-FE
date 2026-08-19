import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import {
  ArrowLeft,
  MoreVertical,
  PersonStanding,
  Send,
  Smile,
  Swords,
} from 'lucide-react';
import character from '../assets/character.png';
import { ApiError, createGame, getGameResult, sendTurn } from './api';
import type {
  BalancePrompt,
  CreateGameResponse,
  GameMode,
  OpponentType,
  Score,
} from './types';
import './GamePage.css';

const MODE_LABELS: Record<GameMode, string> = {
  battle: '말싸움 모드',
  word_chain: '끝말잇기',
  balance: '밸런스 게임',
};

const MODE_ORDER: GameMode[] = ['battle', 'word_chain', 'balance'];

const DEFAULT_MAX_ROUNDS: Record<GameMode, number> = {
  battle: 5,
  word_chain: 5,
  balance: 3,
};

type ChatMessage = {
  id: string;
  from: 'ai' | 'me';
  text: string;
};

function isBalancePrompt(
  prompt: string | BalancePrompt | undefined,
): prompt is BalancePrompt {
  return typeof prompt === 'object' && prompt !== null;
}

function GamePage() {
  const navigate = useNavigate();
  const { gameId: routeGameId } = useParams<{ gameId: string }>();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [gameId, setGameId] = useState<string | null>(routeGameId ?? null);
  const [mode, setMode] = useState<GameMode>('battle');
  const [opponentName, setOpponentName] = useState('땅콩이');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [score, setScore] = useState<Score>({ me: 50, ai: 50 });
  const [round, setRound] = useState(1);
  const [maxRounds, setMaxRounds] = useState(5);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [nextPrompt, setNextPrompt] = useState<string | BalancePrompt | undefined>();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [ended, setEnded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [slowBoot, setSlowBoot] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messageIdRef = useRef(0);
  const nextMessageId = () => `m${messageIdRef.current++}`;

  useEffect(() => {
    let cancelled = false;
    let slowTimer: ReturnType<typeof setTimeout> | undefined;

    const initialData = location.state as
      | (CreateGameResponse & { gameId: string })
      | undefined;

    const applyInitialData = (data: CreateGameResponse) => {
      setGameId(data.gameId);
      setMode(data.mode);
      setOpponentName(data.opponent?.name ?? '땅콩이');
      setScore(data.score);
      setRound(data.round);
      setMaxRounds(data.maxRounds ?? DEFAULT_MAX_ROUNDS[data.mode]);
      setQuickReplies(data.quickReplies ?? []);
      setNextPrompt(data.nextPrompt);
      setMessages([{ id: nextMessageId(), from: 'ai', text: data.message }]);
      setEnded(false);
      setError(null);
      setLoading(false);
    };

    async function bootstrap() {
      setLoading(true);
      setSlowBoot(false);
      setError(null);
      slowTimer = setTimeout(() => {
        if (!cancelled) setSlowBoot(true);
      }, 6000);
      try {
        const modeParam = (searchParams.get('mode') as GameMode | null) ?? 'battle';
        const opponentParam =
          (searchParams.get('opponentType') as OpponentType | null) ?? 'boss';
        const data = await createGame(modeParam, opponentParam);
        if (cancelled) return;
        navigate(`/game/${data.gameId}`, { replace: true, state: data });
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : '게임을 시작하지 못했습니다.');
        setLoading(false);
      } finally {
        clearTimeout(slowTimer);
      }
    }

    if (routeGameId && initialData && initialData.gameId === routeGameId) {
      applyInitialData(initialData);
    } else {
      bootstrap();
    }

    return () => {
      cancelled = true;
      clearTimeout(slowTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeGameId]);

  async function finishGame(id: string) {
    setEnded(true);
    try {
      const result = await getGameResult(id);
      navigate('/result', { state: { result } });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '결과를 불러오지 못했습니다.');
    }
  }

  async function submitTurn(rawInput: string) {
    const input = rawInput.trim();
    if (!input || sending || ended || !gameId) return;

    setMessages((prev) => [...prev, { id: nextMessageId(), from: 'me', text: input }]);
    setDraft('');
    setSending(true);
    setError(null);

    try {
      const res = await sendTurn(gameId, input);
      setScore(res.score);
      setRound(res.round);
      if (res.quickReplies) setQuickReplies(res.quickReplies);
      setNextPrompt(res.nextPrompt);
      setMessages((prev) => [...prev, { id: nextMessageId(), from: 'ai', text: res.reply }]);

      const isOver = res.ended === true || (mode === 'balance' && !res.nextPrompt);
      if (isOver) {
        await finishGame(gameId);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '메시지 전송에 실패했습니다.');
    } finally {
      setSending(false);
    }
  }

  function handleFormSubmit(event: FormEvent) {
    event.preventDefault();
    submitTurn(draft);
  }

  if (loading) {
    return (
      <div className="screen game-screen">
        <div className="game-loading">
          <p>게임을 준비하고 있어요...</p>
          {slowBoot && (
            <p className="game-loading-sub">
              서버가 잠시 잠들어 있었나봐요. 첫 요청은 최대 1분 정도 걸릴 수 있어요.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error && !gameId) {
    return (
      <div className="screen game-screen">
        <div className="game-loading">
          <p>{error}</p>
          <button className="game-retry-btn" type="button" onClick={() => navigate(0)}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const total = score.me + score.ai || 1;
  const minePct = Math.round((score.me / total) * 100);
  const theirsPct = 100 - minePct;
  const balancePrompt = mode === 'balance' ? nextPrompt : undefined;

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
            <p className="game-name">{opponentName}</p>
            <p className="game-status">
              <span className="status-dot" />
              {ended ? '게임 종료' : sending ? '입력 중...' : '진행중...'}
            </p>
          </div>
        </div>
        <button className="icon-btn" aria-label="더보기">
          <MoreVertical size={18} />
        </button>
      </header>

      <div className="win-rate">
        <div className="round-indicator">
          ROUND {round} / {maxRounds}
        </div>
        <div className="win-rate-labels">
          <span>나의 승리</span>
          <span>{opponentName}의 승리</span>
        </div>
        <div className="win-rate-bar">
          <div className="win-rate-fill mine" style={{ width: `${minePct}%` }} />
          <div className="win-rate-avatar">
            <PersonStanding size={16} />
          </div>
          <div className="win-rate-fill theirs" style={{ width: `${theirsPct}%` }} />
        </div>
      </div>

      <div className="mode-tabs">
        {MODE_ORDER.map((m) => (
          <button
            key={m}
            className={`mode-tab${m === mode ? ' active' : ''}`}
            disabled
            title="게임 진행 중에는 모드를 변경할 수 없어요"
          >
            {m === mode ? '🔥 ' : ''}
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      <div className="chat-area">
        {messages.map((message) => (
          <div key={message.id} className={`chat-row ${message.from === 'ai' ? 'received' : 'sent'}`}>
            {message.from === 'ai' && <img src={character} alt="" className="chat-avatar" />}
            <div className="chat-col">
              {message.from === 'ai' && <span className="chat-sender">{opponentName}</span>}
              <div className={`chat-bubble ${message.from === 'ai' ? 'bubble-received' : 'bubble-sent'}`}>
                {message.text}
              </div>
            </div>
          </div>
        ))}

        {mode === 'word_chain' && typeof nextPrompt === 'string' && !ended && (
          <p className="turn-hint">'{nextPrompt}'로 시작하는 단어를 입력해보세요!</p>
        )}

        {isBalancePrompt(balancePrompt) && !ended && (
          <div className="attack-card">
            <p className="attack-label">{opponentName}의 질문!</p>
            <div className="attack-box">
              <p className="attack-question">
                <Swords size={16} /> {balancePrompt.question}
              </p>
              <button
                className="attack-option"
                onClick={() => submitTurn(balancePrompt.choices[0])}
                disabled={sending}
              >
                {balancePrompt.choices[0]}
                <span className="radio" />
              </button>
              <div className="attack-vs">VS</div>
              <button
                className="attack-option"
                onClick={() => submitTurn(balancePrompt.choices[1])}
                disabled={sending}
              >
                {balancePrompt.choices[1]}
                <span className="radio" />
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="error-banner">{error}</div>
        )}
      </div>

      {mode === 'battle' && quickReplies.length > 0 && (
        <div className="quick-replies">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              className="quick-reply"
              onClick={() => setDraft(reply)}
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {mode === 'balance' ? (
        <div className="chat-input-bar">
          <p className="balance-hint">위 선택지 중 하나를 골라주세요</p>
        </div>
      ) : (
        <form className="chat-input-bar" onSubmit={handleFormSubmit}>
          <div className="chat-input">
            <input
              type="text"
              placeholder={`${opponentName}에게 반박하기...`}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              disabled={sending || ended}
            />
            <button className="emoji-btn" type="button" aria-label="이모지">
              <Smile size={18} />
            </button>
          </div>
          <button
            className="send-btn"
            type="submit"
            aria-label="전송"
            disabled={sending || ended || !draft.trim()}
          >
            <Send size={18} />
          </button>
        </form>
      )}
    </div>
  );
}

export default GamePage;
