const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

code = code.replace(
    /            if \(isKingInCheck\(chessBoard, chessTurn\)\) \{[\s\S]*?            \} else \{[\s\S]*?                    stateText = "DRAW! Insufficient Material\.";\n                \}\n            \}/,
    `            let gameOver = false;
            if (isKingInCheck(chessBoard, chessTurn)) {
                if (!hasLegalMoves(chessBoard, chessTurn, enPassantSquare, castlingRights)) {
                    stateText = "CHECKMATE! " + (chessTurn === 'w' ? "Black" : "White") + " Wins!";
                    gameOver = true;
                } else {
                    stateText += " (CHECK)";
                }
            } else {
                if (!hasLegalMoves(chessBoard, chessTurn, enPassantSquare, castlingRights)) {
                    stateText = "STALEMATE! Draw.";
                    gameOver = true;
                } else if (halfMoveClock >= 100) {
                    stateText = "DRAW! 50-Move Rule.";
                    gameOver = true;
                } else if (isInsufficientMaterial(chessBoard)) {
                    stateText = "DRAW! Insufficient Material.";
                    gameOver = true;
                }
            }
            if (gameOver) {
                matchStarted = false;
                stopChessClock();
            }`
);

fs.writeFileSync('app.js', code);
console.log("Patched!");
