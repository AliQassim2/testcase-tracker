import crypto from 'crypto'

export const SEED = {
    'Feature': {
        'User can register with valid data': false,
        'User can login with correct credentials': false,
        'User can logout successfully': false,
        'User can reset password via email': false,
        'Admin can access dashboard': false,
        'Guest cannot access protected pages': false
    },
    'Unit': {
        'User model has correct fillable attributes': false,
        'Post model belongs to User relationship': false,
        'Helper function formats dates correctly': false,
        'Query scope filters only active records': false,
        'Validation rules pass for valid input': false,
        'Custom artisan command runs successfully': false
    },
    'API': {
        'GET /api/users returns paginated list': false,
        'POST /api/users creates new user': false,
        'GET /api/users/{id} returns single user': false,
        'PUT /api/users/{id} updates existing user': false,
        'DELETE /api/users/{id} deletes user': false,
        'POST /api/auth/login returns token': false
    },
    'Browser': {
        'Homepage loads with correct title': false,
        'Contact form submits with valid data': false,
        'Navigation links route correctly': false,
        'Responsive layout on mobile devices': false,
        'Form validation shows error messages': false,
        'File upload works for valid files': false
    },
    'Security': {
        'Unauthenticated user redirected to login': false,
        'CSRF token protects form submissions': false,
        'XSS payloads are sanitized on output': false,
        'SQL injection attempts are blocked': false,
        'Role-based middleware restricts access': false,
        'Rate limiting prevents brute force': false
    }
}

export function generateToken() {
    return crypto.randomBytes(32).toString('hex')
}
