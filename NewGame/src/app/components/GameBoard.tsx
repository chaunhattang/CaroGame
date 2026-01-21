import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Cell } from "./Cell";
import { RotateCcw, Home } from "lucide-react";

type CellValue = "X" | "O" | null;
type Board = CellValue[][];
type GameMode = "ai" | "2player";
type GameStatus = "playing" | "win" | "draw";

interface GameBoardProps {
  mode: GameMode;
  onBackToHome: () => void;
}

const BOARD_SIZE = 15;
const WIN_LENGTH = 5;

// ----- TUNEABLE CONSTANTS -----
const AI_DEPTH_MAX = 4; // max depth AI sẽ cố gắng
const BEAM_WIDTH = 12; // chỉ duyệt top K nước sau khi sắp xếp (giảm branching)
const EARLY_GAME_THRESHOLD = 8; // nếu đã đi < n nước -> chơi nông hơn
const MID_GAME_THRESHOLD = 28; // trung game -> depth trung bình
const AI_THINK_DELAY_MS = 220; // độ trễ khi AI 'suy nghĩ' (cho cảm giác), giảm cho phản hồi nhanh
// -----------------------------

// Hướng kiểm tra: ngang, dọc, chéo phải, chéo trái
const DIRECTIONS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

export function GameBoard({ mode, onBackToHome }: GameBoardProps) {
  const [board, setBoard] = useState<Board>(() =>
    Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(null)),
  );
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X");
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [winningCells, setWinningCells] = useState<[number, number][]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<[number, number] | null>(null);

  // Transposition cache (key -> value). useRef to persist across renders without re-creating
  const transpositionRef = useRef<Map<string, number>>(new Map());

  // Utility: board -> key
  const boardToKey = (b: Board) => b.map((r) => r.map((c) => (c === null ? "." : c)).join("")).join("|");

  // Count moves played (for dynamic depth)
  const movesPlayed = useMemo(() => board.flat().filter(Boolean).length, [board]);

  // -------------------------
  // WIN / DRAW / MOVES HELPERS
  // -------------------------
  const checkWin = useCallback((board: Board, row: number, col: number, player: "X" | "O"): [number, number][] | null => {
    for (const [dx, dy] of DIRECTIONS) {
      const cells: [number, number][] = [[row, col]];

      for (let i = 1; i < WIN_LENGTH; i++) {
        const newRow = row + dx * i;
        const newCol = col + dy * i;
        if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE || board[newRow][newCol] !== player) {
          break;
        }
        cells.push([newRow, newCol]);
      }

      for (let i = 1; i < WIN_LENGTH; i++) {
        const newRow = row - dx * i;
        const newCol = col - dy * i;
        if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE || board[newRow][newCol] !== player) {
          break;
        }
        cells.push([newRow, newCol]);
      }

      if (cells.length >= WIN_LENGTH) {
        return cells;
      }
    }
    return null;
  }, []);

  const checkDraw = useCallback((board: Board): boolean => {
    return board.every((row) => row.every((cell) => cell !== null));
  }, []);

  const getRelevantMoves = useCallback((board: Board): [number, number][] => {
    const moves: Set<string> = new Set();
    const hasAnyMove = board.some((row) => row.some((cell) => cell !== null));

    if (!hasAnyMove) {
      return [[Math.floor(BOARD_SIZE / 2), Math.floor(BOARD_SIZE / 2)]];
    }

    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (board[i][j] !== null) {
          for (let di = -2; di <= 2; di++) {
            for (let dj = -2; dj <= 2; dj++) {
              const ni = i + di;
              const nj = j + dj;
              if (ni >= 0 && ni < BOARD_SIZE && nj >= 0 && nj < BOARD_SIZE && board[ni][nj] === null) {
                moves.add(`${ni},${nj}`);
              }
            }
          }
        }
      }
    }

    return Array.from(moves).map((key) => {
      const [i, j] = key.split(",").map(Number);
      return [i, j] as [number, number];
    });
  }, []);

  // -------------------------
  // EVALUATION (HEURISTIC)
  // -------------------------
  const evaluateBoard = useCallback((board: Board, player: "X" | "O"): number => {
    let score = 0;
    const opponent = player === "X" ? "O" : "X";

    // small preference for center control
    const center = (BOARD_SIZE - 1) / 2;
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (board[i][j] === null) continue;

        const owner = board[i][j];
        // center proximity adds small bonus
        const distToCenter = Math.abs(i - center) + Math.abs(j - center);
        const centerBonus = Math.max(0, (BOARD_SIZE - distToCenter) / BOARD_SIZE);

        for (const [dx, dy] of DIRECTIONS) {
          let count = 1;
          let openEnds = 0;

          // forward
          let k = 1;
          while (i + dx * k >= 0 && i + dx * k < BOARD_SIZE && j + dy * k >= 0 && j + dy * k < BOARD_SIZE && board[i + dx * k][j + dy * k] === board[i][j]) {
            count++;
            k++;
          }
          if (i + dx * k >= 0 && i + dx * k < BOARD_SIZE && j + dy * k >= 0 && j + dy * k < BOARD_SIZE && board[i + dx * k][j + dy * k] === null) {
            openEnds++;
          }

          // backward
          k = 1;
          while (i - dx * k >= 0 && i - dx * k < BOARD_SIZE && j - dy * k >= 0 && j - dy * k < BOARD_SIZE && board[i - dx * k][j - dy * k] === board[i][j]) {
            count++;
            k++;
          }
          if (i - dx * k >= 0 && i - dx * k < BOARD_SIZE && j - dy * k >= 0 && j - dy * k < BOARD_SIZE && board[i - dx * k][j - dy * k] === null) {
            openEnds++;
          }

          const sign = owner === player ? 1 : -1;

          if (count >= 5) {
            score += sign * 100000;
          } else if (count === 4) {
            score += sign * openEnds * 2000;
          } else if (count === 3) {
            score += sign * openEnds * 300;
          } else if (count === 2) {
            score += sign * openEnds * 30;
          }

          // small center preference
          score += sign * centerBonus * 5;
        }
      }
    }

    return score;
  }, []);

  // -------------------------
  // MINIMAX + ALPHA-BETA + TRANS TABLE + MOVE ORDERING
  // -------------------------
  const getAIDepth = useCallback(() => {
    if (movesPlayed < EARLY_GAME_THRESHOLD) return 2;
    if (movesPlayed < MID_GAME_THRESHOLD) return Math.min(3, AI_DEPTH_MAX);
    return AI_DEPTH_MAX;
  }, [movesPlayed]);

  // minimax returns numeric evaluation
  const minimax = useCallback(
    (board: Board, depth: number, alpha: number, beta: number, isMaximizing: boolean, player: "X" | "O"): number => {
      const key = `${boardToKey(board)}|d${depth}|m${isMaximizing ? 1 : 0}|p${player}`;
      const trans = transpositionRef.current;
      if (trans.has(key)) {
        return trans.get(key)!;
      }

      // terminal / depth 0
      if (depth === 0) {
        const val = evaluateBoard(board, player);
        trans.set(key, val);
        return val;
      }

      // generate & order moves
      let moves = getRelevantMoves(board);

      // move ordering (fast heuristic): score each candidate by placing player's piece and evaluating shallowly
      const scored = moves.map(([i, j]) => {
        board[i][j] = isMaximizing ? player : player === "X" ? "O" : "X";
        const s = evaluateBoard(board, player);
        board[i][j] = null;
        return { move: [i, j] as [number, number], score: s };
      });

      // For maximizing, sort desc; minimizing, sort asc
      scored.sort((a, b) => (isMaximizing ? b.score - a.score : a.score - b.score));
      // beam prune - keep only top K
      const limited = scored.slice(0, BEAM_WIDTH);

      if (isMaximizing) {
        let maxEval = -Infinity;
        for (const { move } of limited) {
          const [i, j] = move;
          board[i][j] = player;

          // immediate win check
          if (checkWin(board, i, j, player)) {
            board[i][j] = null;
            trans.set(key, 100000);
            return 100000;
          }

          const evalScore = minimax(board, depth - 1, alpha, beta, false, player);
          board[i][j] = null;

          maxEval = Math.max(maxEval, evalScore);
          alpha = Math.max(alpha, evalScore);
          if (beta <= alpha) break;
        }
        trans.set(key, maxEval);
        return maxEval;
      } else {
        let minEval = Infinity;
        const opponent = player === "X" ? "O" : "X";
        for (const { move } of limited) {
          const [i, j] = move;
          board[i][j] = opponent;

          // immediate lose check
          if (checkWin(board, i, j, opponent)) {
            board[i][j] = null;
            trans.set(key, -100000);
            return -100000;
          }

          const evalScore = minimax(board, depth - 1, alpha, beta, true, player);
          board[i][j] = null;

          minEval = Math.min(minEval, evalScore);
          beta = Math.min(beta, evalScore);
          if (beta <= alpha) break;
        }
        trans.set(key, minEval);
        return minEval;
      }
    },
    [evaluateBoard, getRelevantMoves, checkWin],
  );

  // find best move uses heuristics + minimax
  const findBestMove = useCallback(
    (board: Board, player: "X" | "O"): [number, number] | null => {
      // immediate win / immediate block - very cheap and highest priority
      const moves = getRelevantMoves(board);
      const opponent = player === "X" ? "O" : "X";

      for (const [i, j] of moves) {
        board[i][j] = player;
        if (checkWin(board, i, j, player)) {
          board[i][j] = null;
          return [i, j];
        }
        board[i][j] = null;
      }
      for (const [i, j] of moves) {
        board[i][j] = opponent;
        if (checkWin(board, i, j, opponent)) {
          board[i][j] = null;
          return [i, j]; // block opponent
        }
        board[i][j] = null;
      }

      // quick scoring of candidates
      const candidates = moves.map(([i, j]) => {
        board[i][j] = player;
        const sc = evaluateBoard(board, player);
        board[i][j] = null;
        return { move: [i, j] as [number, number], score: sc };
      });

      // order by score desc
      candidates.sort((a, b) => b.score - a.score);

      // take top BEAM_WIDTH as final candidates
      const topCandidates = candidates.slice(0, BEAM_WIDTH).map((c) => c.move);

      // dynamic depth
      const depth = getAIDepth();

      let bestMove: [number, number] | null = null;
      let bestScore = -Infinity;

      // clear transposition cache occasionally (or keep across turn) — we keep it but it lives in ref
      for (const [i, j] of topCandidates) {
        board[i][j] = player;

        // check immediate win again (double-check)
        if (checkWin(board, i, j, player)) {
          board[i][j] = null;
          return [i, j];
        }

        const score = minimax(board, depth - 1, -Infinity, Infinity, false, player);
        board[i][j] = null;

        if (score > bestScore) {
          bestScore = score;
          bestMove = [i, j];
        }
      }

      return bestMove;
    },
    [getRelevantMoves, evaluateBoard, getAIDepth, minimax, checkWin],
  );

  // -------------------------
  // GAME / UI HANDLERS
  // -------------------------
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (gameStatus !== "playing" || board[row][col] !== null || isAIThinking) {
        return;
      }

      const newBoard = board.map((r) => [...r]);
      newBoard[row][col] = currentPlayer;
      setBoard(newBoard);

      const winCells = checkWin(newBoard, row, col, currentPlayer);
      if (winCells) {
        setWinningCells(winCells);
        setGameStatus("win");
        return;
      }

      if (checkDraw(newBoard)) {
        setGameStatus("draw");
        return;
      }

      setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    },
    [board, currentPlayer, gameStatus, isAIThinking, checkWin, checkDraw],
  );

  // AI move effect
  useEffect(() => {
    if (mode === "ai" && currentPlayer === "O" && gameStatus === "playing" && !isAIThinking) {
      setIsAIThinking(true);

      // small delay for UX
      setTimeout(() => {
        // find best move
        const move = findBestMove(board, "O");

        if (move) {
          const [row, col] = move;
          const newBoard = board.map((r) => [...r]);
          newBoard[row][col] = "O";
          setBoard(newBoard);

          const winCells = checkWin(newBoard, row, col, "O");
          if (winCells) {
            setWinningCells(winCells);
            setGameStatus("win");
            setIsAIThinking(false);
            return;
          }

          if (checkDraw(newBoard)) {
            setGameStatus("draw");
            setIsAIThinking(false);
            return;
          }

          setCurrentPlayer("X");
        }

        setIsAIThinking(false);
      }, AI_THINK_DELAY_MS);
    }
  }, [mode, currentPlayer, gameStatus, isAIThinking, board, findBestMove, checkWin, checkDraw]);

  const handleReset = useCallback(() => {
    setBoard(
      Array(BOARD_SIZE)
        .fill(null)
        .map(() => Array(BOARD_SIZE).fill(null)),
    );
    setCurrentPlayer("X");
    setGameStatus("playing");
    setWinningCells([]);
    setIsAIThinking(false);
    transpositionRef.current.clear();
  }, []);

  const isWinningCell = useCallback(
    (row: number, col: number): boolean => {
      return winningCells.some(([r, c]) => r === row && c === col);
    },
    [winningCells],
  );

  const statusText = useMemo(() => {
    if (gameStatus === "draw") {
      return "🤝 Hòa";
    }

    if (gameStatus === "win") {
      if (mode === "ai") {
        return currentPlayer === "X" ? "🏆 Bạn đã thắng" : "🤖 Máy đã thắng";
      } else {
        return currentPlayer === "X" ? "🏆 Người chơi X thắng" : "🏆 Người chơi O thắng";
      }
    }

    if (mode === "ai") {
      if (isAIThinking) {
        return "🤖 Máy đang suy nghĩ...";
      }
      return currentPlayer === "X" ? "🎮 Lượt của bạn" : "🤖 Lượt của máy";
    } else {
      return currentPlayer === "X" ? "🔵 Lượt của tôi (X)" : "🔴 Lượt của bạn (O)";
    }
  }, [gameStatus, currentPlayer, mode, isAIThinking]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #000 1px, transparent 1px),
            linear-gradient(to bottom, #000 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Status */}
        <div className="text-3xl font-bold text-gray-900 min-h-[48px] flex items-center">{statusText}</div>

        {/* Board */}
        <div
          className="inline-grid gap-0 border-2 border-gray-400 shadow-lg"
          style={{
            gridTemplateColumns: `repeat(${BOARD_SIZE}, 3rem)`,
          }}
        >
          {board.map((row, i) =>
            row.map((cell, j) => <Cell key={`${i}-${j}`} value={cell} onClick={() => handleCellClick(i, j)} isWinning={isWinningCell(i, j)} isDisabled={gameStatus !== "playing" || isAIThinking} showPreview={hoveredCell?.[0] === i && hoveredCell?.[1] === j} previewValue={currentPlayer} />),
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-900 
                     hover:bg-gray-900 hover:text-white transition-all duration-200
                     shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                     hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]
                     hover:translate-x-[1px] hover:translate-y-[1px]
                     active:shadow-none active:translate-x-[2px] active:translate-y-[2px]
                     font-bold"
          >
            <RotateCcw className="w-5 h-5" />
            Chơi lại
          </button>

          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-900 
                     hover:bg-gray-900 hover:text-white transition-all duration-200
                     shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                     hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]
                     hover:translate-x-[1px] hover:translate-y-[1px]
                     active:shadow-none active:translate-x-[2px] active:translate-y-[2px]
                     font-bold"
          >
            <Home className="w-5 h-5" />
            Về trang chính
          </button>
        </div>
      </div>
    </div>
  );
}
