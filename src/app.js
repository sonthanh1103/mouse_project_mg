import express from 'express';
import connectDB from '../config/db.js';
import cors from 'cors';
import path from 'path';
import ejs from 'ejs';
import { fileURLToPath } from 'url';
import constants from '../config/constants.js';
import router from './routes/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const port = constants.port;

app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, '/views'));

// Kết nối MongoDB
connectDB();

// Middleware
app.use(cors());  // Để frontend có thể gọi API từ backend
app.use(express.json());  // Để body của request là JSON

// Định tuyến API

app.use(express.static(path.join(__dirname, '/public')));

// Khởi động server
app.use('/', router)

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});

