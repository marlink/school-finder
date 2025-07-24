Happy Paths (Success Scenarios)
Successful School Search

Scenario: User searches for "Warsaw, Kindergarten."
Expected: Returns filtered list of kindergartens in Warsaw with ratings, maps, and comments.
User Registration & Login

Scenario: New user signs up with email/password.
Expected: Receives email verification link; logs in successfully on subsequent attempts.
School Rating Submission

Scenario: Logged-in user rates a school 5/5 stars.
Expected: Rating saves instantly; custom sentiment score updates on the page.
Favoriting a School

Scenario: User clicks "Save" on a school page.
Expected: School appears in their "Favorites" dashboard; status updates to ✅.
GDPR Data Export

Scenario: User requests data export via Privacy Settings.
Expected: Receives a school-finder-data.json file containing their ratings and favorites.
Admin Login & Data Management

Scenario: Admin logs in with hashed credentials (dev) or production auth.
Expected: Accesses admin dashboard to add/edit schools or sentiment settings.
Unhappy Paths (Failure Scenarios)
Failed School Search

Scenario: User searches for a non-existent city (e.g., "XXYZ City").
Expected: Clear message: "No schools found. Try adjusting your search criteria."
Invalid Login Credentials

Scenario: User enters wrong password.
Expected: Error: "Email or password incorrect. Reset your password?"
Rating Submission Without Login

Scenario: Anonymous user tries to submit a rating.
Expected: Tooltip: "Sign up to save your rating!" + redirect to login page.
Broken Google Maps API

Scenario: Google Maps fails to load due to API key errors.
Expected: Fallback message: "Map not available. Check school address manually."
GDPR Deletion Request

Scenario: User deletes account.
Expected: All data (ratings, favorites) erased; confirmation email sent.
Sentiment Analysis Failure

Scenario: No comments found for a school.
Expected: Message: "Insufficient data to calculate sentiment score."
Edge Cases
Device Switching

Scenario: User logs in on mobile and later on laptop.
Expected:
Sessions should coexist unless explicitly logged out.
Favorite schools and ratings sync across devices.
Duplicate Ratings

Scenario: Logged-in user clicks "Rate" multiple times rapidly.
Expected:
Prevent duplicate submissions (disable button after first click).
Show: "You’ve already rated this school!"
High-Volume Search

Scenario: User searches for "Poland" with no filters.
Expected:
Paginated results to avoid overload.
Loading spinner + "Showing 1–20 of 1,200 schools."
Invalid School Data

Scenario: A school entry has missing address/contact fields.
Expected:
Display "Information incomplete" badge.
Show only available data (e.g., "Address: Not provided").
Extreme Sentiment Scores

Scenario: All comments are positive/negative.
Expected:
Visual cue (e.g., 🟢/🔴 icon) + score (e.g., "Sentiment: 100% Positive").
Cookie/Token Expiration

Scenario: Admin token expires after inactivity.
Expected:
Auto-redirect to login page with clear error: "Session expired. Log in again."
Technical Mitigations for Edge Cases
Duplicate Data Prevention

Backend: Check timestamps/user-ID pairs before inserting ratings.
Frontend: Disable buttons during API call (debounce clicks).
Cross-Device Sync

Use Firebase/Supabase real-time databases to sync favorites/ratings instantly.
Empty Search Results

Add a background illustration (e.g., "No schools found – try broader search terms").
API Failures

Implement retry logic for Google Maps/Sentiment API calls.
Cache frequent searches locally (e.g., localStorage).
Summary
Happy Paths: Core features work as intended.
Unhappy Paths: Errors handled with user-friendly messages.
Edge Cases: Unusual scenarios mitigated via backend checks, fallbacks, and sync mechanisms.