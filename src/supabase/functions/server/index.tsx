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
  try {
    console.log("📡 Fetching store settings...");
    
    let settings = {};
    try {
      settings = await kv.get("store_settings");
    } catch (kvError) {
      console.error("❌ KV store error:", kvError);
    }
    
    // Default settings if not found
    if (!settings) {
      settings = {
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
      // Save defaults
      await kv.set("store_settings", settings);
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
    
    await kv.set("store_settings", body);
    
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
    
    let notifications = [];
    try {
      notifications = await kv.getByPrefix("notification:");
      console.log(`📦 Retrieved ${notifications?.length || 0} notifications from KV store`);
    } catch (kvError) {
      console.error("❌ KV store error:", kvError);
      // Return empty array if KV fails
      return c.json({
        success: true,
        notifications: [],
        count: 0,
        warning: "KV store unavailable"
      });
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
    
    // Get all notifications
    let allNotifications = [];
    try {
      allNotifications = await kv.getByPrefix("notification:");
      console.log(`📦 Retrieved ${allNotifications?.length || 0} notifications from KV store`);
    } catch (kvError) {
      console.error("❌ KV store error:", kvError);
      // Return empty array if KV fails
      return c.json({
        success: true,
        notifications: [],
        count: 0,
        warning: "KV store unavailable"
      });
    }
    
    // Filter notifications for this user or global notifications
    const userNotifications = (allNotifications || []).filter(notif => 
      notif?.targetUserId === userId || 
      notif?.targetUserId === "all" ||
      !notif?.targetUserId
    );
    
    console.log(`🔍 Filtered to ${userNotifications.length} notifications for this user`);
    
    // Sort by timestamp (newest first) with safety check
    const sortedNotifications = userNotifications.sort((a, b) => {
      const aTime = a?.timestamp ? new Date(a.timestamp).getTime() : 0;
      const bTime = b?.timestamp ? new Date(b.timestamp).getTime() : 0;
      return bTime - aTime;
    });
    
    console.log(`✅ Returning ${sortedNotifications.length} sorted notifications for user: ${userId}`);
    
    return c.json({
      success: true,
      notifications: sortedNotifications,
      count: sortedNotifications.length
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
  try {
    console.log("📥 Received POST request to create notification");
    
    const body = await c.req.json();
    console.log("📦 Request body:", body);
    
    const { type, title, message, targetUserId, actionUrl, icon, imageUrl, productId, dealId } = body;
    
    if (!type || !title || !message) {
      console.error("❌ Missing required fields:", { type, title, message });
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
    
    console.log("💾 Saving notification to KV store...");
    await kv.set(notificationId, notification);
    
    console.log(`✅ Notification created successfully: ${notificationId}`);
    
    return c.json({
      success: true,
      notification,
      message: "Notification created successfully"
    });
  } catch (error) {
    console.error("❌ Error creating notification:", error);
    console.error("❌ Error stack:", error?.stack);
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
    
    const existingNotifications = await kv.getByPrefix("notification:");
    const existing = existingNotifications.find(n => n.id === notificationId);
    
    if (!existing) {
      return c.json({ 
        success: false, 
        error: "Notification not found" 
      }, 404);
    }
    
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(notificationId, updated);
    
    console.log(`✅ Notification updated: ${notificationId}`);
    
    return c.json({
      success: true,
      notification: updated,
      message: "Notification updated successfully"
    });
  } catch (error) {
    console.error("Error updating notification:", error);
    return c.json({ 
      success: false, 
      error: "Failed to update notification",
      details: error.message 
    }, 500);
  }
});

// Mark notification as read
app.patch("/make-server-b09ae082/notifications/:id/read", async (c) => {
  try {
    const notificationId = c.req.param("id");
    
    const existingNotifications = await kv.getByPrefix("notification:");
    const existing = existingNotifications.find(n => n.id === notificationId);
    
    if (!existing) {
      return c.json({ 
        success: false, 
        error: "Notification not found" 
      }, 404);
    }
    
    const updated = {
      ...existing,
      isNew: false,
      isRead: true,
      readAt: new Date().toISOString()
    };
    
    await kv.set(notificationId, updated);
    
    return c.json({
      success: true,
      notification: updated
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return c.json({ 
      success: false, 
      error: "Failed to mark notification as read",
      details: error.message 
    }, 500);
  }
});

// Mark all notifications as read for a user
app.patch("/make-server-b09ae082/notifications/user/:userId/read-all", async (c) => {
  try {
    const userId = c.req.param("userId");
    
    const allNotifications = await kv.getByPrefix("notification:");
    
    // Filter user notifications
    const userNotifications = allNotifications.filter(notif => 
      notif.targetUserId === userId || 
      notif.targetUserId === "all" ||
      !notif.targetUserId
    );
    
    // Mark all as read
    const updatePromises = userNotifications.map(notif => {
      const updated = {
        ...notif,
        isNew: false,
        isRead: true,
        readAt: new Date().toISOString()
      };
      return kv.set(notif.id, updated);
    });
    
    await Promise.all(updatePromises);
    
    console.log(`✅ Marked ${userNotifications.length} notifications as read for user ${userId}`);
    
    return c.json({
      success: true,
      count: userNotifications.length,
      message: "All notifications marked as read"
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return c.json({ 
      success: false, 
      error: "Failed to mark notifications as read",
      details: error.message 
    }, 500);
  }
});

// Delete notification
app.delete("/make-server-b09ae082/notifications/:id", async (c) => {
  try {
    const notificationId = c.req.param("id");
    
    await kv.del(notificationId);
    
    console.log(`✅ Notification deleted: ${notificationId}`);
    
    return c.json({
      success: true,
      message: "Notification deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return c.json({ 
      success: false, 
      error: "Failed to delete notification",
      details: error.message 
    }, 500);
  }
});

// Delete all notifications for a user
app.delete("/make-server-b09ae082/notifications/user/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    
    const allNotifications = await kv.getByPrefix("notification:");
    
    // Filter user notifications
    const userNotifications = allNotifications.filter(notif => 
      notif.targetUserId === userId || 
      notif.targetUserId === "all" ||
      !notif.targetUserId
    );
    
    // Delete all user notifications
    const deletePromises = userNotifications.map(notif => kv.del(notif.id));
    await Promise.all(deletePromises);
    
    console.log(`✅ Deleted ${userNotifications.length} notifications for user ${userId}`);
    
    return c.json({
      success: true,
      count: userNotifications.length,
      message: "All notifications cleared"
    });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    return c.json({ 
      success: false, 
      error: "Failed to clear notifications",
      details: error.message 
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
    
    const notificationId = `notification:broadcast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log("🆔 Generated broadcast ID:", notificationId);
    
    const notification = {
      id: notificationId,
      type,
      title,
      message,
      targetUserId: "all", // Broadcast to all users
      timestamp: new Date().toISOString(),
      isNew: true,
      isRead: false,
      actionUrl: actionUrl || null,
      icon: icon || null,
      imageUrl: imageUrl || null,
      productId: productId || null,
      dealId: dealId || null,
      createdBy: "admin",
      isBroadcast: true
    };
    
    console.log("💾 Saving broadcast notification to KV store...");
    await kv.set(notificationId, notification);
    
    console.log(`✅ Broadcast notification created successfully: ${notificationId}`);
    
    return c.json({
      success: true,
      notification,
      message: "Broadcast notification sent to all users"
    });
  } catch (error) {
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
    const notifications = await kv.getByPrefix("notification:");
    
    const stats = {
      total: notifications.length,
      new: notifications.filter(n => n.isNew).length,
      read: notifications.filter(n => n.isRead).length,
      byType: {
        order: notifications.filter(n => n.type === "order").length,
        promo: notifications.filter(n => n.type === "promo").length,
        reward: notifications.filter(n => n.type === "reward").length,
        delivery: notifications.filter(n => n.type === "delivery").length,
        system: notifications.filter(n => n.type === "system").length,
      },
      broadcast: notifications.filter(n => n.isBroadcast).length,
    };
    
    return c.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error("Error fetching notification stats:", error);
    return c.json({ 
      success: false, 
      error: "Failed to fetch notification stats",
      details: error.message 
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
