# School Finder Portal - Product Specification Document 

1. Project Overview 
The School Finder Portal is a web application designed to simplify the process of discovering and evaluating schools in Poland. Users can easily search for schools, access essential information including basic school details, Google ratings visualized as stars, and location map thumbnails. The platform also leverages a custom sentiment analysis of extracted comments to provide an additional layer of insight into school quality. A secure, simple registration/login system allows users to personalize their experience by saving favorite schools. The entire platform will operate with a strong commitment to RODO (GDPR) compliant data handling. 

2. Goals 
Empower Users: Provide a user-friendly platform for quickly identifying schools that meet their specific criteria. 
Inform Decision-Making: Offer a comprehensive view of each school, combining objective data (location, official details) with subjective insights (Google reviews, sentiment analysis, user ratings). 
Improve Accessibility: Make school information readily available to all users, regardless of technical expertise. 
Personalize Experience: Allow users to bookmark and revisit schools they are interested in. 
Ensure Trust: Handle user data responsibly and transparently, adhering to RODO/GDPR regulations. 
Provide Administrative Control: Enable specific users to manage platform data and settings securely. 
Parent can find school close to the accomodation, or easy to commute if remote for children. 
Children and teenagers can see school subject, specialisation, photo one or two and if school is on social media and link to website. 

3. Target Audience 
Parents and guardians seeking the right school for their children. 
Students looking for higher education institutions. 
Individuals relocating to Poland and needing to find suitable schools. 
Anyone researching educational institutions in Poland. 
Platform Administrators: Designated users responsible for maintaining the portal's data integrity and functionality. 

4. Core Features 
4.1. School Discovery & Search 
Search by Region: Users can select a specific region in Poland (e.g., Wielkopolska, Małopolska) to filter schools within that area. 
Search by City: Users can type in a specific city name to find schools located in that city. 
Search by School Type: Users can filter schools based on type: 
Kindergarten (Przedszkole) 
Primary School (Szkoła Podstawowa) 
Middle School / Junior High School (Gimnazjum - Note: Consider current educational structure) 
High School / Lyceum (Liceum) 
Technical School (Technikum) 
Vocational School (Szkoła Zawodowa) 
Special Education School (Szkoła Specjalna) 
Higher Education (Uniwersytet, Politechnika, etc.) 
Keyword Search (Optional): Allow users to enter keywords (e.g., "bilingual," "music program") to further refine search results.

4.2. School Information Display 
For each school, display the following information clearly and concisely: 

Basic School Details: 
School Name 
Address 
Contact Information (Phone, Email, Website - if available) 
School Type 
Official School ID (if available) 
Google Ratings: 
Fetch average Google rating via API. 
Visualize the Google rating using a star system (e.g., 4.5 out of 5 stars). 
Location Map Thumbnail: 
Embed a small, static or interactive map thumbnail showing the school's precise location. Clicking the thumbnail could potentially link to a larger, interactive map view. 


4.3. Sentiment Analysis & Custom Rating 
Comment Extraction: A backend process will extract comments from various online sources (e.g., Google Reviews, relevant educational forums). 
Sentiment Analysis: A custom script will analyze these extracted comments: 
Identify positive ("pluses") and negative ("minuses") keywords/phrases. 
Assign weights to these sentiment indicators. 
Calculate an overall sentiment score based on these weighted values. 
Custom Sentiment Rating: Display this calculated score as a user-friendly rating (e.g., star visualization) to offer a unique perspective on the school's perceived quality. 
4.4. User Accounts & Personalization 
Simple Registration/Login System: 
Provide a straightforward process for users to create an account (e.g., using email/password, or social logins like Google/GitHub via NextAuth.js). 
Securely handle user credentials. 
Ability to Save Favorite Schools: 
Logged-in users will have an option (e.g., a "heart" or "star" icon) on each school's profile to mark it as a favorite. 
A dedicated "My Favorites" or "Saved Schools" section will be available within the user's account dashboard, listing all their favorited schools. 
User Ratings (Post-Sign-Up): 
Allow logged-in users to submit their own star ratings for schools. 
Implement rate limiting: Each user can only rate a school once. 
The overall displayed rating for a school will be an aggregate of the Google rating, the custom sentiment analysis, and user-submitted ratings. 
Rating Tooltip: When an unregistered/logged-out user attempts to interact with the rating system, display a tooltip: "Please sign up or log in to rate this school." 

4.5. Admin Access Control 
Role-Based Access: Implement a system where certain users are designated as administrators. 

Administrative Dashboard: Provide a secure area for administrators to: 

Manage school data (add, edit, delete schools). 
Oversee user accounts. 
Monitor platform activity. 
Manage scraping configurations or review scraped data. 
Potentially moderate user-submitted content (if applicable). 
SECURE CREDENTIAL MANAGEMENT: 

Administrator Email: For administrative access, the email neatgroupnet@gmail.com will be designated. 
Administrator Password: The password associated with this administrator account MUST NOT be stored directly in this document or in the codebase. Instead, it shall be securely managed via: 
Environment Variables: Stored as a secure environment variable (e.g., ADMIN_PASSWORD) within the deployment platform (Vercel) and in a local .env.local file during development. 
Secure Hashing: If the password is to be set or reset, it must be securely hashed (e.g., using bcrypt) before storage. 

CRITICAL SECURITY WARNING: NEVER HARDCODE PASSWORDS Writing passwords directly into code, configuration files (other than secure .env files during local setup), or specification documents creates severe security risks. Always use environment variables and secure password storage mechanisms. 

Best Practices: 

Environment Variables: Utilize environment variables for all secrets (ADMIN_EMAIL, ADMIN_PASSWORD, API keys, etc.). 
Secrets Management: For production, leverage secure secrets management tools provided by Vercel or third-party services. 
Password Hashing: Always hash passwords using strong, modern algorithms (e.g., bcrypt, Argon2) before storing them in the database. 
Access Control: Implement robust authentication and authorization logic to ensure only designated administrators can access admin functionalities. 
Rotation: Regularly rotate sensitive credentials. 
MFA: Strongly recommend enabling Multi-Factor Authentication for all administrative accounts. 


6. Data Privacy & Compliance (RODO/GDPR) 
User Consent: Obtain explicit consent from users for data collection and processing during the registration process. A clear link to the Privacy Policy will be provided. 
Data Minimization: Collect only the data necessary for the core functionality of the portal (e.g., for authentication, saving favorites, submitting ratings). 
Secure Storage: Implement secure methods for storing user data, especially sensitive information like passwords (hashed and salted). Utilize the security features of chosen providers (Firebase/Supabase). 
Privacy Policy: Maintain a clear, accessible, and comprehensive Privacy Policy outlining: 
What data is collected. 
How data is used. 
Who data is shared with (e.g., third-party services like Google Maps API). 
User rights (access, rectification, erasure). 
Data retention periods. 
Data Deletion: Provide users with a mechanism to request the deletion of their account and associated data. 
7. User Interface (UI) and User Experience (UX) 
Clean and Intuitive Design: Prioritize ease of use, clear navigation, and a visually appealing aesthetic. 
Responsive Layout: Ensure the platform is fully functional and looks great on desktops, tablets, and mobile devices. 
Accessibility: Adhere to WCAG 2.1 AA standards for broader accessibility. 
Performance Optimization: Implement techniques for fast loading times, efficient data fetching, and smooth interactions. 
8. Future Enhancements 
Advanced Filtering: Implement more granular search filters (e.g., school size, extracurricular activities, language of instruction). 
School Comparison: Allow users to compare multiple schools side-by-side. 
Personalized Recommendations: Provide school recommendations based on user preferences and past searches.
Integration with Educational Resources: Link to relevant government education websites or other reputable sources.
User Commenting: Allow logged-in users to post their own text comments/reviews.
9. Success Metrics
Number of registered users and active users.
Frequency and success rate of school searches.
Number of schools viewed.
Number of schools favorited by users.
Number of user-submitted ratings.
User satisfaction feedback.
Adherence to uptime and performance benchmarks.
