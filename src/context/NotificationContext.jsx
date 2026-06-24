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
        if (!user?.id) return; // Don't subscribe until auth ready

        // Reset local storage key if user changes
        const saved = localStorage.getItem(`notifications_${user.id}`);
        setNotifications(saved ? JSON.parse(saved) : []);

        const storageKey = `last_notification_check_${user.id}`;
        // If no lastChecked exists, initialize it to the current time so we don't fetch historical items
        if (!localStorage.getItem(storageKey)) {
            localStorage.setItem(storageKey, new Date().toISOString());
        }

        const pollNotifications = async () => {
            try {
                const activeRole = role || user?.user_metadata?.role;
                const lastChecked = localStorage.getItem(storageKey) || new Date().toISOString();
                const currentPollTime = new Date().toISOString();
                let maxTimestamp = lastChecked;

                // 1a. Seeker: AI mock interview analysis ready
                if (activeRole === ROLES.SEEKER) {
                    const { data, error } = await supabase
                        .from('mock_interviews_jobs')
                        .select('id, status, updated_at, jobs_jobs(title)')
                        .eq('user_id', user.id)
                        .eq('status', 'reviewed')
                        .gt('updated_at', lastChecked);

                    if (error) {
                        console.error('📡 Error polling mock_interviews_jobs for seeker:', error);
                    } else if (data && data.length > 0) {
                        data.forEach(item => {
                            const jobTitle = item.jobs_jobs?.title || 'a recent role';
                            addNotification({
                                title: 'Analysis Ready',
                                message: `Your mock interview analysis for ${jobTitle} is ready for review.`,
                                type: 'success',
                                link: '/interview-reviews'
                            });
                            if (item.updated_at > maxTimestamp) {
                                maxTimestamp = item.updated_at;
                            }
                        });
                    }
                }

                // 1b. Seeker: pipeline stage promotions (R2, R3, scheduled, rejected)
                if (activeRole === ROLES.SEEKER) {
                    const PIPELINE_NOTIF_STATUSES = [
                        'mock_interview_pending',
                        'human_interview_pending',
                        'human_interview_scheduled',
                        'rejected',
                    ];
                    const { data: appData, error: appError } = await supabase
                        .from('job_applications_jobs')
                        .select('id, status, updated_at, job_id, jobs_jobs(title, company_name)')
                        .eq('seeker_id', user.id)
                        .in('status', PIPELINE_NOTIF_STATUSES)
                        .gt('updated_at', lastChecked);

                    if (appError) {
                        console.error('📡 Error polling job_applications_jobs for pipeline changes:', appError);
                    } else if (appData && appData.length > 0) {
                        appData.forEach(item => {
                            const jobTitle   = item.jobs_jobs?.title       || 'a role';
                            const company    = item.jobs_jobs?.company_name || '';
                            const byCompany  = company ? ` at ${company}` : '';

                            const notifMap = {
                                mock_interview_pending: {
                                    title: '🎯 Round 2 Unlocked',
                                    message: `Your application for ${jobTitle}${byCompany} passed screening! The AI Mock Interview is now open.`,
                                    link: '/my-applications',
                                },
                                human_interview_pending: {
                                    title: '🎉 Round 3 Unlocked',
                                    message: `Congratulations! You've been advanced to the Human Panel Interview for ${jobTitle}${byCompany}. Confirm your details now.`,
                                    link: '/my-applications',
                                },
                                human_interview_scheduled: {
                                    title: '📅 Interview Scheduled',
                                    message: `Your Human Panel Interview for ${jobTitle}${byCompany} has been confirmed. Check your booking details.`,
                                    link: '/my-applications',
                                },
                                rejected: {
                                    title: 'Application Update',
                                    message: `Your application for ${jobTitle}${byCompany} was not taken forward. Keep going — the right role is out there!`,
                                    link: '/my-applications',
                                },
                            };

                            const notif = notifMap[item.status];
                            if (notif) {
                                addNotification({ type: 'info', ...notif });
                            }

                            if (item.updated_at > maxTimestamp) {
                                maxTimestamp = item.updated_at;
                            }
                        });
                    }
                } // end seeker pipeline block

                // 2. Admin: New submission received
                if (activeRole === ROLES.ADMIN) {
                    const { data, error } = await supabase
                        .from('mock_interviews_jobs')
                        .select('id, status, created_at, jobs_jobs(title)')
                        .gt('created_at', lastChecked);

                    if (error) {
                        console.error('📡 Error polling mock_interviews_jobs for admin:', error);
                    } else if (data && data.length > 0) {
                        data.forEach(item => {
                            const jobTitle = item.jobs_jobs?.title || 'a recent role';
                            addNotification({
                                title: 'New Submission',
                                message: `A new mock interview review has been submitted for ${jobTitle}.`,
                                type: 'info',
                                link: '/admin/interview-reviews'
                            });
                            if (item.created_at > maxTimestamp) {
                                maxTimestamp = item.created_at;
                            }
                        });
                    }
                }

                // Save next check timestamp (advance to the latest record time or current poll time)
                const nextCheckTime = maxTimestamp > lastChecked ? maxTimestamp : currentPollTime;
                localStorage.setItem(storageKey, nextCheckTime);
            } catch (err) {
                console.error('📡 Failed to execute notification polling cycle:', err);
            }
        };

        // Run immediately on mount to catch any changes while offline/offline-between-reloads
        pollNotifications();

        // Start 30-second interval polling cycle
        const intervalId = setInterval(pollNotifications, 30000);

        return () => {
            console.log('🔌 Cleaning up Notification polling cycle');
            clearInterval(intervalId);
        };
    }, [user?.id, role, addNotification]);

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
