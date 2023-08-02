require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const helmet = require('helmet');
const { errors } = require('celebrate');
const { CORS } = require('./middlewares/CORS');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const rateLimit = require('./middlewares/rateLimit');
const errorHandle = require('./middlewares/errorHandle');
const router = require('./routes/index');

const { PORT = 3000, DB_URL = 'mongodb://127.0.0.1:27017/bitfilmsdb' } = process.env;
const app = express();
app.use(express.json());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(CORS);
mongoose.connect(DB_URL)
  .then(() => console.log('connected'))
  .catch((err) => console.log(`Ошибка ${err}: ${err.message}`));
app.use(router);
app.use(rateLimit);
app.use(errorLogger);
app.use(requestLogger);
app.use(errors());
app.use(errorHandle);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
