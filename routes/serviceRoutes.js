const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

router.get('/services', serviceController.showServicesPage);
router.get('/services/add', serviceController.showAddServiceForm);
router.post('/services/add', serviceController.addService);
router.delete('/services/delete/:id', serviceController.deleteService);

module.exports = router;