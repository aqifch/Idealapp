# Complete Notification System Setup Guide (Hostinger + Supabase)

Yeh guide shuru se lekar aakhir tak mukammal tafseel faraham karti hai ke aap kaise apne Ideal Point app ke naye Notification System ko configure aur deploy kar sakte hain.

Is setup se aapki app (jo Hostinger par host hogi) fast chalegi aur users ko Real-time (Zustand + Supabase) aur Push Notifications dono properly milenge.

---

## Step 1: Frontend Environment Variables (Hostinger Setup)
Aapka sara naya code frontend (React) mein likh diya gaya hai. Jab aap apni app ka build banayenge (Hostinger ke liye), to aapko `.env` file mein apna Supabase Function URL dalna hoga:

1. Apne code ke root folder mein `.env` ya `.env.local` file kholiye.
2. Is line ko zaroor add karein:
   ```env
   VITE_SUPABASE_NOTIF_URL=https://[APP_PROJECT_ID].supabase.co/functions/v1
   ```
   *(Note: `[APP_PROJECT_ID]` ko apne asal Supabase Project ID se replace karein).*
3. Jab app `npm run build` karenge, to automatically Hostinger ki files yeh URL read karengi.

---

## Step 2: Database Triggers Setup (Supabase SQL)
Hum nahi chahte ke React frontend khud backend orders ke change par notification table update kare (kiun ke internet issues ki wajah se notifications miss ho sakte hain). Is liye hum Supabase se kahenge ke jab bhi order change ho, khud database mein notification bana do!

1. Apne **Supabase Dashboard** mein login karein.
2. Left menu se **SQL Editor** par click karein.
3. Niche diya gaya code copy karke wahan paste karein aur **Run** ka button dabayen:

```sql
-- 1. Create a function to handle order status changes
CREATE OR REPLACE FUNCTION handle_order_status_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the status has actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    
    INSERT INTO public.notifications (
      type, 
      target_user_id, 
      title, 
      message, 
      is_new, 
      is_read, 
      created_at
    )
    VALUES (
      'order',
      NEW.user_id,
      'Order Status Update',
      'Your order #' || NEW.id || ' status changed to ' || NEW.status,
      true,
      false,
      now()
    );
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the Trigger on the orders table
DROP TRIGGER IF EXISTS on_order_status_changed ON public.orders;
CREATE TRIGGER on_order_status_changed
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION handle_order_status_notification();
```
*Mubarak ho! Database khud notifications generate karna shuru kar dega.*

---

## Step 3: Edge Function Deploy Karna (Push Notifications)
Jab notification create ho jaye, to mobile/PC par "Tring!" aawaz (Push popup) aana zaruri hai. Is kaam k lye mein ne aapki repo mein already `supabase/functions/send-push/index.ts` ki file bana di hai. Isay ab apko apne Supabase server pe deploy karna hai:

1. Apne PC ke command prompt ya VS Code terminal mein jayen (jahan aapka project hai).
2. Supabase account ko CLI mein login karein (agar pehle nahi kiya tou):
   ```bash
   npx supabase login
   ```
3. Ab is Edge function ko apne Supabase project pr bhej dein by running this command:
   ```bash
   npx supabase functions deploy send-push --project-ref YOUR_PROJECT_ID_HERE
   ```
   *(Apna project ID replace zaroor kijiye)*

4. **API Key Setup (Supabase Dashboard):** Push notification aage bhejne (misal ke tor pe Firebase ya OneSignal ko) ke liye API key function ko chahiye hoti hai:
   ```bash
   npx supabase secrets set --project-ref YOUR_PROJECT_ID_HERE PUSH_API_KEY=your_firebase_or_onesignal_server_key
   ```

---

## Step 4: Supabase Webhook Enable Karna
Akhri step ye hai ke jab Database automatically notification generate kar le (Step 2 mein), tou wo Edge Function (Step 3 mein banaya gaya) ko ishara kare ke "Bhai push notification bhej do!".

1. **Supabase Dashboard** mein **Database** > **Webhooks** mein jayen.
2. **Create a Webhook / Enable Webhooks** par click karein.
3. Modal mein details aise bharein:
   - **Name:** Push Notification Trigger
   - **Table:** `notifications`
   - **Events:** Tick only `Insert`
   - **Type:** Select `Edge Function` 
   - **Edge Function:** Dropdown se `send-push` select karein (jo abhi apne deploy ki hai).
4. Save kar dein.

---

### Mukammal Flow (Ab app kaisay kaam kar rahi hai):

1. **Order Update:** Admin order status complete karta hai.
2. **SQL Trigger:** Supabase automatically `notifications` table mein aik raw (entry) bana deta hai.
3. **Webhook:** Supabase dekhta hai ke entry ban aagai, to wo apke deploy kiye huye `send-push` function ko payload forward kar deta hai.
4. **Edge Function:** `send-push` function wo message utha kar Firebase/OneSignal ko de deta hai ke isay app user ki device par as a Push Message bhej do.
5. **Real-time Frontend:** Usi dauran, jo Hostinger par apka React Frontend chal raha hai (Zustand ke andar), usay Supabase automatically Real-time WebSocket k zariye bata deta hai ke naya notification aaya hai. App ka badge icon khud hi update(bina refresh kiye) ho jata hai!

Aapka system ab bilkul Modern Enterprise Applications ki tarha ready hai. 🚀
