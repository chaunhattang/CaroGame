// export const BOARD_SIZE = 36;

// // --- PHẦN 1: CÁC HÀM CƠ BẢN ---

// // Kiểm tra người thắng (trả về { winner: 'X'|'O', line: [indexes] } hoặc null)
// export const checkWinner = (squares) => {
//   const directions = [
//     [1, 0],
//     [0, 1],
//     [1, 1],
//     [1, -1],
//   ];

//   for (let i = 0; i < squares.length; i++) {
//     if (!squares[i]) continue;

//     const x = i % BOARD_SIZE;
//     const y = Math.floor(i / BOARD_SIZE);
//     const player = squares[i];

//     for (let [dx, dy] of directions) {
//       let count = 0;
//       let winPath = [];

//       for (let k = 0; k < 5; k++) {
//         const nx = x + k * dx;
//         const ny = y + k * dy;
//         const idx = ny * BOARD_SIZE + nx;

//         if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && squares[idx] === player) {
//           count++;
//           winPath.push(idx);
//         } else {
//           break;
//         }
//       }

//       if (count === 5) return { winner: player, line: winPath };
//     }
//   }
//   return null;
// };

// // --- PHẦN 2: TRÍ TUỆ NHÂN TẠO (MINIMAX + ALPHA BETA) ---
// // Hàm chính để App.jsx gọi
// export const getBestMove = (squares) => {
//   const candidates = getCandidateMoves(squares);

//   // Nếu bàn rỗng, đánh vào giữa
//   if (candidates.length === 0) return Math.floor((BOARD_SIZE * BOARD_SIZE) / 2);

//   // 1) Nếu có nước thắng ngay lập tức cho Máy (O) -> đi luôn
//   const immediateWin = findImmediateWinningMove(squares, "O");
//   if (immediateWin !== -1) return immediateWin;

//   // 2) Nếu có nước mà X sẽ thắng ngay lập tức -> chặn luôn
//   const blockOpponent = findImmediateWinningMove(squares, "X");
//   if (blockOpponent !== -1) return blockOpponent;

//   // 3) Nếu có open-4 của Máy -> ưu tiên đánh để chắc thắng
//   const openFour = findOpenFourMove(squares, "O");
//   if (openFour !== -1) return openFour;

//   // 4) Move ordering: tính heuristic tạm cho mỗi candidate để sắp xếp (giúp alpha-beta)
//   const scoredMoves = candidates.map((idx) => {
//     squares[idx] = "O";
//     const s = evaluateBoard(squares, "O");
//     squares[idx] = null;
//     return { idx, score: s };
//   });

//   // Sắp xếp giảm dần (máy muốn max score)
//   scoredMoves.sort((a, b) => b.score - a.score);

//   let bestScore = -Infinity;
//   let move = -1;

//   // Depth tradeoff: tăng nếu muốn máy mạnh hơn (tốn nhiều tài nguyên)
//   const SEARCH_DEPTH = 2;

//   for (let { idx } of scoredMoves) {
//     squares[idx] = "O";
//     const score = minimax(squares, SEARCH_DEPTH, -Infinity, Infinity, false);
//     squares[idx] = null;

//     if (score > bestScore) {
//       bestScore = score;
//       move = idx;
//     }
//   }

//   return move;
// };

// // Minimax + Alpha-Beta
// const minimax = (squares, depth, alpha, beta, isMaximizing) => {
//   const win = checkWinSimple(squares);
//   if (win === "O") return 1000000;
//   if (win === "X") return -1000000;

//   if (depth === 0) {
//     return evaluateBoard(squares, "O");
//   }

//   const candidates = getCandidateMoves(squares);
//   if (candidates.length === 0) return 0;

//   if (isMaximizing) {
//     let maxEval = -Infinity;
//     for (let i of candidates) {
//       squares[i] = "O";
//       const evalScore = minimax(squares, depth - 1, alpha, beta, false);
//       squares[i] = null;
//       maxEval = Math.max(maxEval, evalScore);
//       alpha = Math.max(alpha, evalScore);
//       if (beta <= alpha) break;
//     }
//     return maxEval;
//   } else {
//     let minEval = Infinity;
//     for (let i of candidates) {
//       squares[i] = "X";
//       const evalScore = minimax(squares, depth - 1, alpha, beta, true);
//       squares[i] = null;
//       minEval = Math.min(minEval, evalScore);
//       beta = Math.min(beta, evalScore);
//       if (beta <= alpha) break;
//     }
//     return minEval;
//   }
// };

// // --- PHẦN 3: HÀM HỖ TRỢ & CHẤM ĐIỂM ---

// // Lấy các ô trống xung quanh các quân cờ đã có (Phạm vi 1 ô)
// const getCandidateMoves = (squares) => {
//   const candidates = new Set();
//   const range = 1;

//   for (let i = 0; i < squares.length; i++) {
//     if (squares[i] !== null && squares[i] !== undefined) {
//       const x = i % BOARD_SIZE;
//       const y = Math.floor(i / BOARD_SIZE);

//       for (let dy = -range; dy <= range; dy++) {
//         for (let dx = -range; dx <= range; dx++) {
//           if (dx === 0 && dy === 0) continue;

//           const nx = x + dx;
//           const ny = y + dy;

//           if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
//             const idx = ny * BOARD_SIZE + nx;
//             if (squares[idx] === null) {
//               candidates.add(idx);
//             }
//           }
//         }
//       }
//     }
//   }
//   return Array.from(candidates);
// };

// // check quick for minimax
// const checkWinSimple = (squares) => {
//   const res = checkWinner(squares);
//   return res ? res.winner : null;
// };

// // Heuristic evaluation
// const evaluateBoard = (squares, playerTurn) => {
//   let score = 0;
//   score += getScore(squares, "O"); // tấn công
//   score -= getScore(squares, "X") * 1.2; // phòng thủ nặng hơn
//   return score;
// };

// // Scoring function (đơn giản hoá, đủ nhanh)
// const getScore = (squares, player) => {
//   let score = 0;
//   const directions = [
//     [1, 0],
//     [0, 1],
//     [1, 1],
//     [1, -1],
//   ];

//   for (let i = 0; i < squares.length; i++) {
//     if (squares[i] !== player) continue;

//     const x = i % BOARD_SIZE;
//     const y = Math.floor(i / BOARD_SIZE);

//     for (let [dx, dy] of directions) {
//       const prevX = x - dx;
//       const prevY = y - dy;
//       if (prevX >= 0 && prevX < BOARD_SIZE && prevY >= 0 && prevY < BOARD_SIZE && squares[prevY * BOARD_SIZE + prevX] === player) {
//         continue;
//       }

//       let count = 0;
//       let blocked = 0;

//       if (prevX < 0 || prevX >= BOARD_SIZE || prevY < 0 || prevY >= BOARD_SIZE || (squares[prevY * BOARD_SIZE + prevX] !== null && squares[prevY * BOARD_SIZE + prevX] !== player)) {
//         blocked++;
//       }

//       let tempX = x;
//       let tempY = y;
//       while (true) {
//         tempX += dx;
//         tempY += dy;
//         if (tempX < 0 || tempX >= BOARD_SIZE || tempY < 0 || tempY >= BOARD_SIZE) {
//           blocked++;
//           break;
//         }
//         const idx = tempY * BOARD_SIZE + tempX;
//         if (squares[idx] === player) {
//           count++;
//         } else {
//           if (squares[idx] !== null && squares[idx] !== player) blocked++;
//           break;
//         }
//       }

//       const totalLen = count + 1;

//       if (totalLen >= 5) score += 100000;
//       else if (totalLen === 4) score += blocked === 0 ? 10000 : 1000;
//       else if (totalLen === 3) score += blocked === 0 ? 1000 : 100;
//       else if (totalLen === 2) score += blocked === 0 ? 100 : 10;
//     }
//   }
//   return score;
// };

// // --- HỖ TRỢ: tìm nước thắng ngay lập tức ---
// const findImmediateWinningMove = (squares, player) => {
//   const candidates = getCandidateMoves(squares);
//   // if empty, return -1 (caller may handle center move)
//   for (let idx of candidates) {
//     squares[idx] = player;
//     const win = checkWinSimple(squares);
//     squares[idx] = null;
//     if (win === player) return idx;
//   }
//   return -1;
// };

// // Tìm ô để hoàn thành chuỗi 4 (open-4)
// const findOpenFourMove = (squares, player) => {
//   const directions = [
//     [1, 0],
//     [0, 1],
//     [1, 1],
//     [1, -1],
//   ];

//   for (let i = 0; i < squares.length; i++) {
//     if (squares[i] !== player) continue;

//     const x = i % BOARD_SIZE;
//     const y = Math.floor(i / BOARD_SIZE);

//     for (let [dx, dy] of directions) {
//       const prevX = x - dx;
//       const prevY = y - dy;
//       if (prevX >= 0 && prevX < BOARD_SIZE && prevY >= 0 && prevY < BOARD_SIZE && squares[prevY * BOARD_SIZE + prevX] === player) {
//         continue;
//       }

//       let count = 1;
//       let tempX = x;
//       let tempY = y;
//       while (true) {
//         tempX += dx;
//         tempY += dy;
//         if (tempX < 0 || tempX >= BOARD_SIZE || tempY < 0 || tempY >= BOARD_SIZE) break;
//         const idx = tempY * BOARD_SIZE + tempX;
//         if (squares[idx] === player) count++;
//         else break;
//       }

//       if (count === 4) {
//         // prev
//         if (!(prevX < 0 || prevX >= BOARD_SIZE || prevY < 0 || prevY >= BOARD_SIZE)) {
//           const prevIdx = prevY * BOARD_SIZE + prevX;
//           if (squares[prevIdx] === null) return prevIdx;
//         }
//         // next
//         const nextX = x + dx * 4;
//         const nextY = y + dy * 4;
//         if (!(nextX < 0 || nextX >= BOARD_SIZE || nextY < 0 || nextY >= BOARD_SIZE)) {
//           const nextIdx = nextY * BOARD_SIZE + nextX;
//           if (squares[nextIdx] === null) return nextIdx;
//         }
//       }
//     }
//   }
//   return -1;
// };

export const BOARD_SIZE = 36;

// --- PHẦN 1: CÁC HÀM CƠ BẢN ---

// Kiểm tra người thắng (trả về { winner: 'X'|'O', line: [indexes] } hoặc null)
export const checkWinner = (squares) => {
  const directions = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
  ];

  for (let i = 0; i < squares.length; i++) {
    if (!squares[i]) continue;

    const x = i % BOARD_SIZE;
    const y = Math.floor(i / BOARD_SIZE);
    const player = squares[i];

    for (let [dx, dy] of directions) {
      let count = 0;
      let winPath = [];

      for (let k = 0; k < 5; k++) {
        const nx = x + k * dx;
        const ny = y + k * dy;
        const idx = ny * BOARD_SIZE + nx;

        if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && squares[idx] === player) {
          count++;
          winPath.push(idx);
        } else {
          break;
        }
      }

      if (count === 5) return { winner: player, line: winPath };
    }
  }
  return null;
};

// --- PHẦN 2: TRÍ TUỆ NHÂN TẠO (MINIMAX + ALPHA BETA) ---
// Hàm chính để App.jsx gọi
export const getBestMove = (squares) => {
  const candidates = getCandidateMoves(squares);

  // Nếu bàn rỗng, đánh vào giữa
  if (candidates.length === 0) return Math.floor((BOARD_SIZE * BOARD_SIZE) / 2);

  // 1) Nếu có nước thắng ngay lập tức cho Máy (O) -> đi luôn
  const immediateWin = findImmediateWinningMove(squares, "O");
  if (immediateWin !== -1) return immediateWin;

  // 2) Nếu có nước mà X sẽ thắng ngay lập tức -> chặn luôn
  const blockOpponent = findImmediateWinningMove(squares, "X");
  if (blockOpponent !== -1) return blockOpponent;

  // 2.5) Nếu đối phương có open-3 (3 liên tiếp hai đầu rỗng), ưu tiên chặn
  const open3Blocks = findOpenThreeBlocks(squares, "X");
  if (open3Blocks.length > 0) {
    // open3Blocks sorted by frequency (ô chặn nhiều open-3 nhất trước)
    // Nếu có nhiều ô, có thể tie-break bằng evaluateBoard khi đánh O vào ô đó
    let best = open3Blocks[0];
    let bestScore = -Infinity;
    for (let idx of open3Blocks) {
      squares[idx] = "O";
      const sc = evaluateBoard(squares, "O");
      squares[idx] = null;
      if (sc > bestScore) {
        bestScore = sc;
        best = idx;
      }
    }
    return best;
  }

  // 3) Nếu có open-4 của Máy -> ưu tiên đánh để chắc thắng
  const openFour = findOpenFourMove(squares, "O");
  if (openFour !== -1) return openFour;

  // 4) Move ordering: tính heuristic tạm cho mỗi candidate để sắp xếp (giúp alpha-beta)
  const scoredMoves = candidates.map((idx) => {
    squares[idx] = "O";
    const s = evaluateBoard(squares, "O");
    squares[idx] = null;
    return { idx, score: s };
  });

  // Sắp xếp giảm dần (máy muốn max score)
  scoredMoves.sort((a, b) => b.score - a.score);

  let bestScore = -Infinity;
  let move = -1;

  // Depth tradeoff: tăng nếu muốn máy mạnh hơn (tốn nhiều tài nguyên)
  const SEARCH_DEPTH = 2;

  for (let { idx } of scoredMoves) {
    squares[idx] = "O";
    const score = minimax(squares, SEARCH_DEPTH, -Infinity, Infinity, false);
    squares[idx] = null;

    if (score > bestScore) {
      bestScore = score;
      move = idx;
    }
  }

  return move;
};

// Minimax + Alpha-Beta
const minimax = (squares, depth, alpha, beta, isMaximizing) => {
  const win = checkWinSimple(squares);
  if (win === "O") return 1000000;
  if (win === "X") return -1000000;

  if (depth === 0) {
    return evaluateBoard(squares, "O");
  }

  const candidates = getCandidateMoves(squares);
  if (candidates.length === 0) return 0;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let i of candidates) {
      squares[i] = "O";
      const evalScore = minimax(squares, depth - 1, alpha, beta, false);
      squares[i] = null;
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let i of candidates) {
      squares[i] = "X";
      const evalScore = minimax(squares, depth - 1, alpha, beta, true);
      squares[i] = null;
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
};

// --- PHẦN 3: HÀM HỖ TRỢ & CHẤM ĐIỂM ---

// Lấy các ô trống xung quanh các quân cờ đã có (Phạm vi 1 ô)
const getCandidateMoves = (squares) => {
  const candidates = new Set();
  const range = 1;

  for (let i = 0; i < squares.length; i++) {
    if (squares[i] !== null && squares[i] !== undefined) {
      const x = i % BOARD_SIZE;
      const y = Math.floor(i / BOARD_SIZE);

      for (let dy = -range; dy <= range; dy++) {
        for (let dx = -range; dx <= range; dx++) {
          if (dx === 0 && dy === 0) continue;

          const nx = x + dx;
          const ny = y + dy;

          if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
            const idx = ny * BOARD_SIZE + nx;
            if (squares[idx] === null) {
              candidates.add(idx);
            }
          }
        }
      }
    }
  }
  return Array.from(candidates);
};

// check quick for minimax
const checkWinSimple = (squares) => {
  const res = checkWinner(squares);
  return res ? res.winner : null;
};

// Heuristic evaluation
const evaluateBoard = (squares, playerTurn) => {
  let score = 0;
  score += getScore(squares, "O"); // tấn công
  score -= getScore(squares, "X") * 1.2; // phòng thủ nặng hơn
  return score;
};

// Scoring function (đơn giản hoá, đủ nhanh)
const getScore = (squares, player) => {
  let score = 0;
  const directions = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
  ];

  for (let i = 0; i < squares.length; i++) {
    if (squares[i] !== player) continue;

    const x = i % BOARD_SIZE;
    const y = Math.floor(i / BOARD_SIZE);

    for (let [dx, dy] of directions) {
      const prevX = x - dx;
      const prevY = y - dy;
      if (prevX >= 0 && prevX < BOARD_SIZE && prevY >= 0 && prevY < BOARD_SIZE && squares[prevY * BOARD_SIZE + prevX] === player) {
        continue;
      }

      let count = 0;
      let blocked = 0;

      if (prevX < 0 || prevX >= BOARD_SIZE || prevY < 0 || prevY >= BOARD_SIZE || (squares[prevY * BOARD_SIZE + prevX] !== null && squares[prevY * BOARD_SIZE + prevX] !== player)) {
        blocked++;
      }

      let tempX = x;
      let tempY = y;
      while (true) {
        tempX += dx;
        tempY += dy;
        if (tempX < 0 || tempX >= BOARD_SIZE || tempY < 0 || tempY >= BOARD_SIZE) {
          blocked++;
          break;
        }
        const idx = tempY * BOARD_SIZE + tempX;
        if (squares[idx] === player) {
          count++;
        } else {
          if (squares[idx] !== null && squares[idx] !== player) blocked++;
          break;
        }
      }

      const totalLen = count + 1;

      if (totalLen >= 5) score += 100000;
      else if (totalLen === 4) score += blocked === 0 ? 10000 : 1000;
      else if (totalLen === 3) score += blocked === 0 ? 1000 : 100;
      else if (totalLen === 2) score += blocked === 0 ? 100 : 10;
    }
  }
  return score;
};

// --- HỖ TRỢ: tìm nước thắng ngay lập tức ---
const findImmediateWinningMove = (squares, player) => {
  const candidates = getCandidateMoves(squares);
  // if empty, return -1 (caller may handle center move)
  for (let idx of candidates) {
    squares[idx] = player;
    const win = checkWinSimple(squares);
    squares[idx] = null;
    if (win === player) return idx;
  }
  return -1;
};

// Tìm ô để hoàn thành chuỗi 4 (open-4)
const findOpenFourMove = (squares, player) => {
  const directions = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
  ];

  for (let i = 0; i < squares.length; i++) {
    if (squares[i] !== player) continue;

    const x = i % BOARD_SIZE;
    const y = Math.floor(i / BOARD_SIZE);

    for (let [dx, dy] of directions) {
      const prevX = x - dx;
      const prevY = y - dy;
      if (prevX >= 0 && prevX < BOARD_SIZE && prevY >= 0 && prevY < BOARD_SIZE && squares[prevY * BOARD_SIZE + prevX] === player) {
        continue;
      }

      let count = 1;
      let tempX = x;
      let tempY = y;
      while (true) {
        tempX += dx;
        tempY += dy;
        if (tempX < 0 || tempX >= BOARD_SIZE || tempY < 0 || tempY >= BOARD_SIZE) break;
        const idx = tempY * BOARD_SIZE + tempX;
        if (squares[idx] === player) count++;
        else break;
      }

      if (count === 4) {
        // prev
        if (!(prevX < 0 || prevX >= BOARD_SIZE || prevY < 0 || prevY >= BOARD_SIZE)) {
          const prevIdx = prevY * BOARD_SIZE + prevX;
          if (squares[prevIdx] === null) return prevIdx;
        }
        // next
        const nextX = x + dx * 4;
        const nextY = y + dy * 4;
        if (!(nextX < 0 || nextX >= BOARD_SIZE || nextY < 0 || nextY >= BOARD_SIZE)) {
          const nextIdx = nextY * BOARD_SIZE + nextX;
          if (squares[nextIdx] === null) return nextIdx;
        }
      }
    }
  }
  return -1;
};

// --- MỚI: TÌM OPEN-3 CỦA ĐỐI PHƯƠNG VÀ TRẢ VỀ CÁC Ô NÊN CHẶN ---
// Trả về mảng các index ô có tác dụng chặn open-3 (sắp xếp theo tần suất chặn, ưu tiên ô chặn nhiều threat)
const findOpenThreeBlocks = (squares, player) => {
  const directions = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
  ];
  const counter = new Map(); // idx -> count

  for (let i = 0; i < squares.length; i++) {
    if (squares[i] !== player) continue;

    const x = i % BOARD_SIZE;
    const y = Math.floor(i / BOARD_SIZE);

    for (let [dx, dy] of directions) {
      // ensure we start at sequence start
      const px = x - dx;
      const py = y - dy;
      if (px >= 0 && px < BOARD_SIZE && py >= 0 && py < BOARD_SIZE && squares[py * BOARD_SIZE + px] === player) {
        continue; // not a start
      }

      // collect up to 3 in a row
      let cnt = 1;
      let lastX = x;
      let lastY = y;
      for (let k = 1; k < 3; k++) {
        const nx = x + dx * k;
        const ny = y + dy * k;
        if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) break;
        const idx = ny * BOARD_SIZE + nx;
        if (squares[idx] === player) {
          cnt++;
          lastX = nx;
          lastY = ny;
        } else break;
      }

      // only interested in sequences of exactly length 3 where both ends empty (open-3)
      if (cnt === 3) {
        const beforeX = x - dx;
        const beforeY = y - dy;
        const afterX = x + dx * 3;
        const afterY = y + dy * 3;

        let beforeEmpty = false;
        let afterEmpty = false;
        if (!(beforeX < 0 || beforeX >= BOARD_SIZE || beforeY < 0 || beforeY >= BOARD_SIZE)) {
          const idx = beforeY * BOARD_SIZE + beforeX;
          if (squares[idx] === null) beforeEmpty = true;
        }
        if (!(afterX < 0 || afterX >= BOARD_SIZE || afterY < 0 || afterY >= BOARD_SIZE)) {
          const idx = afterY * BOARD_SIZE + afterX;
          if (squares[idx] === null) afterEmpty = true;
        }

        // open-3 defined as both ends empty
        if (beforeEmpty && afterEmpty) {
          const idxBefore = beforeY * BOARD_SIZE + beforeX;
          const idxAfter = afterY * BOARD_SIZE + afterX;
          // add counts
          counter.set(idxBefore, (counter.get(idxBefore) || 0) + 1);
          counter.set(idxAfter, (counter.get(idxAfter) || 0) + 1);
        }
      }
    }
  }

  // convert map to sorted array by count desc
  const entries = Array.from(counter.entries());
  entries.sort((a, b) => b[1] - a[1]);
  return entries.map(([idx]) => idx);
};
