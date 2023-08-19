const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OK, CREATED } = require('../utils/responseStatus');
const User = require('../models/user');
const BadRequest = require('../errors/BadRequest');
const NotFound = require('../errors/NotFound');
const Conflict = require('../errors/Conflict');
const { validationError, NotFoundUser, UserAlreadyExist } = require('../utils/errorMessage');

// const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(OK).send(users))
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      email,
      password: hash,
    }))
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
      res.cookie('jwt', token, {
        // path: '/',
        // такая кука будет храниться 7 дней
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        // защита от автоматической отправки кук
        // указать браузеру, чтобы тот посылал куки, только если запрос сделан с того же домена
        sameSite: 'none',
        secure: true,
      });

      res.status(CREATED).send({ name, email });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest(`Ошибка валидации: ${err.message}`));
      } if (err.code === 11000) {
        next(new Conflict(UserAlreadyExist));
      } else {
        next(err);
      }
    });
};

module.exports.checkUser = (user, res, next) => {
  if (user) {
    return res.send(user);
  }
  const error = new NotFound(NotFoundUser);
  return next(error);
};

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        throw new NotFound(NotFoundUser);
      }
      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest(validationError));
      } else {
        next(err);
      }
    });
};

module.exports.updateUser = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, email }, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      if (!user) {
        throw new NotFound(NotFoundUser);
      }
      res.status(OK).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest(`Ошибка валидации: ${err.message}`));
      } if (err.code === 11000) {
        next(new Conflict(UserAlreadyExist));
      } else {
        next(err);
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
      res.cookie('jwt', token, {
        // path: '/',
        // такая кука будет храниться 7 дней
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        // защита от автоматической отправки кук
        // указать браузеру, чтобы тот посылал куки, только если запрос сделан с того же домена
        sameSite: 'none',
        secure: true,
      });
      const { name, email } = user;
      res.send({ name, email });
      req.body.user = user;
    })
    .catch(next);
};

module.exports.getUserInfo = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFound(NotFoundUser);
      }
      res.status(OK).send(user);
    })
    .catch(next);
};
module.exports.logout = (req, res, next) => {
  try {
    res.clearCookie('jwt', {
      path: '/',
      sameSite: 'none',
      secure: true,
    }).send({ message: 'Вы вышли!' });
  } catch (err) {
    next(err);
  }
};
