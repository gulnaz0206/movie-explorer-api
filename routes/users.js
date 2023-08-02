const usersRouter = require('express').Router();
const { userValidation, userIdValidation } = require('../middlewares/validation');

const { getUserInfo, getUserById, updateUser } = require('../controllers/users');

usersRouter.get('/me', getUserInfo);
usersRouter.get('/:userId', userIdValidation, getUserById);
usersRouter.patch('/me', userValidation, updateUser);

module.exports = usersRouter;
