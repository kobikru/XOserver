// index.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// הגדרת CORS כדי לאפשר חיבור מצד הלקוח
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const rooms = {}; // שמירת נתוני החדרים

// פונקציה ליצירת קוד חדר ייחודי בן 6 ספרות
function generateRoomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// אירועי Socket.io
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // יצירת חדר חדש
  socket.on('game-create', () => {
    const roomCode = generateRoomCode();
    rooms[roomCode] = {
      players: [socket.id],
      board: Array(9).fill(null),
      currentPlayer: 0, // השחקן שמתחיל ראשון
    };

    socket.join(roomCode); // הצטרפות לחדר החדש
    socket.emit('awaiting', roomCode); // שלח את קוד החדר ללקוח היוצר
    console.log(`Room created: ${roomCode}`);
  });

  // הצטרפות לחדר קיים
  socket.on('join-game', ({ roomId }) => {
    if (rooms[roomId]) {
      rooms[roomId].players.push(socket.id);
      socket.join(roomId);

      // שליחת הודעת הצטרפות מוצלחת
      socket.emit('join-status', { success: true });

      // כשהחדר מלא בשני שחקנים, התחלת המשחק
      if (rooms[roomId].players.length === 2) {
        io.in(roomId).emit('game-start', {
          roomId,
          board: rooms[roomId].board,
          players: rooms[roomId].players,
          currentPlayer: rooms[roomId].currentPlayer,
        });
      }
    } else {
      socket.emit('join-status', { success: false, message: 'Room not found' });
    }
  });

  // האזנה לניתוק לקוח
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(4000, () => console.log('Listening on port 4000'));
