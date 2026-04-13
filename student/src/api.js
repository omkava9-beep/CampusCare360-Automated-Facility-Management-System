// student/src/api.js

// Remove trailing slash from API URL if present
const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
export const BASE_URL = `${apiUrl}/api/v1`;

export const USER_API = {
    STUDENT_LOGIN: `${BASE_URL}/user/student/login`,
    MY_GRIEVANCES: (params) => `${BASE_URL}/user/student/grievances${params ? `?${params}` : ''}`,
    GRIEVANCE_DETAIL: (id) => `${BASE_URL}/user/student/grievances/${id}`,
    SUBMIT_GRIEVANCE: `${BASE_URL}/user/grievance/add`,
    STUDENT_PROFILE: `${BASE_URL}/user/student/profile`,
    CHANGE_PASSWORD: `${BASE_URL}/user/student/change-password`,
    LOCATION: (id) => `${BASE_URL}/user/student/location/${id}`
};
