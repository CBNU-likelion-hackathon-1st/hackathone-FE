import type {
  CreateGameResponse,
  GameMode,
  GameResult,
  OpponentType,
  TurnResponse,
} from './types';

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ||
  'https://ddangkongi-api.onrender.com';

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  } catch {
    throw new ApiError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.', 0);
  }

  if (!res.ok) {
    let message = `요청에 실패했습니다. (${res.status})`;
    let code: string | undefined;
    try {
      const body = (await res.json()) as { error?: { code?: string; message?: string } };
      if (body?.error?.message) message = body.error.message;
      code = body?.error?.code;
    } catch {
      // 응답 본문이 JSON이 아닌 경우 기본 메시지를 사용한다.
    }
    throw new ApiError(message, res.status, code);
  }

  return res.json() as Promise<T>;
}

export function createGame(mode: GameMode, opponentType?: OpponentType) {
  const body = mode === 'battle' ? { mode, opponentType } : { mode };
  return request<CreateGameResponse>('/api/games', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function sendTurn(gameId: string, input: string) {
  return request<TurnResponse>(`/api/games/${gameId}/turn`, {
    method: 'POST',
    body: JSON.stringify({ input }),
  });
}

export function getGameResult(gameId: string) {
  return request<GameResult>(`/api/games/${gameId}/result`);
}
