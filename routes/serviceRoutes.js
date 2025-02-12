const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

router.get('/services', serviceController.showServices);
router.post('/services/request', serviceController.requestService);

module.exports = router;