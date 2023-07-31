const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const isEmail = require('validator/lib/isEmail');
const Unauthorized = require('../errors/Unauthorized');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (email) => isEmail(email),
      message: ({ value }) => `${value} некорректный, попробуйте использовать другой email`,
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
}, { toJSON: { useProtection: true }, toObject: { useProtection: true }, versionKey: false });

userSchema.statics.findUserByCredentials = function findUserByCredentials(email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw Unauthorized('Неправильно введены почта или пароль');
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw Unauthorized('Неправильно введены почта или пароль');
          }
          return user;
        });
    });
};

userSchema.set('toJSON', {
  transform(doc, res) {
    delete res.password;
    return res;
  },
});

module.exports = mongoose.model('user', userSchema);
