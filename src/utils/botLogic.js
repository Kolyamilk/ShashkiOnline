import {
  getValidMovesForPiece,
  getCaptureMoves,
  hasAnyCapture,
  BOARD_SIZE,
} from './checkersLogic';

// Веса позиций на доске (чем выше, тем лучше)
const positionalWeights = [
  [0, 2, 0, 2, 0, 2, 0, 2],
  [2, 0, 3, 0, 3, 0, 3, 0],
  [0, 3, 0, 4, 0, 4, 0, 3],
  [3, 0, 4, 0, 5, 0, 4, 0],
  [0, 3, 0, 5, 0, 5, 0, 3],
  [3, 0, 4, 0, 4, 0, 3, 0],
  [0, 2, 0, 3, 0, 3, 0, 2],
  [2, 0, 2, 0, 2, 0, 2, 0],
];

// Получение всех возможных ходов для игрока
const getAllMoves = (board, player) => {
  const moves = [];
  const anyCapture = hasAnyCapture(board, player);
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (piece && piece.player === player) {
        const pieceMoves = getValidMovesForPiece(board, r, c, player, anyCapture);
        pieceMoves.forEach(move => {
          moves.push({
            fromRow: r,
            fromCol: c,
            toRow: move.row,
            toCol: move.col,
            capturedRow: move.capturedRow,
            capturedCol: move.capturedCol,
          });
        });
      }
    }
  }
  return moves;
};

// Применить ход к доске и вернуть новую доску
const applyMoveToBoard = (board, move) => {
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[move.fromRow]?.[move.fromCol];
  if (!piece) return board;
  
  const movedPiece = { ...piece };
  newBoard[move.fromRow][move.fromCol] = null;
  newBoard[move.toRow][move.toCol] = movedPiece;

  if (move.capturedRow !== undefined && move.capturedCol !== undefined) {
    newBoard[move.capturedRow][move.capturedCol] = null;
  }

  if (!movedPiece.king) {
    const shouldBeKing = (movedPiece.player === 1 && move.toRow === 7) || (movedPiece.player === 2 && move.toRow === 0);
    if (shouldBeKing) {
      newBoard[move.toRow][move.toCol].king = true;
    }
  }

  return newBoard;
};

// Продвинутая оценочная функция
const evaluateBoard = (board) => {
  let score = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (piece) {
        // Базовая ценность фигуры
        let value = piece.king ? 3 : 1;
        
        // Бонус за положение на доске (центр важнее)
        if (!piece.king) {
          value += positionalWeights[r][c] * 0.1;
        }
        
        // Бонус за продвижение вперёд (для обычных шашек)
        if (!piece.king) {
          const forwardProgress = piece.player === 1 ? r : 7 - r;
          value += forwardProgress * 0.05;
        }
        
        // Бонус за защищённость (наличие союзника рядом)
        let protectionBonus = 0;
        const directions = [[-1,-1], [-1,1], [1,-1], [1,1]];
        for (let [dr, dc] of directions) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
            const neighbor = board[nr][nc];
            if (neighbor && neighbor.player === piece.player) {
              protectionBonus += 0.1;
            }
          }
        }
        value += protectionBonus;
        
        if (piece.player === 2) score += value;
        else score -= value;
      }
    }
  }
  return score;
};

// Минимакс с альфа-бета отсечением
const minimax = (board, depth, alpha, beta, maximizingPlayer, player) => {
  if (depth === 0) {
    return { score: evaluateBoard(board), move: null };
  }

  const moves = getAllMoves(board, player);
  if (moves.length === 0) {
    return { score: maximizingPlayer ? -1000 : 1000, move: null };
  }

  if (maximizingPlayer) {
    let bestScore = -Infinity;
    let bestMove = null;
    for (const move of moves) {
      const newBoard = applyMoveToBoard(board, move);
      const result = minimax(newBoard, depth - 1, alpha, beta, false, player === 1 ? 2 : 1);
      if (result.score > bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
      alpha = Math.max(alpha, bestScore);
      if (beta <= alpha) break;
    }
    return { score: bestScore, move: bestMove };
  } else {
    let bestScore = Infinity;
    let bestMove = null;
    for (const move of moves) {
      const newBoard = applyMoveToBoard(board, move);
      const result = minimax(newBoard, depth - 1, alpha, beta, true, player === 1 ? 2 : 1);
      if (result.score < bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
      beta = Math.min(beta, bestScore);
      if (beta <= alpha) break;
    }
    return { score: bestScore, move: bestMove };
  }
};

// Главная функция для получения лучшего хода
export const getBestMove = (board, player, difficulty) => {
  const moves = getAllMoves(board, player);
  if (moves.length === 0) return null;

  switch (difficulty) {
    case 'easy':
      return moves[Math.floor(Math.random() * moves.length)];

    case 'medium': {
      let bestScore = -Infinity;
      let bestMove = null;
      for (const move of moves) {
        const newBoard = applyMoveToBoard(board, move);
        const score = evaluateBoard(newBoard);
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
      return bestMove;
    }

    case 'hard': {
      const result = minimax(board, 3, -Infinity, Infinity, true, player);
      return result.move;
    }

    case 'grandmaster': {
      const result = minimax(board, 5, -Infinity, Infinity, true, player);
      return result.move;
    }

    default:
      return moves[0];
  }
};