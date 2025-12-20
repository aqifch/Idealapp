import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// ============================================
// SETTINGS ENDPOINTS
// ============================================

// Get store settings
app.get("/make-server-b09ae082/settings", async (c) => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/009b7b75-40e5-4b56-b353-77deb65e4317',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:GET/settings:entry',message:'GET settings endpoint called',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  try {
    console.log("📡 Fetching store settings...");
    
    // Default settings
    const defaultSettings = {
      storeName: "IDEAL POINT",
      tagline: "Fast Food",
      email: "admin@idealpoint.com",
      phone: "+92 300 1234567",
      address: "123 Main Street, Karachi, Pakistan",
      currency: "PKR",
      deliveryFee: 150,
      taxRate: 0,
      minOrder: 500,
      openingTime: "10:00",
      closingTime: "23:00",
      isStoreOpen: true,
      enableNotifications: true,
      autoAcceptOrders: false,
      bannerLayout: 'single',
      bannerHeight: 500,
      bannerPadding: 12
    };
    
    let settings = {};
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/009b7b75-40e5-4b56-b353-77deb65e4317',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:GET/settings:beforeKV',message:'Before KV get',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      settings = await kv.get("store_settings");
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/009b7b75-40e5-4b56-b353-77deb65e4317',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:GET/settings:afterKV',message:'After KV get',data:{hasSettings:!!settings},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      if (!settings) {
        settings = defaultSettings;
        // Try to save defaults, but don't fail if KV store is unavailable
        try {
          await kv.set("store_settings", settings);
        } catch (saveError: any) {
          console.warn("⚠️ Could not save default settings to KV store:", saveError);
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/009b7b75-40e5-4b56-b353-77deb65e4317',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:GET/settings:kvSetError',message:'KV set error in settings',data:{errorMessage:saveError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
        }
      }
    } catch (kvError: any) {
      console.warn("⚠️ KV store unavailable, using default settings:", kvError?.message || String(kvError));
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/009b7b75-40e5-4b56-b353-77deb65e4317',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:GET/settings:kvGetError',message:'KV get error in settings',data:{errorMessage:kvError?.message,errorCode:kvError?.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      settings = defaultSettings;
    }
    
    return c.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error("❌ Error fetching settings:", error);
    return c.json({ 
      success: false, 
      error: "Failed to fetch settings",
      details: error?.message || String(error)
    }, 500);
  }
});

// Update store settings
app.post("/make-server-b09ae082/settings", async (c) => {
  try {
    const body = await c.req.json();
    console.log("📝 Updating store settings:", body);
    
    try {
      await kv.set("store_settings", body);
    } catch (kvError: any) {
      // If KV store is unavailable, still return success but log warning
      console.warn("⚠️ KV store unavailable, settings not persisted:", kvError?.message || String(kvError));
      return c.json({
        success: true,
        settings: body,
        message: "Settings updated (not persisted - KV store unavailable)",
        warning: "KV store unavailable, settings will not persist"
      });
    }
    
    return c.json({
      success: true,
      settings: body,
      message: "Settings updated successfully"
    });
  } catch (error) {
    console.error("❌ Error updating settings:", error);
    return c.json({ 
      success: false, 
      error: "Failed to update settings",
      details: error?.message || String(error)
    }, 500);
  }
});

// ============================================
// AUTH ENDPOINTS
// ============================================

app.post("/make-server-b09ae082/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, phone, role } = body;

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create user with auto-confirmed email
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name, 
        phone,
        role: role || 'customer', // Default to customer if not specified
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random`
      },
      email_confirm: true
    });

    if (error) {
      console.error("Auth Error:", error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.error("Signup Error:", error);
    return c.json({ error: error.message || "Internal Server Error" }, 500);
  }
});

// Get all users (Admin only)
app.get("/make-server-b09ae082/users", async (c) => {
  try {
    console.log("📡 Fetching all users...");
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { users }, error } = await supabase.auth.admin.listUsers({
        perPage: 1000
    });

    if (error) {
      console.error("❌ Error fetching users:", error);
      return c.json({ error: error.message }, 500);
    }

    // Enhance user objects with metadata
    const enhancedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || "Unknown",
      phone: user.user_metadata?.phone || user.phone || "N/A",
      role: user.user_metadata?.role || "customer",
      avatar_url: user.user_metadata?.avatar_url || null,
      created_at: user.created_at,
      last_sign_in: user.last_sign_in_at,
      provider: user.app_metadata?.provider || "email",
    }));

    console.log(`✅ Retrieved ${enhancedUsers.length} users`);

    return c.json({
      success: true,
      users: enhancedUsers,
      count: enhancedUsers.length
    });
  } catch (error) {
    console.error("❌ Error in /users endpoint:", error);
    return c.json({ error: error.message || "Internal Server Error" }, 500);
  }
});

// ============================================
// NOTIFICATION ENDPOINTS
// ============================================

// Get all notifications
app.get("/make-server-b09ae082/notifications", async (c) => {
  try {
    console.log("📡 Fetching all notifications...");
    console.log("🔄 Server handling request for notifications");
    
    // Try to get notifications from Supabase notifications table first (more reliable)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );
    
    let notifications = [];
    
    // Use Supabase notifications table (no KV store fallback)
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("❌ Supabase fetch error:", error);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/009b7b75-40e5-4b56-b353-77deb65e4317',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:GET/notifications:supabaseError',message:'Supabase fetch error in GET notifications',data:{errorMessage:error.message,errorCode:error.code,errorDetails:error.details},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      return c.json({
        success: false,
        error: "Failed to fetch notifications",
        details: error.message
      }, 500);
    }
    
    if (data) {
      // Map Supabase notifications to expected format
      notifications = data.map((n: any) => ({
        id: `notification:${n.id}`,
        type: n.type,
        title: n.title,
        message: n.message,
        targetUserId: n.target_user_id || "all",
        timestamp: n.created_at,
        isNew: !n.is_read,
        isRead: n.is_read || false,
        actionUrl: n.action_url,
        imageUrl: n.image_url,
        productId: n.product_id,
        dealId: n.deal_id,
        createdBy: "admin"
      }));
      console.log(`📦 Retrieved ${notifications.length} notifications from Supabase`);
    }
    
    // Sort by timestamp (newest first) with safety check
    const sortedNotifications = (notifications || []).sort((a, b) => {
      const aTime = a?.timestamp ? new Date(a.timestamp).getTime() : 0;
      const bTime = b?.timestamp ? new Date(b.timestamp).getTime() : 0;
      return bTime - aTime;
    });
    
    console.log(`✅ Returning ${sortedNotifications.length} sorted notifications`);
    
    return c.json({
      success: true,
      notifications: sortedNotifications,
      count: sortedNotifications.length
    });
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    console.error("❌ Error stack:", error?.stack);
    return c.json({ 
      success: false, 
      error: "Failed to fetch notifications",
      details: error?.message || String(error)
    }, 500);
  }
});

// Get user-specific notifications
app.get("/make-server-b09ae082/notifications/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    console.log(`📡 Fetching notifications for user: ${userId}`);
    
    // Use Supabase notifications table directly (KV store not available)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );
    
    // Fetch notifications for this user or broadcast notifications
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .or(`target_user_id.eq.${userId},is_broadcast.eq.true`)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("❌ Supabase fetch error:", error);
      throw error;
    }
    
    // Map Supabase notifications to expected format
    const notifications = (data || []).map((n: any) => ({
      id: `notification:${n.id}`,
      type: n.type,
      title: n.title,
      message: n.message,
      targetUserId: n.target_user_id || "all",
      timestamp: n.created_at,
      isNew: !n.is_read,
      isRead: n.is_read || false,
      actionUrl: n.action_url,
      imageUrl: n.image_url,
      productId: n.product_id,
      dealId: n.deal_id,
      createdBy: "admin"
    }));
    
    console.log(`✅ Retrieved ${notifications.length} notifications from Supabase for user: ${userId}`);
    
    return c.json({
      success: true,
      notifications: notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error(`❌ Error fetching notifications for user ${c.req.param("userId")}:`, error);
    console.error("❌ Error stack:", error?.stack);
    return c.json({ 
      success: false, 
      error: "Failed to fetch user notifications",
      details: error?.message || String(error)
    }, 500);
  }
});

// Create new notification
app.post("/make-server-b09ae082/notifications", async (c) => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/009b7b75-40e5-4b56-b353-77deb65e4317',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:POST/notifications:entry',message:'POST notifications endpoint called',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  try {
    console.log("📥 Received POST request to create notification");
    
    const body = await c.req.json();
    console.log("📦 Request body:", body);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/009b7b75-40e5-4b56-b353-77deb65e4317',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:POST/notifications:body',message:'Request body parsed',data:{type:body.type,title:body.title,hasMessage:!!body.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    const { type, title, message, targetUserId, actionUrl, icon, imageUrl, productId, dealId } = body;
    
    if (!type || !title || !message) {
      console.error("❌ Missing required fields:", { type, title, message });
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/009b7b75-40e5-4b56-b353-77deb65e4317',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:POST/notifications:validation',message:'Validation failed',data:{type,title,hasMessage:!!message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return c.json({ 
        success: false, 
        error: "Missing required fields: type, title, message" 
      }, 400);
    }
    
    const notificationId = `notification:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log("🆔 Generated notification ID:", notificationId);
    
    const notification = {
      id: notificationId,
      type, // "order" | "promo" | "reward" | "delivery" | "system"
      title,
      message,
      targetUserId: targetUserId || "all", // "all" for broadcast, or specific userId
      timestamp: new Date().toISOString(),
      isNew: true,
      isRead: false,
      actionUrl: actionUrl || null,
      icon: icon || null,
      imageUrl: imageUrl || null,
      productId: productId || null,
      dealId: dealId || null,
      createdBy: "admin"
    };
    
    // Use Supabase notifications table directly (KV store not available)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/009b7b75-40e5-4b56-b353-77deb65e4317',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:POST/notifications:beforeInsert',message:'Before Supabase insert',data:{type,title,targetUserId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        type: type,
        title: title,
        message: message,
        target_user_id: targetUserId && targetUserId !== "all" ? targetUserId : null,
        is_broadcast: targetUserId === "all" || !targetUserId,
        action_url: actionUrl || null,
        image_url: imageUrl || null,
        product_id: productId || null,
        deal_id: dealId || null,
        is_read: false,
      })
      .select()
      .single();
    
    if (error) {
      console.error("❌ Supabase insert error:", error);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/009b7b75-40e5-4b56-b353-77deb65e4317',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:POST/notifications:insertError',message:'Supabase insert error',data:{errorMessage:error.message,errorCode:error.code,errorDetails:error.details},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      throw error;
    }
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/009b7b75-40e5-4b56-b353-77deb65e4317',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:POST/notifications:insertSuccess',message:'Supabase insert success',data:{notificationId:data?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    console.log(`✅ Notification saved to Supabase: ${data.id}`);
    
    // Map Supabase response to notification format
    const mappedNotification = {
      id: `notification:${data.id}`,
      type: data.type,
      title: data.title,
      message: data.message,
      targetUserId: data.target_user_id || "all",
      timestamp: data.created_at,
      isNew: !data.is_read,
      isRead: data.is_read || false,
      actionUrl: data.action_url,
      imageUrl: data.image_url,
      productId: data.product_id,
      dealId: data.deal_id,
      createdBy: "admin"
    };
    
    return c.json({
      success: true,
      notification: mappedNotification,
      message: "Notification created successfully"
    });
  } catch (error: any) {
    console.error("❌ Error creating notification:", error);
    console.error("❌ Error stack:", error?.stack);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/009b7b75-40e5-4b56-b353-77deb65e4317',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:POST/notifications:catch',message:'Exception caught',data:{errorMessage:error?.message,errorStack:error?.stack,errorName:error?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return c.json({ 
      success: false, 
      error: "Failed to create notification",
      details: error?.message || String(error)
    }, 500);
  }
});

// Update notification
app.put("/make-server-b09ae082/notifications/:id", async (c) => {
  try {
    const notificationId = c.req.param("id");
    const updates = await c.req.json();
    
    // Use Supabase notifications table
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );
    
    // Extract ID from notification: prefix if present
    const dbId = notificationId.replace("notification:", "");
    
    const { data, error } = await supabase
      .from("notifications")
      .update({
        title: updates.title,
        message: updates.message,
        type: updates.type,
        action_url: updates.actionUrl || updates.action_url,
        image_url: updates.imageUrl || updates.image_url,
        is_read: updates.isRead !== undefined ? updates.isRead : updates.is_read,
      })
      .eq("id", dbId)
      .select()
      .single();
    
    if (error) {
      console.error("❌ Supabase update error:", error);
      throw error;
    }
    
    if (!data) {
      return c.json({ 
        success: false, 
        error: "Notification not found" 
      }, 404);
    }
    
    // Map response
    const updated = {
      id: `notification:${data.id}`,
      type: data.type,
      title: data.title,
      message: data.message,
      targetUserId: data.target_user_id || "all",
      timestamp: data.created_at,
      isNew: !data.is_read,
      isRead: data.is_read || false,
      actionUrl: data.action_url,
      imageUrl: data.image_url,
      productId: data.product_id,
      dealId: data.deal_id,
    };
    
    console.log(`✅ Notification updated: ${notificationId}`);
    
    return c.json({
      success: true,
      notification: updated,
      message: "Notification updated successfully"
    });
  } catch (error: any) {
    console.error("Error updating notification:", error);
    return c.json({ 
      success: false, 
      error: "Failed to update notification",
      details: error?.message || String(error)
    }, 500);
  }
});

// Mark notification as read
app.patch("/make-server-b09ae082/notifications/:id/read", async (c) => {
  try {
    const notificationId = c.req.param("id");
    
    // Use Supabase notifications table
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );
    
    // Extract ID from notification: prefix if present
    const dbId = notificationId.replace("notification:", "");
    
    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", dbId)
      .select()
      .single();
    
    if (error) {
      console.error("❌ Supabase update error:", error);
      throw error;
    }
    
    if (!data) {
      return c.json({ 
        success: false, 
        error: "Notification not found" 
      }, 404);
    }
    
    // Map response
    const updated = {
      id: `notification:${data.id}`,
      type: data.type,
      title: data.title,
      message: data.message,
      targetUserId: data.target_user_id || "all",
      timestamp: data.created_at,
      isNew: false,
      isRead: true,
      actionUrl: data.action_url,
      imageUrl: data.image_url,
      productId: data.product_id,
      dealId: data.deal_id,
    };
    
    return c.json({
      success: true,
      notification: updated
    });
  } catch (error: any) {
    console.error("Error marking notification as read:", error);
    return c.json({ 
      success: false, 
      error: "Failed to mark notification as read",
      details: error?.message || String(error)
    }, 500);
  }
});

// Mark all notifications as read for a user
app.patch("/make-server-b09ae082/notifications/user/:userId/read-all", async (c) => {
  try {
    const userId = c.req.param("userId");
    
    // Use Supabase notifications table
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );
    
    // Update all notifications for this user or broadcast notifications
    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .or(`target_user_id.eq.${userId},is_broadcast.eq.true`)
      .select();
    
    if (error) {
      console.error("❌ Supabase update error:", error);
      throw error;
    }
    
    const count = data?.length || 0;
    console.log(`✅ Marked ${count} notifications as read for user ${userId}`);
    
    return c.json({
      success: true,
      count: count,
      message: "All notifications marked as read"
    });
  } catch (error: any) {
    console.error("Error marking all notifications as read:", error);
    return c.json({ 
      success: false, 
      error: "Failed to mark notifications as read",
      details: error?.message || String(error)
    }, 500);
  }
});

// Delete notification
app.delete("/make-server-b09ae082/notifications/:id", async (c) => {
  try {
    const notificationId = c.req.param("id");
    
    // Use Supabase notifications table
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );
    
    // Extract ID from notification: prefix if present
    const dbId = notificationId.replace("notification:", "");
    
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", dbId);
    
    if (error) {
      console.error("❌ Supabase delete error:", error);
      throw error;
    }
    
    console.log(`✅ Notification deleted: ${notificationId}`);
    
    return c.json({
      success: true,
      message: "Notification deleted successfully"
    });
  } catch (error: any) {
    console.error("Error deleting notification:", error);
    return c.json({ 
      success: false, 
      error: "Failed to delete notification",
      details: error?.message || String(error)
    }, 500);
  }
});

// Delete all notifications for a user
app.delete("/make-server-b09ae082/notifications/user/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    
    // Use Supabase notifications table
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );
    
    // Delete all notifications for this user or broadcast notifications
    const { data, error } = await supabase
      .from("notifications")
      .delete()
      .or(`target_user_id.eq.${userId},is_broadcast.eq.true`)
      .select();
    
    if (error) {
      console.error("❌ Supabase delete error:", error);
      throw error;
    }
    
    const count = data?.length || 0;
    console.log(`✅ Deleted ${count} notifications for user ${userId}`);
    
    return c.json({
      success: true,
      count: count,
      message: "All notifications cleared"
    });
  } catch (error: any) {
    console.error("Error clearing notifications:", error);
    return c.json({ 
      success: false, 
      error: "Failed to clear notifications",
      details: error?.message || String(error)
    }, 500);
  }
});

// Broadcast notification to all users
app.post("/make-server-b09ae082/notifications/broadcast", async (c) => {
  try {
    console.log("📢 Received POST request to broadcast notification");
    
    const body = await c.req.json();
    console.log("📦 Broadcast request body:", body);
    
    const { type, title, message, actionUrl, icon, imageUrl, productId, dealId } = body;
    
    if (!type || !title || !message) {
      console.error("❌ Missing required fields for broadcast:", { type, title, message });
      return c.json({ 
        success: false, 
        error: "Missing required fields: type, title, message" 
      }, 400);
    }
    
    // Use Supabase notifications table
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );
    
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        type: type,
        title: title,
        message: message,
        target_user_id: null,
        is_broadcast: true,
        action_url: actionUrl || null,
        image_url: imageUrl || null,
        product_id: productId || null,
        deal_id: dealId || null,
        is_read: false,
      })
      .select()
      .single();
    
    if (error) {
      console.error("❌ Supabase insert error:", error);
      throw error;
    }
    
    // Map response
    const notification = {
      id: `notification:${data.id}`,
      type: data.type,
      title: data.title,
      message: data.message,
      targetUserId: "all",
      timestamp: data.created_at,
      isNew: true,
      isRead: false,
      actionUrl: data.action_url,
      imageUrl: data.image_url,
      productId: data.product_id,
      dealId: data.deal_id,
      createdBy: "admin",
      isBroadcast: true
    };
    
    console.log(`✅ Broadcast notification created successfully: ${notification.id}`);
    
    return c.json({
      success: true,
      notification,
      message: "Broadcast notification sent to all users"
    });
  } catch (error: any) {
    console.error("❌ Error broadcasting notification:", error);
    console.error("❌ Error stack:", error?.stack);
    return c.json({ 
      success: false, 
      error: "Failed to broadcast notification",
      details: error?.message || String(error)
    }, 500);
  }
});

// Get notification statistics
app.get("/make-server-b09ae082/notifications/stats", async (c) => {
  try {
    // Use Supabase notifications table
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );
    
    const { data, error } = await supabase
      .from("notifications")
      .select("*");
    
    if (error) {
      console.error("❌ Supabase fetch error:", error);
      throw error;
    }
    
    const notifications = data || [];
    
    const stats = {
      total: notifications.length,
      new: notifications.filter((n: any) => !n.is_read).length,
      read: notifications.filter((n: any) => n.is_read).length,
      byType: {
        order: notifications.filter((n: any) => n.type === "order").length,
        promo: notifications.filter((n: any) => n.type === "promo").length,
        reward: notifications.filter((n: any) => n.type === "reward").length,
        delivery: notifications.filter((n: any) => n.type === "delivery").length,
        system: notifications.filter((n: any) => n.type === "system").length,
      },
      broadcast: notifications.filter((n: any) => n.is_broadcast).length,
    };
    
    return c.json({
      success: true,
      stats
    });
  } catch (error: any) {
    console.error("Error fetching notification stats:", error);
    return c.json({ 
      success: false, 
      error: "Failed to fetch notification stats",
      details: error?.message || String(error)
    }, 500);
  }
});

// Health check endpoint
app.get("/make-server-b09ae082/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

console.log("🚀 Server started with Notification Management System");
console.log("📢 Notification endpoints available:");
console.log("   GET    /make-server-b09ae082/notifications");
console.log("   GET    /make-server-b09ae082/notifications/:userId");
console.log("   POST   /make-server-b09ae082/notifications");
console.log("   PUT    /make-server-b09ae082/notifications/:id");
console.log("   PATCH  /make-server-b09ae082/notifications/:id/read");
console.log("   DELETE /make-server-b09ae082/notifications/:id");
console.log("   POST   /make-server-b09ae082/notifications/broadcast");
console.log("   GET    /make-server-b09ae082/notifications/stats");

Deno.serve(app.fetch);
