import express from 'express';
import { getMovies } from '../controllers/movieController.js';
import { protectAdmin } from '../middleware/auth.js';

const showRouter = express.Router();

showRouter.get('/now-playing', getMovies);

export default showRouter;