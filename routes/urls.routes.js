const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const { shortenUrl, getOriginalUrl, getMyUrls } = require('../controller/urls.controller');

const router = express.Router();

router.post('/shorten', authMiddleware, shortenUrl); // shorten a long url
router.get('/urls/:code', authMiddleware, getOriginalUrl); // redirect to originalUrl
router.get('/urls', authMiddleware, getMyUrls); //get my urls
// router.get('/analytics', authMiddleware, TBD) // get analytics for user
// router.get('/analytics/:url', authMiddleware, TBD) // get analytics for a particular url

module.exports = router;
