import React, { useState, useEffect } from "react";
import { checkWinner, getBestMove, BOARD_SIZE } from "./gameLogic";

// --- PHẦN ICON ---
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

// --- COMPONENT CHÍNH ---
const App = () => {
  const [screen, setScreen] = useState("home");
  const [mode, setMode] = useState("pvc");
  const [board, setBoard] = useState(Array(BOARD_SIZE * BOARD_SIZE).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winnerInfo, setWinnerInfo] = useState(null);

  // 1. THÊM STATE LƯU VỊ TRÍ NƯỚC ĐI CUỐI
  const [lastMoveIndex, setLastMoveIndex] = useState(null);

  const resetGame = () => {
    setBoard(Array(BOARD_SIZE * BOARD_SIZE).fill(null));
    setIsXNext(true);
    setWinnerInfo(null);
    setLastMoveIndex(null); // Reset luôn vị trí cuối
  };

  const goHome = () => {
    resetGame();
    setScreen("home");
  };

  const handleSquareClick = (index) => {
    if (board[index] || winnerInfo) return;
    if (mode === "pvc" && !isXNext) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? "X" : "O";
    setBoard(newBoard);

    // 2. CẬP NHẬT VỊ TRÍ CUỐI KHI NGƯỜI ĐÁNH
    setLastMoveIndex(index);

    const win = checkWinner(newBoard);
    if (win) {
      setWinnerInfo(win);
    } else {
      setIsXNext(!isXNext);
    }
  };

  useEffect(() => {
    if (mode === "pvc" && !isXNext && !winnerInfo) {
      const timer = setTimeout(() => {
        const aiMoveIndex = getBestMove(board);
        if (aiMoveIndex !== -1) {
          const newBoard = [...board];
          newBoard[aiMoveIndex] = "O";
          setBoard(newBoard);

          // 3. CẬP NHẬT VỊ TRÍ CUỐI KHI MÁY ĐÁNH
          setLastMoveIndex(aiMoveIndex);

          const win = checkWinner(newBoard);
          if (win) {
            setWinnerInfo(win);
          } else {
            setIsXNext(true);
          }
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isXNext, mode, winnerInfo, board]);

  // --- RENDER ---
  if (screen === "home") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans p-4 select-none">
        <h1 className="text-5xl md:text-6xl font-black text-slate-800 mb-2 tracking-tighter">CARO PRO</h1>
        <p className="text-slate-500 mb-10 text-lg">Thử thách trí tuệ 20x20</p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={() => {
              setMode("pvc");
              setScreen("game");
            }}
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white py-5 rounded-2xl text-xl font-bold shadow-lg transition-transform"
          >
            Đấu với Máy 🤖
          </button>
          <button
            onClick={() => {
              setMode("pvp");
              setScreen("game");
            }}
            className="bg-white border-2 border-slate-200 hover:border-slate-400 active:scale-95 text-slate-700 py-5 rounded-2xl text-xl font-bold shadow-sm transition-transform"
          >
            Đấu với Bạn 👥
          </button>
        </div>
      </div>
    );
  }

  let statusText = "";
  let statusColor = "text-slate-700";
  if (winnerInfo) {
    statusText = winnerInfo.winner === "X" ? "BẠN ĐÃ THẮNG!" : "MÁY ĐÃ THẮNG!";
    if (mode === "pvp") statusText = `${winnerInfo.winner === "X" ? "X" : "O"} CHIẾN THẮNG!`;
    statusColor = "text-green-600 animate-bounce";
  } else {
    if (mode === "pvc") {
      statusText = isXNext ? "Lượt của bạn (X)" : "Máy đang tính...";
    } else {
      statusText = isXNext ? "Lượt người chơi X" : "Lượt người chơi O";
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-100 flex flex-col font-sans overflow-hidden select-none touch-manipulation">
      <div className="flex-none h-16 bg-white shadow-sm flex items-center justify-between px-4 z-10 border-b border-slate-200">
        <button onClick={goHome} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold text-sm transition-colors">
          ⬅ Thoát
        </button>
        <div className={`font-black text-lg md:text-xl uppercase truncate px-2 ${statusColor}`}>{statusText}</div>
        <button onClick={resetGame} className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold text-sm transition-colors">
          🔄 Chơi lại
        </button>
      </div>

      <div className="flex-grow flex items-center justify-center p-2 bg-slate-200">
        <div
          className="bg-white shadow-2xl border border-slate-400 grid"
          style={{
            width: "min(98vw, 85vh)",
            height: "min(98vw, 85vh)",
            gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
          }}
        >
          {board.map((cell, idx) => {
            const isWinningCell = winnerInfo?.line.includes(idx);
            // 4. KIỂM TRA XEM CÓ PHẢI Ô CUỐI KHÔNG
            const isLastMove = idx === lastMoveIndex;

            // Logic màu nền:
            // - Nếu thắng: Vàng (bg-yellow-300)
            // - Nếu là ô vừa đánh: Xám đậm hơn chút (bg-slate-300) để nổi bật
            // - Còn lại: Trắng (bg-white)
            let cellBg = "bg-white";
            if (isWinningCell) cellBg = "bg-yellow-300";
            else if (isLastMove) cellBg = "bg-slate-300"; // Màu highlight nước đi cuối

            return (
              <div
                key={idx}
                onClick={() => handleSquareClick(idx)}
                className={`
                  relative flex items-center justify-center border-r border-b border-slate-300
                  ${!cell && !winnerInfo ? "cursor-pointer active:bg-slate-100" : ""} 
                  ${cellBg} 
                  transition-colors duration-200
                `}
              >
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

                {/* Ẩn dấu chấm hover nếu là ô vừa đánh để đỡ rối mắt */}
                {!cell && !winnerInfo && isXNext && !isLastMove && <div className="hidden md:block w-2 h-2 rounded-full bg-slate-200 opacity-0 hover:opacity-100 transition-opacity" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-none h-6 bg-slate-200 text-slate-400 text-[10px] flex items-center justify-center">Caro 20x20 • React & Tailwind</div>
    </div>
  );
};

export default App;
