import express from 'express';
import connectDB from '../config/db.js';
import cors from 'cors';
import path from 'path';
import ejs from 'ejs';
import { fileURLToPath } from 'url';
import constants from '../config/constants.js';
import router from './routes/routes.js';
import passport from '../config/passport.js';
import session from 'express-session';
import MongoStore from "connect-mongo";
import dotenv from 'dotenv';

dotenv.config();


const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = constants.port;

app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, '/views'));

// Kết nối MongoDB
connectDB();

// Middleware
app.use(cors());  // Để frontend có thể gọi API từ backend
app.use(express.json());  // Để body của request là JSON

//session
const sessionStore = new MongoStore({
  mongoUrl: constants.MONGODB_URI,
  mongoOptions: {
    // autoReconnect: true
  }
});
// Listen for the 'connected' event on the MongoStore instance
sessionStore.on('connected', () => {
  console.log('MongoStore is connected');
  // Perform actions you want to take when MongoStore is ready
});
// Listen for the 'error' event on the MongoStore instance
sessionStore.on('error', (error) => {
  console.error('MongoStore connection error:', error);
  // Handle the error as needed
});

// session config
app.use(
    session({
      secret: process.env.SESSION_SECRET,
      rolling: true,
      resave: true,
      saveUninitialized: false, // true nếu dùng csrf
      store: sessionStore,
      cookie: {
        secure: false // Để false nếu chạy local (http)
        // maxAge: 24*60*60000
      }
    })
  );

// ==================================
// passport
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.currentPath = req.path; 
  next();
});

app.use(express.static(path.join(__dirname, '/public')));

// Khởi động server
app.use('/', router)

app.use((req, res) => {
    res.status(404).render('errors/error-404', { title: 'Page Not Found' });
});

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});

