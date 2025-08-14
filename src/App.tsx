
import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to handle right-click prevention based on route
const RightClickHandler = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Allow right-click only on admin routes
      if (!location.pathname.startsWith('/admin')) {
        e.preventDefault();
        return false;
      }
    };

    // Add event listener to document
    document.addEventListener('contextmenu', handleContextMenu);

    // Cleanup event listener on unmount or route change
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [location.pathname]);

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RightClickHandler>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<Admin />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </RightClickHandler>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
