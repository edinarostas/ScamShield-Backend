import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { loadData } from './utils/dataLoader.js';
import authRoutes from './routes/authRoutes.js';
import advertRoutes from './routes/advertRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Load data initially
loadData();

// Routes
app.use('/auth', authRoutes);
app.use('/adverts', advertRoutes);
app.use('/messages', messageRoutes);
app.use('/user', userRoutes);

// Default route
app.get('/', (req, res) => {
    res.send('ScamShield API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
