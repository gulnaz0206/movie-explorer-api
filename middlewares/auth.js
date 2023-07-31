const jwt = require('jsonwebtoken');
const Unauthorized = require('../errors/Unauthorized');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  const { cookie } = req.headers;
  if (!cookie) {
    return next(new Unauthorized('Необходимо пройти авторизацию'));
  }
  const token = cookie.replace('; foo=bar', '');
  let payload;
  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key');
  } catch (err) {
    return next(new Unauthorized('Необходимо пройти авторизацию'));
  }
  req.user = payload;
  next();
};
