const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// 1. Add `isInsufficientMaterial` helper before `renderChessboard`
const insufficientFn = `
function isInsufficientMaterial(board) {
    let pieces = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c]) pieces.push(board[r][c]);
        }
    }
    if (pieces.length === 2) return true;
    if (pieces.length === 3) {
        if (pieces.some(p => p[1] === 'b' || p[1] === 'n')) return true;
    }
    return false;
}

function renderChessboard`;

code = code.replace('function renderChessboard', insufficientFn);

// 2. Update renderChessboard logic
const oldEval = `            if (isKingInCheck(chessBoard, chessTurn)) {
                if (!hasLegalMoves(chessBoard, chessTurn, enPassantSquare, castlingRights)) {
                    stateText = "CHECKMATE! " + (chessTurn === 'w' ? "Black" : "White") + " Wins!";
                } else {
                    stateText += " (CHECK)";
                }
            } else {
                if (!hasLegalMoves(chessBoard, chessTurn, enPassantSquare, castlingRights)) {
                    stateText = "STALEMATE! Draw.";
                }
            }`;

const newEval = `            if (isKingInCheck(chessBoard, chessTurn)) {
                if (!hasLegalMoves(chessBoard, chessTurn, enPassantSquare, castlingRights)) {
                    stateText = "CHECKMATE! " + (chessTurn === 'w' ? "Black" : "White") + " Wins!";
                } else {
                    stateText += " (CHECK)";
                }
            } else {
                if (!hasLegalMoves(chessBoard, chessTurn, enPassantSquare, castlingRights)) {
                    stateText = "STALEMATE! Draw.";
                } else if (halfMoveClock >= 100) {
                    stateText = "DRAW! 50-Move Rule.";
                } else if (isInsufficientMaterial(chessBoard)) {
                    stateText = "DRAW! Insufficient Material.";
                }
            }`;

code = code.replace(oldEval, newEval);

// 3. Update executeMove to track halfMoveClock and fullMoveNumber
const oldExecStart = `function executeMove(fromR, fromC, toR, toC, promoPiece) {
    const piece = chessBoard[fromR][fromC];
    const color = piece[0];`;

const newExecStart = `function executeMove(fromR, fromC, toR, toC, promoPiece) {
    const piece = chessBoard[fromR][fromC];
    const color = piece[0];
    const targetPiece = chessBoard[toR][toC];
    const isEnPassantCap = piece[1] === 'p' && enPassantSquare && toR === enPassantSquare.r && toC === enPassantSquare.c;
    if (piece[1] === 'p' || targetPiece !== '' || isEnPassantCap) {
        halfMoveClock = 0;
    } else {
        halfMoveClock++;
    }
    if (color === 'b') fullMoveNumber++;`;

code = code.replace(oldExecStart, newExecStart);

// 4. Update executeMove payload
const oldPayload = `    const movePayload = {
        type: 'CHESS_MOVE',
        board: chessBoard,
        turn: chessTurn,
        enPassant: enPassantSquare,
        castling: castlingRights,
        lastMove: \`\${piece} to [\${toR}, \${toC}]\`
    };`;

const newPayload = `    const movePayload = {
        type: 'CHESS_MOVE',
        board: chessBoard,
        turn: chessTurn,
        enPassant: enPassantSquare,
        castling: castlingRights,
        halfMove: halfMoveClock,
        fullMove: fullMoveNumber,
        lastMove: \`\${piece} to [\${toR}, \${toC}]\`
    };`;

code = code.replace(oldPayload, newPayload);

// 5. Update receiveChessMove to unpack them
const oldRecv = `function receiveChessMove(msg) {
    chessBoard = msg.board;
    chessTurn = msg.turn;
    enPassantSquare = msg.enPassant;
    castlingRights = msg.castling;
    renderChessboard();`;

const newRecv = `function receiveChessMove(msg) {
    chessBoard = msg.board;
    chessTurn = msg.turn;
    enPassantSquare = msg.enPassant;
    castlingRights = msg.castling;
    if (msg.halfMove !== undefined) halfMoveClock = msg.halfMove;
    if (msg.fullMove !== undefined) fullMoveNumber = msg.fullMove;
    renderChessboard();`;

code = code.replace(oldRecv, newRecv);

fs.writeFileSync('app.js', code);
