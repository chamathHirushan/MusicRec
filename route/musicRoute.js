const { authentication, restrictTo } = require('../controller/authController');
const { getMusicbyId } = require('../controller/musicController');
const { getAllMusic } = require('../controller/musicController');
const { createMusic } = require('../controller/musicController');


const router = require('express').Router();


router.route('/').post(authentication ,restrictTo('1'), createMusic).get(authentication, getAllMusic);
router.route('/:id').get(authentication, getMusicbyId);

module.exports = router;