import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, User, Menu, X, MoreVertical, LogOut, Sun, Moon, Shield, Compass, Zap, Brain, PlusCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import logo from "@/assets/renex-logo.png";
import { toast } from "sonner";

const navLinks = [
  { label: "Home", path: "/", icon: null },
  { label: "Browse", path: "/browse", icon: Compass },
  { label: "Spark Arena", path: "/spark-arena", icon: Zap },
  { label: "AI Brainstorm", path: "/brainstorm", icon: Brain },
  { label: "Post", path: "/post", icon: PlusCircle },
];

export function Navbar() {
  const [searchValue, setSearchValue] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, isAdmin, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Click outside to close menus
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Triple-tap logo for admin access
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout>>();

  const handleLogoTap = useCallback(() => {
    tapCount.current += 1;
    if (tapCount.current === 3) {
      tapCount.current = 0;
      clearTimeout(tapTimer.current);
      setShowAdminLogin(true);
    } else {
      clearTimeout(tapTimer.current);
      tapTimer.current = setTimeout(() => {
        if (tapCount.current < 3) {
          navigate("/");
        }
        tapCount.current = 0;
      }, 400);
    }
  }, [navigate]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPass = localStorage.getItem("rja_admin_password") || "12345678";
    if (adminUser === "admin" && adminPass === storedPass) {
      setShowAdminLogin(false);
      setAdminUser("");
      setAdminPass("");
      toast.success("Admin access granted");
      navigate("/admin");
    } else {
      toast.error("Invalid credentials");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    navigate(`/browse?search=${encodeURIComponent(searchValue)}`);
    setSearchValue("");
  };

  const handleLogout = async () => {
    await signOut();
    setMenuOpen(false);
    toast.success("Logged out");
    navigate("/");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-14 gap-3">
          {/* Logo */}
          <button onClick={handleLogoTap} className="flex items-center gap-2 shrink-0">
            <img src={logo} alt="Renex" className="w-8 h-8 rounded-lg object-contain" />
            <span className="font-display font-bold text-sm tracking-wide hidden sm:inline">
              Ren<span className="text-primary">ex</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map(link => {
              const isActive = location.pathname === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {link.icon && <link.icon className="w-3.5 h-3.5" />}
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            <form onSubmit={handleSearch} className="hidden lg:block">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search..."
                  className="w-36 bg-secondary border border-border rounded-full pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:w-52 transition-all"
                />
              </div>
            </form>

            {user ? (
              <button
                onClick={() => navigate(isAdmin ? "/admin" : "/account")}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <User className="w-3.5 h-3.5" />
                  )}
                </div>
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-primary/90 transition-colors"
              >
                Sign In
              </button>
            )}

            {/* 3-dot menu */}
            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-10 w-44 bg-card border border-border rounded-xl shadow-lg py-1.5 z-50">
                  <button
                    onClick={() => { toggleTheme(); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-foreground hover:bg-secondary transition-colors"
                  >
                    {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => { navigate("/admin"); setMenuOpen(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-foreground hover:bg-secondary transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5" /> Admin
                    </button>
                  )}
                  {user && (
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-destructive hover:bg-secondary transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Logout
                    </button>
                  )}
                </div>
              )}
            </div>

            <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-background p-3 space-y-1">
            {navLinks.map(link => (
              <button
                key={link.path}
                onClick={() => { navigate(link.path); setMobileOpen(false); }}
                className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-secondary transition-colors"
              >
                {link.icon && <link.icon className="w-4 h-4 text-primary" />}
                {link.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setShowAdminLogin(false)}>
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-destructive" />
              <h2 className="font-display font-bold text-lg">Admin Access</h2>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-3">
              <input type="text" value={adminUser} onChange={e => setAdminUser(e.target.value)} placeholder="Username"
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50" />
              <input type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)} placeholder="Password"
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50" />
              <button type="submit" className="w-full bg-destructive text-destructive-foreground py-3 rounded-xl text-sm font-semibold">Access</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
