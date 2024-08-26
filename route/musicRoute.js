const { authentication, restrictTo } = require('../controller/authController');
const { createMusic } = require('../controller/musicController');


const router = require('express').Router();


router.route('/').post(authentication ,restrictTo('2'), createMusic);

module.exports = router;