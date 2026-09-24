const express = require('express');
const { getHello } = require('../controllers/helloController');

const router = express.Router();

router.get('/', getHello);

module.exports = router;