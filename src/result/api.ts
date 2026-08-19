export type GameMode = 'battle' | 'balance' | 'word_chain';

export type Winner = 'me' | 'ai' | 'draw';

export type GameResult = {
  mode: GameMode;
  opponentType?: string;
  opponentName?: string;
  winner: Winner;
  title: string;
  finalScore: number;
  metrics: Record<string, number>;
  bestLine?: string;
  reason?: string;
};

type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
  };
};

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';

export class ResultApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ResultApiError';
    this.status = status;
    this.code = code;
  }
}

export async function getGameResult(gameId: string) {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/games/${gameId}/result`);
  } catch {
    throw new ResultApiError(
      '서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.',
      0,
    );
  }

  const data = (await response.json().catch(() => null)) as
    | GameResult
    | ApiErrorBody
    | null;

  if (!response.ok) {
    const message =
      data && 'error' in data && data.error?.message
        ? data.error.message
        : `결과를 불러오지 못했어요. (${response.status})`;

    throw new ResultApiError(
      message,
      response.status,
      data && 'error' in data ? data.error?.code : undefined,
    );
  }

  if (!data || !('winner' in data) || !('finalScore' in data)) {
    throw new ResultApiError('결과 응답 형식이 올바르지 않아요.', response.status);
  }

  return data;
}
