const urlService = require('../services/url.service');

async function shortenUrl(req, res) {
  try {
    const originalUrl = req.body.originalUrl || req.body.url;
    const userId = req.user.id;

    const url = await urlService.shortenUrl(userId, originalUrl);

    // Build the full short URL link
    const shortUrl = `${req.protocol}://${req.get('host')}/api/urls/${url.short_code}`;

    res.status(201).json({
      ...url,
      shortUrl,
    });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
}

async function getOriginalUrl(req, res) {
  try {
    const { code } = req.params;
    const url = await urlService.getOriginalUrl(code);

    // If client asks for JSON or explicitly passes ?redirect=false, return JSON
    if (req.query.redirect === 'false' || req.headers.accept?.includes('application/json')) {
      return res.json({
        originalUrl: url.original_url,
        shortCode: url.short_code,
        clicks: url.clicks,
      });
    }

    // Default: redirect directly to original URL
    return res.redirect(302, url.original_url);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
}

async function getMyUrls(req, res) {
  try {
    const userId = req.user.id;
    const urls = await urlService.getMyUrls(userId);

    const formattedUrls = urls.map((url) => ({
      ...url,
      shortUrl: `${req.protocol}://${req.get('host')}/api/urls/${url.short_code}`,
    }));

    res.json({ urls: formattedUrls });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
}

module.exports = {
  shortenUrl,
  getOriginalUrl,
  getMyUrls,
};
