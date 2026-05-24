/**
 * Utility function to determine the status of a live session based on current time.
 * @param {Object} session - The session object containing scheduled_date, start_time, and end_time.
 * @returns {string} - 'UPCOMING', 'LIVE', or 'COMPLETED'.
 */
export const getSessionStatus = (session) => {
    return session?.status || 'UPCOMING';
};
