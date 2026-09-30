const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repository/user.repository');

// 1. generate token service
function generateToken(user) {

  return jwt.sign(
    { id: user.id, email: user.email }, // payload
    process.env.JWT_SECRET, // secret key
    { expiresIn: process.env.JWT_EXPIRES_IN } // expiry time
  );
}

// 2. signup service
async function signup(name, email, password) {
  if (!name || !email || !password) {
    throw { status: 400, message: 'Please provide all required fields' };
  }

  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw { status: 400, message: 'Email already registered' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await userRepository.createUser(name, email, hashedPassword);
  const token = generateToken(user);

  return { user, token };
}

// 3. login service
async function login(email, password) {
  if (!email || !password) {
    throw { status: 400, message: 'Email and password are required' };
  }

  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw { status: 401, message: 'Invalid email or password' };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw { status: 401, message: 'Invalid email or password' };
  }

  delete user.password;
  const token = generateToken(user);

  return { user, token };
}

// 4. get me service
async function getMe(userId) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw { status: 404, message: 'User not found' };
  }
  return user;
}

module.exports = {
  signup,
  login,
  getMe,
};
