import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  ChevronRight,
  Gamepad2,
  History,
  House,
  MessageSquarePlus,
  PersonStanding,
  Settings,
  ShoppingBag,
  Smile,
  User,
} from 'lucide-react';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import character from '../assets/character.png';
import './MainPage.css';

type BattleOpponent = {
  type: ApiOpponentType;
  name: string;
  description: string;
  tags: string[];
};

type OpponentCardModel = BattleOpponent & {
  icon: ReactNode;
  tone: 'yellow' | 'pink' | 'red';
};

type GameMode = 'argument' | 'wordchain' | 'balance';
type ApiGameMode = 'battle' | 'word_chain' | 'balance';
type ApiOpponentType = 'boss' | 'older_brother' | 'ex';

type GameStartResponse = {
  gameId: string;
  mode: ApiGameMode;
  status: string;
  round: number;
  maxRounds?: number;
  score: {
    me: number;
    ai: number;
  };
  opponent?: {
    type: string;
    name: string;
  };
  message: string;
  quickReplies?: string[];
  nextPrompt?: string | {
    id?: string;
    question: string;
    choices: string[];
  };
  wordHistory?: string[];
};

type GameStartErrorResponse = {
  error?: {
    message?: string;
  };
};

type BattleOpponentsResponse = {
  opponents: BattleOpponent[];
  count: number;
};

const gameModes: { value: GameMode; label: string }[] = [
  { value: 'argument', label: '말싸움' },
  { value: 'wordchain', label: '끝말잇기' },
  { value: 'balance', label: '밸런스 게임' },
];

const GAME_MODE_TO_API_MODE: Record<GameMode, ApiGameMode> = {
  argument: 'battle',
  wordchain: 'word_chain',
  balance: 'balance',
};

const fallbackOpponents: BattleOpponent[] = [
  {
    type: 'boss',
    name: '직장 상사',
    description: '라떼는 말이야 직장 상사',
    tags: ['꼰대퇴치', '격식'],
  },
  {
    type: 'older_brother',
    name: '형',
    description: '잔소리 만렙 현실 형',
    tags: ['형제배틀', '반말'],
  },
  {
    type: 'ex',
    name: '전애인',
    description: '할 말 많은 전애인',
    tags: ['미련없음', '팩트폭격'],
  },
];

const API_BASE_URL =
  import.meta.env.DEV
    ? ''
    : (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ||
      'https://ddangkongi-api.onrender.com';

function getOpponentCardMeta(type: ApiOpponentType) {
  const meta: Record<
    ApiOpponentType,
    { icon: ReactNode; tone: OpponentCardModel['tone'] }
  > = {
    boss: { icon: <Briefcase size={20} />, tone: 'pink' },
    older_brother: { icon: <PersonStanding size={20} />, tone: 'yellow' },
    ex: { icon: <Smile size={20} />, tone: 'red' },
  };

  return meta[type];
}

function toOpponentCards(opponents: BattleOpponent[]) {
  return opponents.map((opponent) => ({
    ...opponent,
    ...getOpponentCardMeta(opponent.type),
  }));
}

async function fetchBattleOpponents() {
  const response = await fetch(`${API_BASE_URL}/api/battle/opponents`);
  const data = (await response.json().catch(() => null)) as
    | BattleOpponentsResponse
    | GameStartErrorResponse
    | null;

  if (!response.ok) {
    const message =
      data && 'error' in data && data.error?.message
        ? data.error.message
        : '상대 목록을 불러오지 못했어요.';

    throw new Error(message);
  }

  if (!data || !('opponents' in data) || data.opponents.length === 0) {
    throw new Error('상대 목록이 비어 있어요.');
  }

  return data.opponents;
}

async function startGameSession({
  gameMode,
  opponentType,
}: {
  gameMode: GameMode;
  opponentType: ApiOpponentType;
}) {
  const apiMode = GAME_MODE_TO_API_MODE[gameMode];
  const body: { mode: ApiGameMode; opponentType?: ApiOpponentType } = {
    mode: apiMode,
  };

  if (apiMode === 'battle') {
    body.opponentType = opponentType;
  }

  const response = await fetch(`${API_BASE_URL}/api/games`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => null)) as
    | GameStartResponse
    | GameStartErrorResponse
    | null;

  if (!response.ok) {
    const message =
      data && 'error' in data && data.error?.message
        ? data.error.message
        : '게임 시작에 실패했어요. 잠시 후 다시 시도해 주세요.';

    throw new Error(message);
  }

  if (!data || !('gameId' in data) || !data.gameId) {
    throw new Error('게임 시작 응답을 확인할 수 없어요.');
  }

  return data;
}

function MainPage() {
  const navigate = useNavigate();
  const [gameMode, setGameMode] = useState<GameMode>('argument');
  const [opponents, setOpponents] = useState<BattleOpponent[]>(fallbackOpponents);
  const [selectedOpponentType, setSelectedOpponentType] =
    useState<ApiOpponentType>('boss');
  const [opponentsError, setOpponentsError] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState('');

  useEffect(() => {
    let ignore = false;

    const loadOpponents = async () => {
      try {
        const nextOpponents = await fetchBattleOpponents();

        if (ignore) return;

        setOpponents(nextOpponents);
        setSelectedOpponentType(nextOpponents[0].type);
        setOpponentsError('');
      } catch (error) {
        if (ignore) return;

        setOpponentsError(
          error instanceof Error
            ? error.message
            : '상대 목록을 불러오지 못했어요.',
        );
      }
    };

    void loadOpponents();

    return () => {
      ignore = true;
    };
  }, []);

  const handleStartGame = async () => {
    if (isStarting) return;

    setStartError('');

    if (!gameMode || !selectedOpponentType) {
      setStartError('게임 모드와 상대를 모두 선택해 주세요.');
      return;
    }

    try {
      setIsStarting(true);

      const selectedOpponent = opponents.find(
        (opponent) => opponent.type === selectedOpponentType,
      );

      if (!selectedOpponent) {
        setStartError('선택한 상대 정보를 찾을 수 없어요.');
        return;
      }

      const gameStart = await startGameSession({
        gameMode,
        opponentType: selectedOpponent.type,
      });

      navigate(`/game/${gameStart.gameId}`, {
        state: {
          ...gameStart,
          opponent:
            gameStart.opponent ??
            (gameMode === 'argument'
              ? { type: selectedOpponent.type, name: selectedOpponent.name }
              : undefined),
        },
      });
    } catch (error) {
      setStartError(
        error instanceof Error
          ? error.message
          : '게임 시작에 실패했어요. 잠시 후 다시 시도해 주세요.',
      );
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="screen home-screen">
      <TopBar
        left={
          <button className="avatar-btn" aria-label="내 프로필">
            <User size={18} />
          </button>
        }
        title="말싸움 땅콩"
        right={
          <button className="icon-btn" aria-label="설정">
            <Settings size={18} />
          </button>
        }
      />

      <div className="home-content">
        <div className="mascot-card">
          <img src={character} alt="땅콩이" />
        </div>

        <h2 className="home-heading">
          오늘 누구랑
          <br />
          한판 붙어볼까?
        </h2>

        <section className="opponent-section">
          <h3 className="section-label">상대 고르기</h3>

          {opponentsError && (
            <p className="opponent-error" role="status">
              {opponentsError} 기본 상대 목록으로 표시할게요.
            </p>
          )}

          <div className="opponent-grid">
            {toOpponentCards(opponents).map((opponent, index) => (
              <OpponentCard
                key={opponent.type}
                {...opponent}
                wide={index === 2}
                selected={opponent.type === selectedOpponentType}
                onSelect={setSelectedOpponentType}
              />
            ))}
          </div>
        </section>

        <section className="game-mode-section">
          <h3 className="section-label">어떤 게임으로 붙어볼까?</h3>

          <div className="game-mode-buttons" role="group" aria-label="게임 종류 선택">
            {gameModes.map((mode) => {
              const selected = mode.value === gameMode;

              return (
                <button
                  key={mode.value}
                  className={`game-mode-btn${selected ? ' selected' : ''}`}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setGameMode(mode.value)}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>
        </section>

        <button className="custom-cta" type="button">
          <span className="cta-icon">
            <MessageSquarePlus size={20} />
          </span>
          <span className="cta-text">
            <span className="cta-text-sub">+ 내 지인 대화내용(카톡) 불러와서</span>
            <span className="cta-text-main">맞춤 땅콩이 만들기</span>
          </span>
          <ChevronRight size={18} className="cta-chevron" />
        </button>

        <button
          className="start-btn"
          type="button"
          onClick={handleStartGame}
          disabled={isStarting}
        >
          <Gamepad2 size={20} />
          {isStarting ? '게임 준비 중...' : '게임 시작하기'}
        </button>

        {startError && (
          <p className="start-error" role="alert">
            {startError}
          </p>
        )}
      </div>

      <BottomNav
        activeKey="home"
        items={[
          { key: 'home', label: '홈', icon: <House /> },
          { key: 'history', label: '대결기록', icon: <History /> },
          { key: 'shop', label: '상점', icon: <ShoppingBag /> },
          { key: 'profile', label: '내 정보', icon: <User /> },
        ]}
      />
    </div>
  );
}

function OpponentCard({
  type,
  icon,
  tone,
  name,
  description,
  tags,
  wide,
  selected,
  onSelect,
}: OpponentCardModel & {
  wide?: boolean;
  selected: boolean;
  onSelect: (opponentType: ApiOpponentType) => void;
}) {
  return (
    <button
      className={`opponent-card${wide ? ' wide' : ''}${selected ? ' selected' : ''}`}
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(type)}
    >
      <div className={`opponent-icon tone-${tone}`}>{icon}</div>
      <div className="opponent-body">
        <p className="opponent-title">{description || name}</p>
        <div className="opponent-tags">
          {tags.map((tag) => (
            <span key={tag} className="opponent-tag">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

export default MainPage;
