User Search Limits & Subscription Model
To balance server load and encourage user registration, we'll implement a limited free search policy with a subscription option for unlimited access.

1. Free Search Limitation
Mechanism
Each user (identified by IP address or cookie, unless logged in) is allowed 3 free searches per session or within a short time window (e.g., 24 hours).
After the 3rd search, they are prompted to log in or sign up for unlimited access.
If they choose not to register, they can perform one more search (the 4th) before being blocked by a persistent overlay/modal.
User Flow
First & Second Search: User searches for schools (e.g., "kindergartens in Warsaw"). Results display normally.
Third Search: User searches again. After results, a non-intrusive banner appears: "You have 1 more free search. Sign up to explore unlimited schools!" (with a dismiss option).
Fourth Search: User searches again. A modal overlay appears: "You've reached your free search limit! Sign up for 3 more searches or upgrade to our Premium Plan." (with "Sign Up," "Log In," and "Upgrade" buttons).
Post-Action:
If they sign up/log in, their search count resets, and they get unlimited access.
If they upgrade, they get unlimited access.
If they dismiss/ignore, they are blocked from further searches until the time window resets or they register.
Technical Implementation
Tracking: Use localStorage (for anonymous users) or a database column (for logged-in users) to count searches.
UI Prompts: Implement banners and modals using Shadcn UI components.
Blocking: Disable the search input field and show a persistent overlay/modal after the 4th search.
2. Subscription Model
Plans
Plan	Price (PLN)	Price (GBP)	Features
Free	0	0	3 searches/session, basic data access
Premium	4.99	2.99	Unlimited searches, advanced filters, saved searches, priority sentiment updates
Payment Integration
Use Stripe for payment processing (supports PLN and GBP).
Implement Next.js API routes to handle subscription sign-ups and Stripe webhooks.
User Flow for Subscription
Upgrade Prompt: After the 4th search, clicking "Upgrade" takes the user to a pricing page.
Checkout: User selects a plan, enters payment details via Stripe Checkout.
Confirmation: User receives a confirmation email and is redirected to a success page.
Benefits: User can now perform unlimited searches and access premium features.
3. Implementation Details
Free Search Counter
TypeScript

// Example logic in a search API route or middleware
const searchCountKey = req.ip || req.cookies.userId; // Use IP or logged-in user ID
const searchCount = await getSearchCount(searchCountKey);

if (searchCount >= 3) {
  // Allow one more search
  if (searchCount === 3) {
    await incrementSearchCount(searchCountKey);
    // Show results + banner
  } else {
    // Block search, show modal
    res.status(403).json({ error: "Upgrade required" });
  }
} else {
  // Allow search, increment counter
  await incrementSearchCount(searchCountKey);
  // Proceed with search
}
Stripe Integration
Setup: Create a Stripe account and add products (plans).
Checkout Session: Create a Stripe Checkout session in an API route.
Webhooks: Set up a webhook endpoint to handle subscription events (e.g., successful payment).
UI for Subscription
Pricing Page: Display plans with features and prices.
Modal: Show a summary of the selected plan before checkout.
4. User Experience Considerations
Transparency: Clearly explain the search limits and subscription benefits.
Ease of Upgrade: Make the process seamless with Stripe's pre-built checkout.
Graceful Blocking: Ensure blocked users can still access previously viewed school details.
5. Technical Spec Additions
Component	Details
Search Counter	Track per IP or user ID; reset after 24 hours.
Stripe Checkout	Integrate Stripe API for payments; handle webhooks.
Subscription DB	Store subscription status in the database.
UI Prompts	Shadcn UI banners and modals for limits and upgrades.