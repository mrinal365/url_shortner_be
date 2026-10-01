const crypto = require('crypto');
const urlRepository = require('../repository/url.repository');

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateShortCode(length = 7) {
  let result = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += CHARACTERS[bytes[i] % CHARACTERS.length];
  }
  return result;
}

function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (err) {
    return false;
  }
}

async function shortenUrl(userId, originalUrl) {
  if (!originalUrl) {
    throw { status: 400, message: 'originalUrl is required' };
  }

  // Ensure originalUrl has protocol if missing (e.g. google.com -> https://google.com)
  let formattedUrl = originalUrl.trim();
  if (!/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = `https://${formattedUrl}`;
  }

  if (!isValidUrl(formattedUrl)) {
    throw { status: 400, message: 'Invalid URL format' };
  }

  // Generate unique 7-character short code
  const MAX_RETRIES = 5;
  for (let i = 0; i < MAX_RETRIES; i++) {
    const shortCode = generateShortCode(7);
    const existing = await urlRepository.findByShortCode(shortCode);
    if (!existing) {
      return await urlRepository.createUrl(userId, formattedUrl, shortCode);
    }
  }

  throw { status: 500, message: 'Failed to generate unique short code. Please try again.' };
}

async function getOriginalUrl(code) {
  if (!code) {
    throw { status: 400, message: 'Short code is required' };
  }

  const url = await urlRepository.findByShortCode(code);
  if (!url) {
    throw { status: 404, message: 'Short URL not found' };
  }

  // Increment clicks counter
  const updatedUrl = await urlRepository.incrementClicks(code);
  return updatedUrl;
}

async function getMyUrls(userId) {
  return await urlRepository.findByUserId(userId);
}

module.exports = {
  generateShortCode,
  shortenUrl,
  getOriginalUrl,
  getMyUrls,
};
