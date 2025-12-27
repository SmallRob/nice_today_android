import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);

    const showNotification = useCallback((options) => {
        // options: { type, title, message, actions: [{ label, onClick, primary }], duration, onClose }
        setNotification(options);

        // 如果指定了时长且没有操作按钮，则自动关闭
        if (options.duration && (!options.actions || options.actions.length === 0)) {
            setTimeout(() => {
                setNotification(null);
                if (options.onClose) options.onClose();
            }, options.duration);
        }
    }, []);

    const hideNotification = useCallback(() => {
        if (notification && notification.onClose) {
            notification.onClose();
        }
        setNotification(null);
    }, [notification]);

    return (
        <NotificationContext.Provider value={{ showNotification, hideNotification }}>
            {children}
            {notification && (
                <GlobalNotificationUI
                    {...notification}
                    onClose={hideNotification}
                />
            )}
        </NotificationContext.Provider>
    );
};

const GlobalNotificationUI = ({ type, title, message, actions, onClose }) => {
    const getIcon = () => {
        switch (type) {
            case 'update':
                return (
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                );
            case 'success':
                return (
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] p-4 flex justify-center animate-slide-down pointer-events-none">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-md pointer-events-auto overflow-hidden">
                <div className="p-4 flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-opacity-10 rounded-full p-2">
                        {getIcon()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-white">
                            {message}
                        </p>
                        {actions && actions.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {actions.map((action, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            if (action.onClick) action.onClick();
                                            onClose();
                                        }}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${action.primary
                                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                {/* 指示条 */}
                <div className={`h-1 w-full ${type === 'update' ? 'bg-blue-500' :
                        type === 'success' ? 'bg-green-500' :
                            type === 'warning' ? 'bg-yellow-500' :
                                type === 'error' ? 'bg-red-500' :
                                    'bg-blue-500'
                    } opacity-50`}></div>
            </div>
        </div>
    );
};
