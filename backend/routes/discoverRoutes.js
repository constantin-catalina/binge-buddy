import express from 'express';
import { discoverContent } from '../controllers/discoverController.js';

const router = express.Router();

router.get('/', discoverContent);

export default router;
