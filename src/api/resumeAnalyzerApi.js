import api from './client';

/**
 * Call the ATS analysis backend endpoint with resume data (file or text) and job description.
 * @param {FormData} formData - Contains 'file' (optional), 'resume_text' (optional), and 'job_description' (required).
 */
export const analyzeResumeATS = async (formData) => {
    const config = {
        timeout: 90000, // 90 seconds to allow deep LLM reasoning and prompt generation
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    };

    const response = await api.post('/resume-builder/ats-analyzer', formData, config);
    return response.data;
};
