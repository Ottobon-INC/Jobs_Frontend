// SECURITY: Schema-based input validation — OWASP A03:2021
// All user inputs MUST pass through these validators before submission.

/** ── Field Constraints ──────────────────────────────────────── */
export const LIMITS = {
  EMAIL_MAX:        254,
  PASSWORD_MIN:     8,
  PASSWORD_MAX:     128,
  FULL_NAME_MAX:    100,
  PHONE_MAX:        20,
  LOCATION_MAX:     100,
  SKILL_MAX:        50,
  SKILLS_MAX_COUNT: 50,
  INTERESTS_MAX:    2000,
  ASPIRATION_MAX:   100,
  ASPIRATIONS_MAX:  5,
  JOB_TITLE_MAX:    200,
  JOB_DESC_MAX:     50000,
  CHAT_MSG_MAX:     5000,
  ADMIN_MSG_MAX:    5000,
  NEW_SKILL_MAX:    50,
};

/** Strict email regex (RFC 5322 simplified) */
export const isValidEmail = (email) =>
  typeof email === 'string' &&
  email.length <= LIMITS.EMAIL_MAX &&
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

/** Password: 8+ chars, at least one letter and one digit */
export const isValidPassword = (pw) =>
  typeof pw === 'string' &&
  pw.length >= LIMITS.PASSWORD_MIN &&
  pw.length <= LIMITS.PASSWORD_MAX &&
  /[a-zA-Z]/.test(pw) &&
  /\d/.test(pw);

/** Phone: optional +, digits, spaces, hyphens, parens */
export const isValidPhone = (phone) =>
  typeof phone === 'string' &&
  phone.length <= LIMITS.PHONE_MAX &&
  /^\+?[\d\s\-()]{7,20}$/.test(phone);

/** Generic text field: type check + length limit + no control chars */
export const isValidText = (text, maxLen) =>
  typeof text === 'string' &&
  text.length <= maxLen &&
  !/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(text);

/** UUID v4 format check (for IDs from URL params) */
export const isValidUUID = (id) =>
  typeof id === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

/** Allowed role values — reject unexpected values */
export const isValidRole = (role) =>
  ['seeker', 'provider'].includes(role);

/** Strip HTML tags from plain-text inputs to prevent stored XSS */
export const stripHTML = (text) =>
  typeof text === 'string' ? text.replace(/<[^>]*>/g, '') : '';

/** Trim and sanitize a plain-text input */
export const cleanText = (text) => stripHTML(text.trim());

/** Validate a skills array */
export const validateSkills = (skills) =>
  Array.isArray(skills) &&
  skills.length <= LIMITS.SKILLS_MAX_COUNT &&
  skills.every(s => typeof s === 'string' && s.length <= LIMITS.SKILL_MAX);

/** Validate aspirations array */
export const validateAspirations = (aspirations) =>
  Array.isArray(aspirations) &&
  aspirations.length <= LIMITS.ASPIRATIONS_MAX &&
  aspirations.every(a => typeof a === 'string' && a.length <= LIMITS.ASPIRATION_MAX);

// ── File Upload Validation ── OWASP A04:2021 ──────────────────

export const MAX_AVATAR_SIZE = 5 * 1024 * 1024;   // 5 MB
export const MAX_RESUME_SIZE = 10 * 1024 * 1024;   // 10 MB
export const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_RESUME_TYPES = ['application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const VALID_EXTENSIONS = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/gif': ['gif'],
  'image/webp': ['webp'],
  'application/pdf': ['pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
};

/**
 * Validate a file for upload.
 * @returns {string|null} Error message, or null if valid.
 */
export const validateFile = (file, { maxSize, allowedTypes }) => {
  if (!file) return 'No file selected.';
  if (file.size > maxSize) return `File too large. Maximum ${maxSize / 1024 / 1024}MB allowed.`;
  if (!allowedTypes.includes(file.type)) return `Invalid file type. Allowed: ${allowedTypes.join(', ')}`;
  // SECURITY: Double-check extension matches MIME (prevents MIME spoofing)
  const ext = file.name.split('.').pop()?.toLowerCase();
  const expectedExts = VALID_EXTENSIONS[file.type] || [];
  if (!expectedExts.includes(ext)) return 'File extension does not match file type.';
  return null; // valid
};
