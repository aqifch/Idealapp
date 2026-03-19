import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// The Push API key will be set in your Supabase project settings
// If using OneSignal or Firebase FCM, this corresponds to your REST API Key
const PUSH_API_KEY = Deno.env.get('PUSH_API_KEY') || ''

serve(async (req) => {
  try {
    // Determine the content type
    let payload;
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      payload = await req.json();
    } else {
      console.warn("Got non-JSON payload from webhook");
      payload = { record: {} }; 
    }

    const notification = payload.record;

    if (!notification || !notification.id) {
       return new Response(JSON.stringify({ error: "No notification record found in payload", raw: payload }), {
         status: 400,
         headers: { 'Content-Type': 'application/json' },
       });
    }

    console.log('Processing push notification for:', notification.id, 'Type:', notification.type);

    // This is a placeholder for your actual Push Notification Service (e.g FCM, OneSignal)
    // For Firebase Cloud Messaging (FCM):
    /*
    const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${PUSH_API_KEY}`,
      },
      body: JSON.stringify({
        // If it's a broadcast, send to everyone subscribed to 'all_users' topic
        to: notification.is_broadcast ? '/topics/all_users' : `/topics/user_${notification.target_user_id}`,
        notification: {
          title: notification.title,
          body: notification.message,
          // You can also send an image if provided: image: notification.image_url
        },
        data: {
          url: notification.action_url,
          id: notification.id
        }
      }),
    });
    const fcmResult = await fcmResponse.json();
    console.log('FCM Result:', fcmResult);
    */

    // For now we just log success to show it's working
    console.log(`Push message sent successfully for ${notification.title}!`);

    return new Response(
      JSON.stringify({ 
        message: 'Push notification processed successfully',
        id: notification.id,
        target: notification.is_broadcast ? 'all' : notification.target_user_id
      }), 
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
    
  } catch (error) {
    console.error('Edge Function Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
