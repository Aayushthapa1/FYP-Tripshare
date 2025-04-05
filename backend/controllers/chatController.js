//--------------------------------------------------------
// chatController.js
//--------------------------------------------------------
import mongoose from "mongoose";
import fs from "fs/promises";

import Message from "../models/chatModel.js";
import Trip from "../models/TripModel.js";
import Booking from "../models/bookingModel.js"; // Ensure you import your Booking model
import { processAndUploadImage, processAndUploadFile } from "./uploadController.js";
import { getPublicIdFromUrl, deleteCloudinaryAssets } from "../utils/cloudinaryCleanup.js";

/**
 * verifyTripAccess:
 * Checks if the given user has access to a trip (either as the trip creator,
 * the driver, or has a valid booking).
 */
export const verifyTripAccess = async (tripId, userId) => {
    if (!mongoose.Types.ObjectId.isValid(tripId)) {
        return null;
    }

    // Check if user is the trip's creator or driver
    const directAccess = await Trip.findOne({
        _id: tripId,
        $or: [{ user: userId }, { driver: userId }],
    });
    if (directAccess) {
        return directAccess;
    }

    // Otherwise, check if user has a valid booking
    const bookingAccess = await Booking.findOne({
        trip: tripId,
        user: userId,
        status: { $in: ["booked", "completed"] }, // Only active or completed bookings
    });
    if (bookingAccess) {
        // Return the Trip doc
        return await Trip.findById(tripId);
    }

    return null;
};

/**
 * Initialize Chat for a Trip
 * Optionally sends an initial "system" or user/driver message.
 */
export const initializeChat = async (tripId, userId, message, req) => {
    try {
        if (
            !mongoose.Types.ObjectId.isValid(tripId) ||
            !mongoose.Types.ObjectId.isValid(userId)
        ) {
            console.error("Invalid tripId or userId for chat initialization");
            return null;
        }

        // Ensure the trip exists
        const trip = await Trip.findById(tripId);
        if (!trip) {
            console.error("Trip not found for chat initialization");
            return null;
        }

        // Determine the sender type
        let senderType = "system";
        if (trip.user && trip.user.equals(userId)) {
            senderType = "user";
        } else if (trip.driver && trip.driver.equals(userId)) {
            senderType = "driver";
        }

        // Create the initial message
        const newMessage = new Message({
            tripId,
            sender: userId,
            senderType,
            messageType: "text",
            content: message,
            read: false,
        });
        await newMessage.save();

        // If using "req.io", broadcast the message
        if (req?.io) {
            req.io.to(tripId.toString()).emit("new_message", newMessage);
        }

        return newMessage;
    } catch (error) {
        console.error("Error initializing chat:", error);
        return null;
    }
};

/**
 * GET /api/chat/:tripId
 * Retrieves messages for a trip with pagination.
 * Marks relevant messages as read if they are from other users.
 */
export const getTripMessages = async (req, res) => {
    try {
        const { tripId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        if (!mongoose.Types.ObjectId.isValid(tripId)) {
            return res.status(400).json({ message: "Invalid trip ID format" });
        }

        const parsedPage = parseInt(page, 10);
        const parsedLimit = parseInt(limit, 10);

        if (isNaN(parsedPage) || parsedPage < 1) {
            return res
                .status(400)
                .json({ message: "Page must be a positive integer" });
        }
        if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
            return res
                .status(400)
                .json({ message: "Limit must be between 1 and 100" });
        }

        // Verify user access
        const trip = await verifyTripAccess(tripId, req.user._id);
        if (!trip) {
            return res.status(403).json({ message: "Access to this trip denied" });
        }

        // Query messages
        const messages = await Message.find({ tripId })
            .sort({ createdAt: -1 })
            .limit(parsedLimit)
            .skip((parsedPage - 1) * parsedLimit)
            .populate("sender", "name avatar")
            .lean();

        // Mark unread messages as read
        const updateResult = await Message.updateMany(
            {
                tripId,
                sender: { $ne: req.user._id },
                read: false,
            },
            { $set: { read: true } }
        );

        // Count total messages
        const totalMessages = await Message.countDocuments({ tripId });
        const totalPages = Math.ceil(totalMessages / parsedLimit);

        // If we updated some unread messages, broadcast that
        if (updateResult.modifiedCount > 0 && req.io) {
            req.io.to(tripId).emit("messages_read", {
                tripId,
                userId: req.user._id,
                count: updateResult.modifiedCount,
            });
        }

        res.json({
            messages: messages.reverse(), // Because we sorted desc
            totalPages,
            currentPage: parsedPage,
            nextPage: parsedPage < totalPages ? parsedPage + 1 : null,
            prevPage: parsedPage > 1 ? parsedPage - 1 : null,
            totalMessages,
            unreadMarked: updateResult.modifiedCount,
        });
    } catch (error) {
        console.error("Error in getTripMessages:", error);

        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * POST /api/chat/text
 * Sends a text message in a trip's chat.
 */
export const sendTextMessage = async (req, res) => {
    try {
        const { tripId, content } = req.body;

        if (!mongoose.Types.ObjectId.isValid(tripId)) {
            return res.status(400).json({ message: "Invalid trip ID format" });
        }
        if (!content || typeof content !== "string" || !content.trim()) {
            return res
                .status(400)
                .json({ message: "Message content is required and cannot be empty" });
        }
        if (content.length > 5000) {
            return res
                .status(400)
                .json({ message: "Message content too long (max 5000 chars)" });
        }

        // Check trip access
        const trip = await verifyTripAccess(tripId, req.user._id);
        if (!trip) {
            return res.status(403).json({ message: "Access to this trip denied" });
        }

        // Determine sender type
        const senderType = trip.user.equals(req.user._id) ? "user" : "driver";

        // Create the message
        const newMessage = new Message({
            tripId,
            sender: req.user._id,
            senderType,
            messageType: "text",
            content: content.trim(),
        });
        await newMessage.save();

        // Populate sender info for the response
        const populatedMessage = await Message.findById(newMessage._id)
            .populate("sender", "name avatar")
            .lean();

        // Broadcast the new message
        if (req.io) {
            req.io.to(tripId.toString()).emit("new_message", populatedMessage);

            // If you have a typing indicator, you can also send "typing_stopped" here
            req.io.to(tripId.toString()).emit("typing_stopped", {
                tripId,
                userId: req.user._id,
            });
        }

        return res.status(201).json(populatedMessage);
    } catch (error) {
        console.error("Error in sendTextMessage:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({ message: error.message });
        }

        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * POST /api/chat/image
 * Sends an image in a trip's chat.
 */
export const sendImageMessage = async (req, res) => {
    let filePath = null;
    try {
        const { tripId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(tripId)) {
            return res.status(400).json({ message: "Invalid trip ID format" });
        }
        if (!req.file) {
            return res.status(400).json({ message: "No image file provided" });
        }

        filePath = req.file.path;

        // Check trip access
        const trip = await verifyTripAccess(tripId, req.user._id);
        if (!trip) {
            await fs.unlink(filePath).catch(() => { });
            return res.status(403).json({ message: "Access to this trip denied" });
        }

        // Upload image to Cloudinary
        const {
            mediaUrl,
            mediaThumbnail,
            mediaDimensions,
            fileType,
            mediaSize,
            publicId,
        } = await processAndUploadImage(filePath, {
            transformation: { quality: "auto", fetch_format: "auto" },
            folder: `tripshare/trips/${tripId}/images`,
        });
        // File is removed by processAndUploadImage
        filePath = null;

        const senderType = trip.user.equals(req.user._id) ? "user" : "driver";

        // Create the message doc
        const newMessage = new Message({
            tripId,
            sender: req.user._id,
            senderType,
            messageType: "image",
            mediaUrl,
            mediaThumbnail,
            mediaDimensions,
            mediaSize,
            fileType,
            fileName: req.file.originalname,
        });
        await newMessage.save();

        // Populate for response
        const populatedMessage = await Message.findById(newMessage._id)
            .populate("sender", "name avatar")
            .lean();

        // Emit socket event
        if (req.io) {
            req.io.to(tripId.toString()).emit("new_message", populatedMessage);
        }

        return res.status(201).json(populatedMessage);
    } catch (error) {
        console.error("Error in sendImageMessage:", error);

        // Clean up if something went wrong
        if (filePath) {
            await fs.unlink(filePath).catch(() => { });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({ message: error.message });
        }

        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * POST /api/chat/file
 * Sends a file in a trip's chat.
 */
export const sendFileMessage = async (req, res) => {
    let filePath = null;
    try {
        const { tripId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(tripId)) {
            return res.status(400).json({ message: "Invalid trip ID format" });
        }
        if (!req.file) {
            return res.status(400).json({ message: "No file provided" });
        }

        filePath = req.file.path;

        // Check trip access
        const trip = await verifyTripAccess(tripId, req.user._id);
        if (!trip) {
            await fs.unlink(filePath).catch(() => { });
            return res.status(403).json({ message: "Access to this trip denied" });
        }

        // Upload the file
        const { mediaUrl, fileType, mediaSize, publicId } = await processAndUploadFile(
            filePath,
            {
                resource_type: "auto",
                folder: `tripshare/trips/${tripId}/files`,
            }
        );
        // The file is removed by processAndUploadFile
        filePath = null;

        const senderType = trip.user.equals(req.user._id) ? "user" : "driver";

        // Create the message doc
        const newMessage = new Message({
            tripId,
            sender: req.user._id,
            senderType,
            messageType: "file",
            mediaUrl,
            mediaSize,
            fileType,
            fileName: req.file.originalname,
        });
        await newMessage.save();

        // Populate for response
        const populatedMessage = await Message.findById(newMessage._id)
            .populate("sender", "name avatar")
            .lean();

        // Emit socket event
        if (req.io) {
            req.io.to(tripId.toString()).emit("new_message", populatedMessage);
        }

        return res.status(201).json(populatedMessage);
    } catch (error) {
        console.error("Error in sendFileMessage:", error);

        if (filePath) {
            await fs.unlink(filePath).catch(() => { });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({ message: error.message });
        }

        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * DELETE /api/chat/:messageId
 * Deletes a message (if user is the sender).
 */
export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(messageId)) {
            return res.status(400).json({ message: "Invalid message ID format" });
        }

        // Confirm user is the message sender
        const message = await Message.findOne({
            _id: messageId,
            sender: req.user._id,
        });
        if (!message) {
            return res
                .status(404)
                .json({ message: "Message not found or not authorized" });
        }

        // Delete the message
        await message.deleteOne();

        // If it's an image or file, try removing from Cloudinary
        if (["image", "file"].includes(message.messageType)) {
            try {
                const publicIds = [];

                if (message.mediaUrl) {
                    const urlPublicId = getPublicIdFromUrl(message.mediaUrl);
                    if (urlPublicId) publicIds.push(urlPublicId);
                }
                if (message.mediaThumbnail) {
                    const thumbPublicId = getPublicIdFromUrl(message.mediaThumbnail);
                    if (thumbPublicId) publicIds.push(thumbPublicId);
                }

                if (publicIds.length > 0) {
                    await deleteCloudinaryAssets(publicIds);
                }
            } catch (cloudErr) {
                console.error("Error deleting Cloudinary assets:", cloudErr);
                // Not critical, continue
            }
        }

        // Emit socket event
        if (req.io && message.tripId) {
            req.io.to(message.tripId.toString()).emit("message_deleted", {
                messageId,
                tripId: message.tripId,
            });
        }

        return res.json({
            message: "Message deleted successfully",
            deletedMessageId: messageId,
        });
    } catch (error) {
        console.error("Error in deleteMessage:", error);

        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * GET /api/chat/unread/count
 * Returns the total unread messages for the current user across all trips,
 * plus a breakdown by trip.
 */
export const getUnreadCount = async (req, res) => {
    try {
        // Find all trips where this user is the trip creator or the driver
        const userTrips = await Trip.find({
            $or: [{ user: req.user._id }, { driver: req.user._id }],
        }).select("_id");
        const tripIds = userTrips.map((t) => t._id);

        if (tripIds.length === 0) {
            return res.json({ count: 0 });
        }

        // Count unread messages
        const count = await Message.countDocuments({
            tripId: { $in: tripIds },
            sender: { $ne: req.user._id },
            read: false,
        });

        // Breakdown by trip
        const tripBreakdown = await Message.aggregate([
            {
                $match: {
                    tripId: { $in: tripIds },
                    sender: { $ne: req.user._id },
                    read: false,
                },
            },
            {
                $group: {
                    _id: "$tripId",
                    count: { $sum: 1 },
                    lastMessage: { $max: "$createdAt" },
                },
            },
            { $sort: { lastMessage: -1 } },
        ]);

        return res.json({ count, tripBreakdown });
    } catch (error) {
        console.error("Error in getUnreadCount:", error);
        return res
            .status(500)
            .json({ message: "Server error", error: error.message });
    }
};

/**
 * GET /api/chat/message/:messageId
 * Returns a single message by ID if the user has access to the trip.
 */
export const getMessageById = async (req, res) => {
    try {
        const { messageId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(messageId)) {
            return res.status(400).json({ message: "Invalid message ID format" });
        }

        // Find the message
        const message = await Message.findById(messageId)
            .populate("sender", "name avatar")
            .lean();
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Check trip access
        const trip = await verifyTripAccess(message.tripId, req.user._id);
        if (!trip) {
            return res.status(403).json({ message: "Access to this message denied" });
        }

        return res.json(message);
    } catch (error) {
        console.error("Error in getMessageById:", error);

        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * POST /api/chat/read
 * Marks multiple messages as read, if user has trip access.
 */
export const markMessagesAsRead = async (req, res) => {
    try {
        const { tripId, messageIds } = req.body;

        if (!mongoose.Types.ObjectId.isValid(tripId)) {
            return res.status(400).json({ message: "Invalid trip ID format" });
        }
        if (!Array.isArray(messageIds) || messageIds.length === 0) {
            return res.status(400).json({ message: "Message IDs are required" });
        }

        // Filter out invalid IDs
        const validMessageIds = messageIds.filter((id) =>
            mongoose.Types.ObjectId.isValid(id)
        );
        if (validMessageIds.length === 0) {
            return res
                .status(400)
                .json({ message: "No valid message IDs provided" });
        }

        // Check trip access
        const trip = await verifyTripAccess(tripId, req.user._id);
        if (!trip) {
            return res.status(403).json({ message: "Access to this trip denied" });
        }

        // Mark as read if they are from other users
        const result = await Message.updateMany(
            {
                _id: { $in: validMessageIds },
                tripId,
                sender: { $ne: req.user._id },
                read: false,
            },
            { $set: { read: true } }
        );

        // Notify via socket
        if (req.io && result.modifiedCount > 0) {
            req.io.to(tripId.toString()).emit("messages_read", {
                tripId,
                messageIds: validMessageIds,
                userId: req.user._id,
            });
        }

        return res.json({
            message: "Messages marked as read",
            count: result.modifiedCount,
        });
    } catch (error) {
        console.error("Error in markMessagesAsRead:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * GET /api/chat/statistics/:tripId
 * Provides stats about the chat in a trip (message counts, types, etc.).
 */
export const getChatStatistics = async (req, res) => {
    try {
        const { tripId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(tripId)) {
            return res.status(400).json({ message: "Invalid trip ID format" });
        }

        // Check access
        const trip = await verifyTripAccess(tripId, req.user._id);
        if (!trip) {
            return res.status(403).json({ message: "Access to this trip denied" });
        }

        // Summaries by message type
        const stats = await Message.aggregate([
            { $match: { tripId: new mongoose.Types.ObjectId(tripId) } },
            {
                $group: {
                    _id: "$messageType",
                    count: { $sum: 1 },
                },
            },
        ]);

        // Total and unread count
        const totalMessages = await Message.countDocuments({ tripId });
        const unreadMessages = await Message.countDocuments({
            tripId,
            sender: { $ne: req.user._id },
            read: false,
        });

        // Sender stats
        const senderStats = await Message.aggregate([
            { $match: { tripId: new mongoose.Types.ObjectId(tripId) } },
            {
                $group: {
                    _id: "$sender",
                    count: { $sum: 1 },
                    lastMessage: { $max: "$createdAt" },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "senderInfo",
                },
            },
            {
                $project: {
                    count: 1,
                    lastMessage: 1,
                    sender: { $arrayElemAt: ["$senderInfo", 0] },
                },
            },
            {
                $project: {
                    count: 1,
                    lastMessage: 1,
                    "sender.name": 1,
                    "sender._id": 1,
                },
            },
        ]);

        // Messages per day for the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const timeStats = await Message.aggregate([
            {
                $match: {
                    tripId: new mongoose.Types.ObjectId(tripId),
                    createdAt: { $gte: sevenDaysAgo },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.json({
            totalMessages,
            unreadMessages,
            messageTypes: stats.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {}),
            senderStats,
            messagesByDay: timeStats,
        });
    } catch (error) {
        console.error("Error in getChatStatistics:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * POST /api/chat/typing
 * Sets or clears a typing indicator for a user in a trip.
 */
export const setTypingStatus = async (req, res) => {
    try {
        const { tripId, isTyping } = req.body;

        if (!mongoose.Types.ObjectId.isValid(tripId)) {
            return res.status(400).json({ message: "Invalid trip ID format" });
        }
        if (typeof isTyping !== "boolean") {
            return res.status(400).json({ message: "isTyping must be a boolean" });
        }

        // Check trip access
        const trip = await verifyTripAccess(tripId, req.user._id);
        if (!trip) {
            return res.status(403).json({ message: "Access to this trip denied" });
        }

        // Broadcast via socket
        if (req.io) {
            const eventName = isTyping ? "typing_started" : "typing_stopped";
            req.io.to(tripId.toString()).emit(eventName, {
                tripId,
                userId: req.user._id,
                userName: req.user.name,
                timestamp: new Date(),
            });
        }

        return res.json({ success: true });
    } catch (error) {
        console.error("Error in setTypingStatus:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * GET /api/chat/search/:tripId
 * Searches messages by content or fileName for a given trip.
 */
export const searchMessages = async (req, res) => {
    try {
        const { tripId } = req.params;
        const { query, page = 1, limit = 20 } = req.query;

        if (!mongoose.Types.ObjectId.isValid(tripId)) {
            return res.status(400).json({ message: "Invalid trip ID format" });
        }
        if (!query || typeof query !== "string" || !query.trim()) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const parsedPage = parseInt(page, 10);
        const parsedLimit = parseInt(limit, 10);

        if (isNaN(parsedPage) || parsedPage < 1) {
            return res
                .status(400)
                .json({ message: "Page must be a positive integer" });
        }
        if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
            return res
                .status(400)
                .json({ message: "Limit must be between 1 and 50" });
        }

        // Check trip access
        const trip = await verifyTripAccess(tripId, req.user._id);
        if (!trip) {
            return res.status(403).json({ message: "Access to this trip denied" });
        }

        const searchRegex = new RegExp(query.trim(), "i");

        const messages = await Message.find({
            tripId,
            $or: [{ content: searchRegex }, { fileName: searchRegex }],
        })
            .sort({ createdAt: -1 })
            .limit(parsedLimit)
            .skip((parsedPage - 1) * parsedLimit)
            .populate("sender", "name avatar")
            .lean();

        const totalMessages = await Message.countDocuments({
            tripId,
            $or: [{ content: searchRegex }, { fileName: searchRegex }],
        });
        const totalPages = Math.ceil(totalMessages / parsedLimit);

        return res.json({
            messages,
            totalMessages,
            totalPages,
            currentPage: parsedPage,
            nextPage: parsedPage < totalPages ? parsedPage + 1 : null,
            prevPage: parsedPage > 1 ? parsedPage - 1 : null,
            query,
        });
    } catch (error) {
        console.error("Error in searchMessages:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
