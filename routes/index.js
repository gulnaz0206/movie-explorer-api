const router = require('express').Router();
const { authValidation, regValidation } = require('../middlewares/validation');
const { login, createUser, logout } = require('../controllers/users');
const moviesRouter = require('./movies');
const usersRouter = require('./users');
const auth = require('../middlewares/auth');
const NotFound = require('../errors/NotFound');

router.post('/signin', authValidation, login);
router.post('/signup', regValidation, createUser);

router.use(auth);
router.use('/users', usersRouter);
router.use('/movies', moviesRouter);
router.get('/signout', logout); // роутер для очищения куки при выходе

router.use('*', (req, res, next) => {
  next(new NotFound('Страница не найдена'));
});

module.exports = router;
