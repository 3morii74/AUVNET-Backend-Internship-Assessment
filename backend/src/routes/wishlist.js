const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const auth = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(auth);

router.post('/', wishlistController.addToWishlist);
router.get('/', wishlistController.getWishlist);
router.delete('/:productId', wishlistController.removeFromWishlist);

module.exports = router; 