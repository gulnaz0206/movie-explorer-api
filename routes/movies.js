const movieRouter = require('express').Router();
const { getUsersMovies, createMovie, deletedMovie } = require('../controllers/movies');
const { movieValidation, movieIdValidation } = require('../middlewares/validation');

movieRouter.get('/', getUsersMovies);
movieRouter.post('/', movieValidation, createMovie);
movieRouter.delete('/:movieId', movieIdValidation, deletedMovie);

module.exports = movieRouter;
