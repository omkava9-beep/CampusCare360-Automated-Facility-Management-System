import { useSearchParams } from 'react-router-dom';

/**
 * Reads the QR location from the URL (?qr=<locationId>).
 * Manages per-location session tokens in localStorage.
 */
export const useQRSession = () => {
    const [searchParams] = useSearchParams();
    const locationId = searchParams.get('qr');

    const sessionKey = locationId ? `student_session_${locationId}` : null;

    const savedSession = (() => {
        if (!sessionKey) return null;
        try {
            const raw = localStorage.getItem(sessionKey);
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    })();

    const hasSession = !!savedSession?.token;

    const saveSession = (token, user) => {
        if (!sessionKey) return;
        localStorage.setItem(sessionKey, JSON.stringify({ token, user, savedAt: Date.now() }));
    };

    const clearSession = () => {
        if (sessionKey) localStorage.removeItem(sessionKey);
    };

    return { locationId, hasSession, savedSession, saveSession, clearSession };
};
