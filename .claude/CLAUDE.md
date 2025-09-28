# Travel Buddy Finder – MVP

## 1. Application Idea
The application helps users find travel buddies for their upcoming trips.  
Users can:
- Post their travel plans (destination, origin, date/date range, gender preference, trip details, and preferred contact channel).  
- Browse existing posts and search by country (with optional city refinement).  
- Show interest in other users' trips.  
- View who has shown interest in their trip.  
- Contact other users through the communication channel shared in their posts.  

The goal is to make finding travel partners simple, structured, and more effective than scattered meetup or comment sections.

---

## 2. App Workflow

**Trip Post Flow**
1. User clicks “Create Trip” button.  
2. User fills form:  
   - Destination country (required)  
   - Destination city (optional)  
   - Starting from (city/country)  
   - Date range or month (required)  
   - Is date flexible? (optional boolean)  
   - Gender preference (optional)  
   - Trip details (optional free text)  
   - Contact channel (type + value, e.g., WhatsApp + number)  
3. Post is submitted and displayed in the main feed.  

**Search Flow**
1. User visits the Search page.  
2. Filter options:  
   - Destination country (required)  
   - Destination city (optional)  
   - Date or month filter (optional).  
3. Results show all matching trip cards with ability to:  
   - **Show Interest** (records engagement).  
   - **View Trip Details** (expanded info + contact channel).  

**Engagement Flow**
1. User clicks **Show Interest** on a trip.  
2. Their name/handle/contact (minimal info) is recorded and shown in the creator’s trip detail page.  
3. Trip creator can then reach out directly via shared channel.  

**Self-Management Flow**
- Recently created trips are stored in `localStorage` so they appear under **"Your Trips"** section at the top for quick access.  
- Trip edit is done through a **secret edit link** (future iteration).  

---

## 3. React + Vite Best Practices
- Use **functional components + hooks** (React best practice).  
- Organize components into `/components`, `/pages`, `/hooks`.  
- Keep API calls in a separate `/services` folder.  
- Configure absolute imports with `vite.config.js`.  
- Use **TypeScript** for type safety (optional but recommended).  
- Use **React Query (TanStack Query)** or `fetch` wrappers for API data fetching and caching.  
- Lazy-load non-critical components with `React.lazy`.  
- Use `.env` for environment variables instead of hardcoding.  
- Use ESLint + Prettier for consistent code formatting.  

---

## 4. How to Launch Application
1. **Clone Repository**
   ```bash
   git clone <repo-url>
   cd travel-buddy-finder
