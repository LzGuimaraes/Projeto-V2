import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, List } from "lucide-react";

const Header = () => {
  const location = useLocation();
  
  return (
    <header className="sticky top-0 z-50 w-full bg-primary shadow-md">
      <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-success" />
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary-foreground">Gerenciamento de Projetos</h1>
          
          <nav className="flex gap-4">
            <Link 
              to="/" 
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                location.pathname === '/' 
                  ? 'bg-primary-foreground text-primary' 
                  : 'text-primary-foreground hover:bg-primary-foreground/10'
              }`}
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Projetos</span>
            </Link>
            
            <Link 
              to="/dashboard" 
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                location.pathname === '/dashboard' 
                  ? 'bg-primary-foreground text-primary' 
                  : 'text-primary-foreground hover:bg-primary-foreground/10'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;