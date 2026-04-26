import { Routes, Route, useLocation } from "react-router-dom";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardPage } from "./pages/DashboardPage";
import { ProductsPage } from "./pages/ProductsPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { FarmsPage } from "./pages/FarmsPage";
import { MessagesPage } from "./pages/MessagesPage";
import { MediaPage } from "./pages/MediaPage";
import { StatisticsPage } from "./pages/StatisticsPage";
import { UsersPage } from "./pages/UsersPage";
import { SettingsPage } from "./pages/SettingsPage";
import { LoginPage } from "./pages/LoginPage";
import { useState, useEffect } from "react";

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Ensure mobile sidebar closed on route change (no extra resize/reflow behavior)
  useEffect(() => {
    if (sidebarOpen) setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        <main key={location.pathname} className="flex-1 p-4 md:p-6">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/farms" element={<FarmsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/media" element={<MediaPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;

