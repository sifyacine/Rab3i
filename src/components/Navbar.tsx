import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const navLinks = [
  { label: "الرئيسية", path: "/" },
  { label: "خدماتنا", path: "/services" },
  { label: "أعمالنا", path: "/portfolio" },
  { label: "المدونة", path: "/blog" },
  { label: "من نحن", path: "/about" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, role, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const isLightMode = document.documentElement.classList.contains("light");
    setIsLight(isLightMode);
  }, []);

  const toggleTheme = () => {
    const newIsLight = !isLight;
    setIsLight(newIsLight);
    if (newIsLight) {
      document.documentElement.classList.add("light");
      localStorage.setItem("rabii-theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      localStorage.setItem("rabii-theme", "dark");
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("rabii-theme");
    if (savedTheme === "light") {
      document.documentElement.classList.add("light");
      setIsLight(true);
    }
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut();
    // Clear any cached data that might depend on the authenticated user
    queryClient.clear();
    setMobileOpen(false);
    toast.success("تم تسجيل الخروج بنجاح");
    // Always send the user back to the public home page after logout
    navigate("/", { replace: true });
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
          scrolled ? "glass-strong shadow-lg shadow-black/10" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
            <img src="/Logo Arabic Version 02.png" alt="ربيعي" className="h-10 w-auto" />
          </Link>

          {/* Desktop */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative text-sm font-medium transition-colors duration-300 hover:text-primary ${
                  location.pathname === link.path ? "text-primary" : "text-foreground/70"
                }`}
              >
                {link.label}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 right-0 left-0 h-0.5 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            ))}

            {/* User Status / Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-3">
                {role === "admin" ? (
                  <Link
                    to="/admin"
                    className="text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
                  >
                    لوحة التحكم
                  </Link>
                ) : role === "client" ? (
                  <Link
                    to="/portal"
                    className="text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
                  >
                    بوابة العملاء
                  </Link>
                ) : null}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-sm font-medium text-foreground/70 hover:text-primary gap-2"
                >
                  <LogOut size={16} />
                  تسجيل الخروج
                </Button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  to="/request"
                  className="rounded-lg bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.97]"
                >
                  تواصل معنا
                </Link>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 text-foreground/70 hover:text-primary"
            >
              {isLight ? <Moon size={18} /> : <Sun size={18} />}
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-foreground md:hidden active:scale-95 transition-transform"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 glass-strong flex flex-col items-center justify-center gap-8 md:hidden"
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <Link
                  to={link.path}
                  className={`text-xl font-semibold transition-colors ${
                    location.pathname === link.path ? "text-primary" : "text-foreground/80"
                  }`}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}

            {/* Mobile User Status / Auth Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="flex flex-col items-center gap-4"
            >
              {user ? (
                <>
                  {role === "admin" ? (
                    <Link
                      to="/admin"
                      className="text-lg font-medium text-foreground/80 hover:text-primary transition-colors"
                    >
                      لوحة التحكم
                    </Link>
                  ) : role === "client" ? (
                    <Link
                      to="/portal"
                      className="text-lg font-medium text-foreground/80 hover:text-primary transition-colors"
                    >
                      بوابة العملاء
                    </Link>
                  ) : null}
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="gap-2 rounded-xl"
                  >
                    <LogOut size={18} /> تسجيل الخروج
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-lg font-medium text-foreground/80 hover:text-primary transition-colors"
                  >
                    تسجيل الدخول
                  </Link>
                  <Link
                    to="/request"
                    className="rounded-lg bg-gradient-brand px-8 py-3 text-lg font-semibold text-white"
                  >
                    تواصل معنا
                  </Link>
                </>
              )}
              <Button
                variant="outline"
                onClick={toggleTheme}
                className="mt-4 gap-2 rounded-xl"
              >
                {isLight ? (
                  <><Moon size={18} /> الوضع الليلي</>
                ) : (
                  <><Sun size={18} /> الوضع المضيء</>
                )}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
