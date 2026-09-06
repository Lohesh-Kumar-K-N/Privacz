const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

code = code.replace(/const movePayload = \{[\s\S]*?lastMove: \`\$\{piece\} to \[\$\{toR\}, \$\{toC\}\]\`\n    \};/,
`const movePayload = {
        type: 'CHESS_MOVE',
        board: chessBoard,
        turn: chessTurn,
        enPassant: enPassantSquare,
        castling: castlingRights,
        halfMove: halfMoveClock,
        fullMove: fullMoveNumber,
        lastMove: \`\${piece} to [\${toR}, \${toC}]\`,
        clocks: chessClocks,
        lastClockUpdate: lastClockUpdate
    };`);

code = code.replace(/function receiveChessMove\(msg\) \{[\s\S]*?const hist = document\.getElementById\('move-history-bar'\);/,
`function receiveChessMove(msg) {
    chessBoard = msg.board;
    chessTurn = msg.turn;
    enPassantSquare = msg.enPassant;
    castlingRights = msg.castling;
    if (msg.halfMove !== undefined) halfMoveClock = msg.halfMove;
    if (msg.fullMove !== undefined) fullMoveNumber = msg.fullMove;
    
    if (msg.clocks) {
        chessClocks = msg.clocks;
        lastClockUpdate = msg.lastClockUpdate || Date.now();
        updateClockDisplays();
    }
    
    renderChessboard();
    const hist = document.getElementById('move-history-bar');`);

fs.writeFileSync('app.js', code);
console.log("Chess clock move payload patched");
