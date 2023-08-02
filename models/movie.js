const mongoose = require('mongoose');
const isURL = require('validator/lib/isURL');

const movieSchema = new mongoose.Schema(
  {
    county: {
      type: String,
      required: true,
    },
    director: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
      validate: {
        validator: (url) => isURL(url),
        message: 'Неккоректная ссылка',
      },
    },
    trailerLink: {
      type: String,
      required: true,
      validate: {
        validator: (url) => isURL(url),
        message: 'Неккоректная ссылка',
      },
    },
    thumbnail: {
      type: String,
      required: true,
      validate: {
        validator: (url) => isURL(url),
        message: 'Неккоректная ссылка',
      },
    },
    movieId: {
      type: String,
      required: true,
    },
    nameRU: {
      type: String,
      required: true,
    },
    nameEN: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
  },
);
module.exports = mongoose.model('movie', movieSchema);
