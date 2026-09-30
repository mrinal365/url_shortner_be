const express = require('express');
const router = express.Router();
const { signup, login, me } = require('../controller/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authMiddleware, me);

module.exports = router;
