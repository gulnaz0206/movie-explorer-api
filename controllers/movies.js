const Movie = require('../models/movie');
const NotFound = require('../errors/NotFound');
const BadRequest = require('../errors/BadRequest');
const Forbidden = require('../errors/Forbidden');

const {
  validationError,
  filmNotFound,
  canNotDelete,
  deletedMovie,
} = require('../utils/errorMessage');

module.exports.getUsersMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .then((movie) => res.status(200).send({ data: movie }))
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;
  const owner = req.user._id;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner,
  })
    .then((movie) => res.status(201).send({ movie }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest(validationError));
      } else {
        next(err);
      }
    });
};
module.exports.deletedMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .then((movie) => {
      if (!movie) {
        throw new NotFound(filmNotFound);
      }
      if (movie.owner.toString() !== req.user._id.toString()) {
        throw new Forbidden(canNotDelete);
      }
      return movie.remove()
        .then(() => res.status(200).send({ message: deletedMovie }));
    })
    .catch(next);
};
