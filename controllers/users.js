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
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then(() => {
      res.status(CREATED).send(
        {
          data: {
            name, about, avatar, email,
          },
        },
      );
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
    return res.send({ data: user });
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
  const { name, about } = req.body.data;
  User.findByIdAndUpdate(req.user._id, { name, about }, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      if (!user) {
        throw new NotFound(NotFoundUser);
      }
      res.status(OK).send({ user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest(validationError));
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
      res.setHeader('Set-Cookie', `${token}`);
      res.send(user);
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
      res.status(OK).send({ user });
    })
    .catch(next);
};
