import {
  LayoutDashboard,
  Package,
  Layers,
  Sprout,
  MessageSquare,
  Images,
  BarChart3,
  Users,
  Settings,
  Boxes,
  Tag,
  FileText,
  Globe,
  Clock,
  Search
} from "lucide-react";

// Export commonly used icons so the rest of the app imports from a single place.
export {
  LayoutDashboard,
  Package,
  Layers,
  Sprout,
  MessageSquare,
  Images,
  BarChart3,
  Users,
  Settings,
  Boxes,
  Tag,
  FileText,
  Globe,
  Clock,
  Search
};

// Map route paths to an icon component to keep headers consistent
export const pageIconMap: Record<string, any> = {
  "/": LayoutDashboard,
  "/products": Package,
  "/categories": Layers,
  "/farms": Sprout,
  "/messages": MessageSquare,
  "/media": Images,
  "/statistics": BarChart3,
  "/users": Users,
  "/settings": Settings
};

