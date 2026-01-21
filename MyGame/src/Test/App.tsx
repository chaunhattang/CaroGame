import { useEffect, useState } from "react";
import { BOARD_SIZE, checkWinner, getBestMove } from "./gameLogic";

const IconX = () => (
  <svg className="w-full h-full text-blue-600 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const IconO = () => (
  <svg className="w-full h-full text-red-600 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
  </svg>
);

const App = () => {
  const [screen, setScreen] = useState("home");
  const [mode, setMode] = useState("pvc");
  const [board, setBoard] = useState(Array(BOARD_SIZE * BOARD_SIZE).fill(null));
  const [isNext, setIsNext] = useState(true);
  const [winner, setWinner] = useState(null);

  const [lastMoveIndex, setLastMoveIndex] = useState(null);
  const [aiThinking, setAiThinking] = useState(false);

  const resetGame = () => {
    setBoard(Array(BOARD_SIZE * BOARD_SIZE).fill(null));
    setIsNext(true);
    setWinner(null);
    setLastMoveIndex(null);
  };

  const goHome = () => {
    resetGame();
    setScreen("home");
  };

  const handleSquareClick = (index) => {
    if (board[index] || winner) return;
    if (mode === "pvc" && !isNext) return;

    const newBoard = [...board];
    newBoard[index] = isNext ? "X" : "O";
    setBoard(newBoard);
    setLastMoveIndex(index);
    const win = checkWinner(newBoard);

    if (win) {
      setWinner(win);
    } else {
      setIsNext(!isNext);
    }
  };
  useEffect(() => {
    if (mode === "pvc" && !isNext && !winner) {
      const timer = setTimeout(() => {
        const aiMoveIndex = getBestMove(board);
        if (aiMoveIndex !== -1) {
          const newBoard = [...board];
          newBoard[aiMoveIndex] = "O";
          setBoard(newBoard);
          setLastMoveIndex(aiMoveIndex);
          const win = checkWinner(newBoard);
          if (win) {
            setWinner(win);
          } else {
            setIsNext(true);
          }
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [board, isNext, mode, winner]);

  if (screen === "home") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans p-10 md:p-52 select-none">
        <h1 className="text-5xl md:text-6xl font-black text-slate-800 mb-2 tracking-tighter">CARO GAME</h1>
        <p className="text-slate-500 mb-10 text-lg">Thử thách trí tuệ 20x20</p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={() => {
              setMode("pvc");
              setScreen("game");
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white active:scale-95 py-5 rounded-2xl font-bold shadow-lg transition-transform"
          >
            Chơi với máy
          </button>
          <button
            onClick={() => {
              setMode("pvp");
              setScreen("game");
            }}
            className="bg-white border-2 border-slate-200 hover:slate-200 hover:border-slate-400 active:scale-95 py-5 rounded-2xl font-bold shadow-lg transition-transform "
          >
            Chơi với bạn
          </button>
        </div>
      </div>
    );
  }

  let statusText = "";
  let statusColor = "text-slate-700";

  if (winner) {
    const winPlayer = winner.winner;
    if (mode === "pvp") {
      statusText = `${winPlayer} CHIẾN THẮNG!`;
    } else {
      statusText = winPlayer === "X" ? "BẠN ĐÃ THẮNG" : "MÁY ĐÃ THẮNG";
    }
    statusColor = "text-green-600 animate-bounce";
  } else {
    if (mode === "pvc") {
      statusText = isNext ? "LƯỢT CỦA BẠN (X)" : "MÁY ĐANG CHƠI (O)";
    } else {
      statusText = isNext ? "LƯỢT CỦA NGƯỜI CHƠI X" : "LƯỢT CỦA NGƯỜI CHƠI O";
    }
  }

  return (
    <div className="fixed top-0 min-h-screen bg-slate-100 flex flex-col font-sans overflow-hidden select-none touch-manipulation">
      <div className=" flex-none h-16 bg-white shadow-sm  flex items-center justify-center px-1 selection:md:px-4 z-10 border-b border-slate-200">
        <button onClick={goHome} className="bg-slate-100 hover:bg-blue-100 text-blue-700 px-4 py-2 round-lg font-bold text-sm transition-colors md:me-16">
          Thoát
        </button>
        <div className={`font-black text-sm md:text-lg md-text-xl uppercase truncate px-2 & ${statusColor}`}>{statusText}</div>
        <button onClick={resetGame} className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-1 md:px-4 py-2 round-lg font-bold text-sm transition-colors  md:ms-16">
          Chơi lại
        </button>
      </div>

      <div className="flex-grow flex items-center justify-center p-2 bg-slate-200">
        <div className="bg-white shadow-2xl border border-salte-400 grid" style={{ width: "min(98vw, 85vh)", height: "min(98vw, 85vh)", gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${BOARD_SIZE}, minmax(0, 1fr))` }}>
          {board.map((cell, index) => {
            const isWinningCell = Boolean(winner && winner.line && winner.line.includes(index));
            const isLastMove = index === lastMoveIndex;
            let cellBg = "bg-white hover:bg-slate-100";
            if (isWinningCell) {
              cellBg = "bg-green-300 hover:bg-green-300";
            } else if (isLastMove) {
              cellBg = "bg-yellow-200 hover:bg-yellow-200";
            }
            return (
              <div key={index} onClick={() => handleSquareClick(index)} className={`relative flex items-center justify-center border-r border-b border-slate-300 ${!cell && !winner ? "cursor-pointer active:bg-slate-100" : ""} ${cellBg} transition-colors duration-200`}>
                {cell === "X" && (
                  <div className="w-full h-full p-[5%]">
                    <IconX />
                  </div>
                )}
                {cell === "O" && (
                  <div className="w-full h-full p-[5%]">
                    <IconO />
                  </div>
                )}
                {!cell && !winner && isNext && lastMoveIndex == null && <div className="hidden md:block w-2 h-2 rounded-full bg-slate-200 opacity-0 hover:opacity-100 transition-opacity" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default App;
