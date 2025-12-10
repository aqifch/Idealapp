I have identified the issue. The **Admin Panel** currently has a **fixed layout** that is not responsive. It forces the sidebar to be always visible (`display: flex !important`), which causes layout issues on mobile devices (or when opened in other apps with smaller viewports).

The "other app" likely opens the URL in a mobile view (WebView), where the fixed sidebar takes up most of the screen or gets pushed out, making it unusable or invisible.

To fix this, I will implement a **Responsive Sidebar** using the existing `Sheet` component in your project.

### **Plan:**

1.  **Update `src/components/AdminPanel.tsx`**:
    *   **Remove Inline Styles**: Remove the `display: flex !important` styles that are forcing the layout to break on mobile.
    *   **Hide Desktop Sidebar on Mobile**: Add the `hidden md:flex` class to the existing sidebar so it only appears on larger screens.
    *   **Create Mobile Sidebar**:
        *   Import `Sheet` components (`Sheet`, `SheetContent`, `SheetTrigger`) from your UI library.
        *   Import the `Menu` icon from `lucide-react`.
        *   Create a reusable `renderSidebarContent()` function to avoid code duplication.
    *   **Add Toggle Button**: Insert a "Hamburger Menu" button in the top header that is only visible on mobile (`md:hidden`). Clicking this will open the sidebar in a slide-out drawer.

### **Outcome:**
- **Desktop**: The sidebar will remain visible as it is now.
- **Mobile / Other Apps**: The sidebar will be hidden by default to save space. You will see a **Menu button** in the top-left corner. Tapping it will open the sidebar smoothly.

This will resolve the visibility issue and provide a proper mobile experience.
