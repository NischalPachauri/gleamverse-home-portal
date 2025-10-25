# GleamVerse Authentication Setup

## Overview
This document outlines the complete authentication system setup for GleamVerse, including Supabase integration, email verification, and user management.

## Features Implemented

### ✅ Authentication System
- **Sign Up**: Users can create accounts with email verification
- **Sign In**: Secure login with email/password
- **Sign Out**: Proper session termination
- **Email Verification**: Automatic email verification on signup
- **Session Management**: Persistent sessions with auto-refresh

### ✅ Database Schema
- **user_profiles**: User profile information linked to Supabase auth
- **bookmarks**: User bookmarks with proper relationships
- **reading_history**: Reading progress tracking
- **reading_sessions**: Session-based reading time tracking
- **book_notes**: User annotations and highlights

### ✅ Security Features
- **Row Level Security (RLS)**: All tables protected with proper policies
- **User Isolation**: Users can only access their own data
- **Secure Authentication**: Supabase handles all auth security

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in the project root with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

### 2. Database Setup
Run the following migrations in your Supabase project:

1. **001_auth_tables.sql** - Creates the main authentication tables
2. **20250120000000_setup_auth_policies.sql** - Sets up RLS policies and security

### 3. Supabase Configuration
The authentication system is configured to:
- Use localStorage for session persistence
- Auto-refresh tokens
- Redirect to `/auth/callback` for email verification
- Create user profiles automatically on signup

## Authentication Flow

### Sign Up Process
1. User fills out registration form
2. Supabase creates auth user
3. User profile is created in `user_profiles` table
4. Verification email is sent automatically
5. User clicks email link → redirected to `/auth/callback`
6. Account is verified and user is logged in

### Sign In Process
1. User enters credentials
2. Supabase validates credentials
3. Session is established
4. User is redirected to home page

### Email Verification
- Automatic email sending on signup
- Custom redirect URL: `${window.location.origin}/auth/callback`
- Verification handled by Supabase Auth
- Success/error handling with user feedback

## API Endpoints

### Authentication Methods
```typescript
// Sign up with email verification
await signUp(email: string, password: string, fullName: string)

// Sign in
await signIn(email: string, password: string)

// Sign out
await signOut()
```

### User Data Access
```typescript
// Get current user
const { user, isAuthenticated } = useAuth()

// Access user profile
const profile = user?.user_metadata
```

## Error Handling

### Common Error Scenarios
- **Invalid credentials**: Clear error messages
- **Network issues**: Graceful fallback with user notification
- **Email verification**: Proper handling of verification flow
- **Session expiry**: Automatic token refresh

### User Feedback
- Toast notifications for all auth actions
- Loading states during authentication
- Clear error messages for failed operations

## Security Considerations

### Row Level Security
All user data is protected with RLS policies:
- Users can only access their own profiles
- Bookmarks are user-specific
- Reading history is private
- Notes and sessions are isolated per user

### Authentication Security
- Supabase handles password hashing
- JWT tokens for session management
- Automatic token refresh
- Secure cookie handling

## Testing the Authentication

### Test Sign Up
1. Navigate to the app
2. Click "Sign Up" 
3. Fill out the form
4. Check email for verification link
5. Click verification link
6. Should be redirected and logged in

### Test Sign In
1. Use verified account credentials
2. Should log in successfully
3. Session should persist on page refresh

### Test Sign Out
1. Click sign out button
2. Should clear session and redirect
3. Protected routes should be inaccessible

## Troubleshooting

### Common Issues
1. **"Failed to fetch data"**: Check Supabase URL and key
2. **Email not received**: Check spam folder, verify email settings
3. **Verification link not working**: Ensure callback URL is correct
4. **Session not persisting**: Check localStorage permissions

### Debug Steps
1. Check browser console for errors
2. Verify Supabase project settings
3. Confirm environment variables
4. Test Supabase connection in dashboard

## Future Enhancements

### Planned Features
- Password reset functionality
- Social login (Google, GitHub)
- Two-factor authentication
- Account deletion
- Profile picture upload
- User preferences

### Database Optimizations
- Additional indexes for performance
- Data archiving for old sessions
- Analytics on user behavior
- Backup and recovery procedures

## Support

For issues with authentication:
1. Check the browser console for errors
2. Verify Supabase project configuration
3. Test with a fresh browser session
4. Contact support with specific error messages

---

**Last Updated**: January 20, 2025
**Version**: 1.0.0
