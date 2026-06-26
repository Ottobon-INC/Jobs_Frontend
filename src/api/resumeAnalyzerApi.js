import api from './client';

/**
 * Call the ATS analysis backend endpoint with resume data (file or text) and job description.
 * @param {FormData} formData - Contains 'file' (optional), 'resume_text' (optional), and 'job_description' (required).
 */
export const analyzeResumeATS = async (formData) => {
    const config = {
        timeout: 150000, // 150 seconds to allow deep LLM reasoning and prompt generation
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    };

    const response = await api.post('/resume-builder/ats-analyzer', formData, config);
    return response.data;
};

/**
 * Parses unstructured resume text (or user's saved resume text) into the structured Reactive Resume v5 schema.
 * @param {object} payload - Optional payload containing { resume_text }
 */
export const parseResumeStructured = async (payload = {}) => {
    const response = await api.post('/resume-builder/parse-structured', payload, { timeout: 150000 });
    return response.data;
};

/**
 * Lists all structured resumes saved for the authenticated user.
 */
export const listUserResumes = async () => {
    const response = await api.get('/resume-builder/resumes');
    return response.data;
};

/**
 * Retrieves a single structured resume config by ID.
 * @param {string} resumeId 
 */
export const getUserResume = async (resumeId) => {
    const response = await api.get(`/resume-builder/resumes/${resumeId}`);
    return response.data;
};

/**
 * Saves a new structured resume config (data + styling layout) for the user.
 * @param {object} resumeData - Contains { title, resume_data, styling_config }
 */
export const saveUserResume = async (resumeData) => {
    const response = await api.post('/resume-builder/resumes', resumeData);
    return response.data;
};

/**
 * Updates an existing structured resume configuration.
 * @param {string} resumeId 
 * @param {object} updateData - Contains optional { title, resume_data, styling_config }
 */
export const updateUserResume = async (resumeId, updateData) => {
    const response = await api.put(`/resume-builder/resumes/${resumeId}`, updateData);
    return response.data;
};

/**
 * Deletes a saved structured resume by ID.
 * @param {string} resumeId 
 */
export const deleteUserResume = async (resumeId) => {
    const response = await api.delete(`/resume-builder/resumes/${resumeId}`);
    return response.data;
};

/**
 * Injects missing skills into a structured resume configuration seamlessly via AI.
 * @param {object} payload - Contains { resume_data, missing_skills }
 */
export const injectMissingSkills = async (payload) => {
    const response = await api.post('/resume-builder/inject-skills', payload, { timeout: 60000 });
    return response.data;
};
