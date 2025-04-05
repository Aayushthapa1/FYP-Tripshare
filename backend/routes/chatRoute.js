import express from 'express';
import { body, param, query } from 'express-validator';
import * as chatController from '../controllers/chatController.js';
import { upload } from '../controllers/uploadController.js';
import { protectRoute } from '../middlewares/protectRoute.js';
import {
  validateRequest,
  validateMongoId,
  validatePagination,
  sanitizeRequest
} from '../middlewares/validateRequest.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protectRoute);

// Apply sanitization to all requests
router.use(sanitizeRequest());

// ===== SPECIFIC ROUTES (must come before parameterized routes) =====

// Get unread count across all trips
router.get('/unread/count', chatController.getUnreadCount);

// Get message by ID
router.get('/message/:messageId',
  validateMongoId('messageId'),
  validateRequest,
  chatController.getMessageById
);

// Search messages in a trip
router.get('/search/:tripId', [
  param('tripId').isMongoId().withMessage('Invalid trip ID format'),
  query('query').isString().notEmpty().withMessage('Search query is required'),
  ...validatePagination(50),
  validateRequest
], chatController.searchMessages);

// Get chat statistics
router.get('/statistics/:tripId',
  validateMongoId('tripId'),
  validateRequest,
  chatController.getChatStatistics
);

// Send text message
router.post('/text', [
  body('tripId').isMongoId().withMessage('Invalid trip ID format'),
  body('content').isString().notEmpty().withMessage('Message content is required')
    .isLength({ max: 5000 }).withMessage('Message content too long (max 5000 characters)'),
  validateRequest
], chatController.sendTextMessage);

// Send image message (with upload middleware)
router.post('/image', [
  body('tripId').isMongoId().withMessage('Invalid trip ID format'),
  validateRequest
], upload.single('image'), chatController.sendImageMessage);

// Send file message (with upload middleware)
router.post('/file', [
  body('tripId').isMongoId().withMessage('Invalid trip ID format'),
  validateRequest
], upload.single('file'), chatController.sendFileMessage);

// Mark messages as read
router.post('/read', [
  body('tripId').isMongoId().withMessage('Invalid trip ID format'),
  body('messageIds').isArray({ min: 1 }).withMessage('At least one message ID is required'),
  body('messageIds.*').isMongoId().withMessage('Invalid message ID format'),
  validateRequest
], chatController.markMessagesAsRead);

// Set typing status (new)
router.post('/typing', [
  body('tripId').isMongoId().withMessage('Invalid trip ID format'),
  body('isTyping').isBoolean().withMessage('isTyping must be a boolean'),
  validateRequest
], chatController.setTypingStatus);

// ===== PARAMETERIZED ROUTES (must come after specific routes) =====

// Get messages for a trip
router.get('/:tripId', [
  validateMongoId('tripId'),
  ...validatePagination(100),
  validateRequest
], chatController.getTripMessages);

// Delete message
router.delete('/:messageId',
  validateMongoId('messageId'),
  validateRequest,
  chatController.deleteMessage
);

export default router;