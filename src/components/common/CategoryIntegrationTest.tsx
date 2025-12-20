import React, { useEffect, useState } from "react";
import { Category } from "../../data/mockData";

/**
 * 🧪 Category Integration Test Component
 * 
 * This component verifies that category changes in Admin Panel
 * are properly synced to user views via localStorage.
 * 
 * Usage: Import and render this component anywhere to see real-time sync status
 */
export const CategoryIntegrationTest = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [syncStatus, setSyncStatus] = useState<"checking" | "synced" | "error">("checking");

  useEffect(() => {
    // Initial load
    loadCategories();

    // Listen for localStorage changes (cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'idealpoint_categories') {
        loadCategories();
        setSyncStatus("synced");
      }
    };

    // Listen for custom events (same-tab sync)
    const handleCustomUpdate = () => {
      loadCategories();
      setSyncStatus("synced");
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('categoriesUpdated', handleCustomUpdate);

    // Poll for changes every second
    const interval = setInterval(() => {
      loadCategories();
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('categoriesUpdated', handleCustomUpdate);
      clearInterval(interval);
    };
  }, []);

  const loadCategories = () => {
    try {
      const saved = localStorage.getItem('idealpoint_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        setCategories(parsed);
        setLastUpdate(new Date().toLocaleTimeString());
        setSyncStatus("synced");
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      setSyncStatus("error");
    }
  };

  return (
    <div 
      className="fixed bottom-4 right-4 p-4 rounded-2xl backdrop-blur-xl z-50 max-w-sm"
      style={{
        background: 'rgba(255, 255, 255, 0.9)',
        border: '2px solid rgba(255, 159, 64, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-black text-gray-900 text-sm">🧪 Category Sync Test</h4>
        <div className="flex items-center gap-2">
          <div 
            className={`w-2 h-2 rounded-full ${
              syncStatus === "synced" ? "bg-green-500" : 
              syncStatus === "error" ? "bg-red-500" : 
              "bg-yellow-500"
            } animate-pulse`}
          />
          <span className="text-xs font-bold text-gray-600">
            {syncStatus === "synced" ? "LIVE" : 
             syncStatus === "error" ? "ERROR" : 
             "CHECKING"}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-2 rounded-lg bg-orange-50">
          <div className="text-xs text-gray-600">Total</div>
          <div className="font-black text-orange-600 text-lg">{categories.length}</div>
        </div>
        <div className="p-2 rounded-lg bg-green-50">
          <div className="text-xs text-gray-600">Active</div>
          <div className="font-black text-green-600 text-lg">
            {categories.filter(c => c.isActive !== false).length}
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="space-y-1 mb-3 max-h-40 overflow-y-auto">
        {categories
          .filter(c => c.isActive !== false)
          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
          .map((cat, index) => (
            <div 
              key={cat.id}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-orange-50 transition-all"
            >
              <span className="text-xs font-bold text-gray-500">#{index + 1}</span>
              <span className="text-lg">{cat.icon}</span>
              <span className="font-bold text-gray-900 text-xs flex-1">{cat.name}</span>
              <div 
                className="w-3 h-3 rounded-full border border-white"
                style={{ backgroundColor: cat.color }}
              />
            </div>
          ))}
      </div>

      {/* Last Update */}
      <div className="text-xs text-gray-500 text-center border-t border-gray-200 pt-2">
        Last sync: {lastUpdate || "Loading..."}
      </div>

      {/* Instructions */}
      <div className="mt-2 p-2 rounded-lg bg-blue-50 border border-blue-200">
        <div className="text-xs font-bold text-blue-700 mb-1">✨ Test Instructions:</div>
        <ol className="text-xs text-blue-600 space-y-0.5 pl-4 list-decimal">
          <li>Open Admin Panel</li>
          <li>Go to Categories</li>
          <li>Add/Edit/Delete category</li>
          <li>Watch this panel update instantly!</li>
        </ol>
      </div>
    </div>
  );
};
