import type { ReactNode } from 'react';
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
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import character from '../assets/character.png';
import './HomePage.css';

type Opponent = {
  icon: ReactNode;
  tone: 'yellow' | 'pink' | 'red';
  title: string;
  tags: string[];
};

const opponents: Opponent[] = [
  {
    icon: <PersonStanding size={20} />,
    tone: 'yellow',
    title: '10년 지기 매운친구',
    tags: ['#매운맛', '#티키타카'],
  },
  {
    icon: <Briefcase size={20} />,
    tone: 'pink',
    title: '라떼는 말이야 직장상사',
    tags: ['#꼰대퇴치', '#격식'],
  },
];

const wideOpponent: Opponent = {
  icon: <Smile size={20} />,
  tone: 'red',
  title: '말 안 듣는 현실 남동생',
  tags: ['#킹받음', '#팩폭격'],
};

type HomePageProps = {
  onStart: () => void;
};

function HomePage({ onStart }: HomePageProps) {
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

          <div className="opponent-grid">
            {opponents.map((opponent) => (
              <OpponentCard key={opponent.title} {...opponent} />
            ))}
          </div>

          <OpponentCard {...wideOpponent} wide />
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

        <button className="start-btn" type="button" onClick={onStart}>
          <Gamepad2 size={20} />
          게임 시작하기
        </button>
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
  icon,
  tone,
  title,
  tags,
  wide,
}: Opponent & { wide?: boolean }) {
  return (
    <div className={`opponent-card${wide ? ' wide' : ''}`}>
      <div className={`opponent-icon tone-${tone}`}>{icon}</div>
      <div className="opponent-body">
        <p className="opponent-title">{title}</p>
        <div className="opponent-tags">
          {tags.map((tag) => (
            <span key={tag} className="opponent-tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
