import api from './client';

/**
 * Course API client operations
 */

export const getCourses = async () => {
    const response = await api.get('/courses');
    return response.data;
};

export const getCourse = async (courseId) => {
    const response = await api.get(`/courses/${courseId}`);
    return response.data;
};

export const createCourse = async (courseData) => {
    const response = await api.post('/courses', courseData);
    return response.data;
};

export const updateCourse = async (courseId, courseData) => {
    const response = await api.patch(`/courses/${courseId}`, courseData);
    return response.data;
};

export const deleteCourse = async (courseId) => {
    const response = await api.delete(`/courses/${courseId}`);
    return response.data;
};
