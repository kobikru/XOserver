// socket.js
import { io } from 'socket.io-client';

// עדכון ה-URL והפורט בהתאמה לשרת
const URL = 'http://localhost:4000'; // או הכתובת של השרת במקרה אחר
export const socket = io(URL);
