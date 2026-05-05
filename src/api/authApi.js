import { supabase } from './client';
import api from './client';

/**
 * Sign up directly via Supabase Auth.
 * User metadata is passed to options.data so the Postgres trigger can safely copy it to the users_jobs table.
 */
export const signUp = async (email, password, role, full_name, phone, location, skills = [], interests = "", dob = "", aspirations = [], avatar_url = "", work_preference = "Hybrid / Both", experience = "", work_experience_position = "", work_experience_description = "") => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                role,
                full_name,
                phone,
                location,
                skills,
                interests,
                dob,
                aspirations,
                avatar_url,
                work_preference,
                experience,
                work_experience_position,
                work_experience_description
            }
        }
    });

    if (error) throw error;
    
    return {
        user: data.user,
        session: data.session,
    };
};

/**
 * Sign in directly via Supabase — no rate limit issues for login.
 * (Rate limit was only on signup emails, not login.)
 */
export const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;
    return data;
};

export const signOut = async () => {
    localStorage.removeItem('ottobon_custom_token');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

export const getSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
};

export const getUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
};

export const initiateGoogleLogin = (role = 'seeker') => {
    // Redirect browser to the FastAPI Google login endpoint
    // Assuming backend runs on port 8001
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
    window.location.href = `${backendUrl}/auth/google/login?role=${role}`;
};
