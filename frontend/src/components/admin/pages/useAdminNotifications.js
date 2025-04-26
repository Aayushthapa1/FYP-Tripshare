import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import {
    addNotification,
    setActiveUsers,
    getUnreadCount
} from '../../Slices/notificationSlice';
import { Base_Backend_Url } from '../../../../constant';

/**
 * Custom hook to handle admin notifications via socket
 * @returns {Object} Object containing socket connection status and methods
 */
const useAdminNotifications = () => {
    const dispatch = useDispatch();
    const socket = useRef(null);

    // Get admin user info from Redux store
    const admin = useSelector((state) => state.auth.user);
    const isAdmin = admin?.role === "Admin";

    // Initialize socket connection
    useEffect(() => {
        // Only connect if user is authenticated and is an admin
        if (!admin?._id || !isAdmin) {
            return;
        }

        // Create connection
        const socketConnection = io(Base_Backend_Url || 'http://localhost:3000', {
            withCredentials: true,
            auth: {
                userId: admin._id,
                userRole: "Admin"
            }
        });

        socket.current = socketConnection;

        // Connection events
        socketConnection.on('connect', () => {
            console.log('Admin socket connected');

            // Authenticate
            socketConnection.emit('user_connected', {
                userId: admin._id,
                role: "Admin"
            });
        });

        socketConnection.on('disconnect', () => {
            console.log('Admin socket disconnected');
        });

        // Handle connection errors
        socketConnection.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        // Clean up on unmount
        return () => {
            socketConnection.disconnect();
        };
    }, [admin?._id, isAdmin, dispatch]);

    // Set up notification listeners
    useEffect(() => {
        if (!socket.current) return;

        // Listen for new ride requests
        socket.current.on('new_ride_request', (data) => {
            const notification = {
                _id: `ride_${data.rideId}_${Date.now()}`,
                type: 'ride_request',
                title: 'New Ride Request',
                message: `New ride from ${data.pickupLocationName || 'Unknown'} to ${data.dropoffLocationName || 'Unknown'}`,
                createdAt: new Date(data.timestamp || Date.now()),
                data: data,
                isRead: false
            };

            dispatch(addNotification(notification));
            playNotificationSound();

            // Show toast for new ride requests
            toast.info(`New ride request: ${notification.message}`, {
                position: "top-right",
                duration: 5000
            });

            // Update unread count
            dispatch(getUnreadCount());
        });

        // Listen for ride status changes
        socket.current.on('ride_status_changed', (data) => {
            let title = 'Ride Update';

            if (data.status === 'completed') {
                title = 'Ride Completed';
            } else if (data.status === 'canceled') {
                title = 'Ride Canceled';
            } else if (data.status === 'in_progress') {
                title = 'Ride Started';
            }

            const notification = {
                _id: `status_${data.rideId}_${Date.now()}`,
                type: 'ride_status',
                title: title,
                message: data.message || `Ride status changed to ${data.status}`,
                createdAt: new Date(data.timestamp || Date.now()),
                data: data,
                isRead: false
            };

            dispatch(addNotification(notification));
            playNotificationSound();

            // Update unread count
            dispatch(getUnreadCount());
        });

        // Listen for driver availability changes
        socket.current.on('driver_availability_update', (data) => {
            const notification = {
                _id: `driver_${data.driverId || 'unknown'}_${Date.now()}`,
                type: 'driver_update',
                title: data.available ? 'Driver Available' : 'Driver Unavailable',
                message: `Driver ${data.driverName || data.driverId || 'Unknown'} is now ${data.available ? 'available' : 'unavailable'}`,
                createdAt: new Date(data.timestamp || Date.now()),
                data: data,
                isRead: false
            };

            dispatch(addNotification(notification));

            // Update unread count
            dispatch(getUnreadCount());
        });

        // Listen for active users updates
        socket.current.on('active_users_update', (data) => {
            dispatch(setActiveUsers(data));
        });

        // Clean up listeners on unmount
        return () => {
            if (socket.current) {
                socket.current.off('new_ride_request');
                socket.current.off('ride_status_changed');
                socket.current.off('driver_availability_update');
                socket.current.off('active_users_update');
            }
        };
    }, [dispatch]);

    // Play notification sound
    const playNotificationSound = () => {
        try {
            const audio = new Audio('/notification-sound.mp3');
            audio.volume = 0.3;
            audio.play().catch(e => console.log('Could not play notification sound', e));
        } catch (error) {
            console.log('Could not play notification sound');
        }
    };

    // Join a specific ride room to get updates
    const joinRideRoom = (rideId) => {
        if (!socket.current || !rideId) return;

        socket.current.emit('join_ride_room', { rideId });
        console.log(`Joined ride room for: ${rideId}`);
    };

    // Join a specific chat room
    const joinChatRoom = (rideId) => {
        if (!socket.current || !rideId) return;

        socket.current.emit('join_chat_room', { rideId });
        console.log(`Joined chat room for: ${rideId}`);
    };

    return {
        socket: socket.current,
        joinRideRoom,
        joinChatRoom
    };
};

export default useAdminNotifications;