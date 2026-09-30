const authService = require('../services/auth.service');

async function signup(req, res) {
  try {
    const { name, email, password } = req.body;
    const data = await authService.signup(name, email, password);
    res.status(201).json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const data = await authService.login(email, password);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
}

async function me(req, res) {
  try {
    const user = await authService.getMe(req.user.id);
    res.json({ user });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
}

module.exports = {
  signup,
  login,
  me,
};
