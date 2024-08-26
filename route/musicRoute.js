const { authentication } = require('../controller/authController');
const { createMusic } = require('../controller/musicController');


const router = require('express').Router();


router.route('/').post(authentication , createMusic);

module.exports = router;