import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '../api/client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { ROLES } from '../utils/constants';

import { generateUUID } from '../utils/uuid';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user, role } = useAuth();
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem(`notifications_${user?.id}`);
        return saved ? JSON.parse(saved) : [];
    });

    const addNotification = useCallback((notification) => {
        const newNotif = {
            id: generateUUID(),
            timestamp: new Date().toISOString(),
            isRead: false,
            ...notification
        };
        setNotifications(prev => {
            const updated = [newNotif, ...prev].slice(0, 50); // Keep last 50
            localStorage.setItem(`notifications_${user?.id}`, JSON.stringify(updated));
            return updated;
        });

        // Show toast
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full glass-panel border-none p-6 flex flex-col gap-2 shadow-2xl shadow-black/10`}>
                <div className="flex justify-between items-start">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Notification</p>
                    <button onClick={() => toast.dismiss(t.id)} className="text-zinc-300 hover:text-black transition-colors">✕</button>
                </div>
                <h4 className="text-sm font-bold text-black">{notification.title}</h4>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed">{notification.message}</p>
            </div>
        ), { duration: 5000 });
    }, [user?.id]);

    const markAsRead = (id) => {
        setNotifications(prev => {
            const updated = prev.map(n => n.id === id ? { ...n, isRead: true } : n);
            localStorage.setItem(`notifications_${user?.id}`, JSON.stringify(updated));
            return updated;
        });
    };

    const clearAll = () => {
        setNotifications([]);
        localStorage.removeItem(`notifications_${user?.id}`);
    };

    useEffect(() => {
        if (!user || !role) return;

        // Reset local storage key if user changes
        const saved = localStorage.getItem(`notifications_${user.id}`);
        setNotifications(saved ? JSON.parse(saved) : []);

        const channel = supabase
            .channel('mock_interviews_notifications')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'mock_interviews_jobs'
                },
                (payload) => {
                    const activeRole = role || user?.user_metadata?.role;
                    const isSeeker = activeRole === ROLES.SEEKER;
                    const isAdmin = activeRole === ROLES.ADMIN;

                    // 1. Seeker: Your review is completed
                    if (isSeeker && payload.eventType === 'UPDATE') {
                        const { new: newRow } = payload;
                        if (newRow.user_id === user.id && newRow.status === 'reviewed') {
                            addNotification({
                                title: 'Analysis Ready',
                                message: `Your mock interview analysis is ready for review.`,
                                type: 'success',
                                link: '/interview-reviews'
                            });
                        }
                    }

                    // 2. Admin: New submission received
                    if (isAdmin && payload.eventType === 'INSERT') {
                        addNotification({
                            title: 'New Submission',
                            message: `A new mock interview has been submitted.`,
                            type: 'info',
                            link: '/admin/interview-reviews'
                        });
                    }
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('📡 Notifications Subscribed');
                } else if (status === 'CHANNEL_ERROR') {
                    console.warn('📡 Notifications Channel Error - Check Supabase Realtime settings');
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, role, addNotification]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <NotificationContext.Provider value={{ 
            notifications, 
            unreadCount, 
            addNotification, 
            markAsRead, 
            clearAll 
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within NotificationProvider');
    return context;
};
