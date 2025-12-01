import React from "react";
import { useTheme } from "./providers/theme/ThemeContext";
import NavBar from "./components/shared/Navbar";
import { NavigationProvider } from "./providers/navigation/NavigationProvider";
import { useNavigation } from "./providers/navigation/NavigationContext";
import { PriceProvider } from "./providers/price/PriceProvider";
import WalletView from "./views/WalletView";
import HomeView from "./views/HomeView";
import LotteryGridList from "./components/lottery/components/LotteryGridList";
import LotteryDetailPage from "./components/lottery/components/LotteryDetailPage";

const Pages: React.FC = () => {
  const { currentPage } = useNavigation();

  if (currentPage === "/" || currentPage === "") {
    return <HomeView />;
  }

  if (currentPage === "/lottery") {
    return <LotteryGridList />;
  }

  if (currentPage === "/wallet") {
    return <WalletView />;
  }

  if (currentPage.startsWith("/lottery/")) {
    const gameId = decodeURIComponent(currentPage.replace("/lottery/", ""));
    return <LotteryDetailPage gameId={gameId} />;
  }

  return <div className="text-center">Page not found!</div>;
};

const App: React.FC = () => {
  const { darkMode } = useTheme();

  // Apply dark mode class to document root for :root.dark CSS selectors
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <PriceProvider>
      <NavigationProvider>
        <div className="min-h-screen gradient-bg flex flex-col">
          <NavBar />
          <div className="flex-1 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
            <Pages />
          </div>
          {/* Footer */}
          <footer className="border-t border-white/10 bg-black/40 py-6 px-4 mt-12">
            <div className="max-w-screen-xl mx-auto text-center">
              <p className="text-sm text-muted-foreground">
                This project is still in beta. Questions or feedback?{" "}
                <a href="mailto:plutohan0x@gmail.com" className="text-primary hover:underline">
                  plutohan0x@gmail.com
                </a>
              </p>
            </div>
          </footer>
        </div>
      </NavigationProvider>
    </PriceProvider>
  );
};

export default App;
