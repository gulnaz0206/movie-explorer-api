const jwt = require('jsonwebtoken');
const Unauthorized = require('../errors/Unauthorized');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  const { cookie } = req.headers;
  const { cookies } = req;
  if (!cookie) {
    return next(new Unauthorized('Необходимо пройти авторизацию'));
  }
  const cookieString = req.headers.cookie;
  const regex = /jwt=([^;]+)/;
  const match = cookieString.match(regex);
  const token = match ? match[1] : null;

  let payload;
  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key');
  } catch (err) {
    return next(new Unauthorized('Необходимо пройти авторизацию'));
  }
  req.user = payload;
  next();
};
