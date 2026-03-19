# Notification Feature Implementation Prompt

Aap is prompt ko copy kar ke kisi bhi waqt istemal kar sakte hain ta ke hum ba-qaida taur par notification system ki behtari (improvements) ka aaghaz kar sakein:

---

**Prompt:**

"Mera e-commerce application React (frontend) aur Supabase (backend/database) par mabni hai, jise main Hostinger par host karne ja raha hoon. Mere paas pehle se hi ek notification feature maujood hai jisme `UnifiedNotificationService`, `localNotifications.ts`, aur enterprise UI (`UnifiedNotificationCenter`) shamil hai. Main is system ko production-ready aur Hostinger/Supabase architecture ke mutabiq switch aur optimize karna chahta hoon.

Baraye meharbani mandarja zail 5 steps par amal karte hue implementation start karein:

**Phase 1: State Management aur PWA Setup**
1. **Zustand Store:** Ek naya store `useNotificationStore.ts` banayen jo Supabase se notifications fetch kare, count (unread badge) manage kare, aur puri app (maslan header/footer) mein real-time state share kare. Component level `useState` data fetching ko is naye store se replace karein.
2. **Offline Fallback Sync:** Agar user offline ho aur koi notification action (jaise mark read/delete) perform kare, to isay browser/local storage mein queue karein, aur internet aatay hi automatically Supabase database pe sync karein. PWA Service worker ko offline caching ke mutabiq configure karein.

**Phase 2: Supabase Realtime & Edge Functions**
3. **Supabase Realtime Subscriptions:** Zustand store ke andar Supabase ki `channel()` subscription lagayen ta ke jab webhook ya koi aur admin naya notification push kare, to user ka UI bina refresh huye foran update ho.
4. **Environment Variables:** `unifiedNotificationService.ts` mein jitne bhi hardcoded server/function URLs hain (`make-server-b09ae082/*`), unhe `.env` file (`VITE_SUPABASE_NOTIF_URL`, waghera) mein move karein. Hostinger deployment ke waqt main in variables ki values environment setting se feed karunga.
5. **Database Triggers (Optional setup guide):** Muje instructions aur SQL snippets provide karein jin ke zariye main Supabase dashboard se 'Webhooks' aur 'Database Triggers' set kar sakoon (maslan 'Orders' table mein status update honay par automatic notification generate hone ka logic).

Kripya step-by-step approach rakhein. Pehle mujhe Phase 1 ka code dein ta ke main use verify kar loon, phir hum Phase 2 par chalenge."

---

**Istemal ka Tariqa (How to use):**
Aap apni sahulat ke mutabiq oopar di gai prompt ka sara text copy karke mujhe (ya kisi aur chat context mein) send kar sakte hain jab bhi aap yeh changes start karwana chahein!
