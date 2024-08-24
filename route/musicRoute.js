const { createMusic } = require('../controller/musicController');


const router = require('express').Router();


router.route('/').post(createMusic);

module.exports = router;