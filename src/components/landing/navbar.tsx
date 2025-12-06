import { Menu, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import UserAvatar from "./user-avatar";
import { useAuth } from "../../context/AuthContext";

const menuItems = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0.4, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
                rotate: { duration: 0.4 },
              }}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg"
            >
              <Rocket className="w-5 h-5 text-primary-foreground" />
            </motion.div>

            <motion.span
              initial={{ x: -12, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="font-semibold text-lg tracking-tight"
            >
              SprintPilot
            </motion.span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition font-medium text-sm"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user && (
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 active:bg-purple-800 transition-colors"
              >
                Dashboard
              </Link>
            )}

            {user ? (
              <UserAvatar />
            ) : (
              <>
                <Button variant="glass" asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button variant="hero" asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-2">
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-72 bg-background/95 backdrop-blur-xl"
              >
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  className="mt-10 flex flex-col gap-6"
                >
                  {menuItems.map((item, index) => (
                    <motion.a
                      key={item.label}
                      href={item.href}
                      className="text-lg font-medium text-muted-foreground hover:text-foreground transition"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.06 }}
                    >
                      {item.label}
                    </motion.a>
                  ))}

                  <div className="pt-4 border-t border-border/40 flex flex-col gap-3">
                    {user && (
                      <Button
                        variant="secondary"
                        asChild
                        className="w-full text-base py-5"
                      >
                        <Link to="/dashboard">Dashboard</Link>
                      </Button>
                    )}

                    {!user && (
                      <>
                        <Button
                          variant="glass"
                          asChild
                          className="justify-center w-full"
                        >
                          <Link to="/login" className="w-full text-center">
                            Sign in
                          </Link>
                        </Button>

                        <Button
                          variant="hero"
                          asChild
                          className="w-full text-base py-5"
                        >
                          <Link to="/signup">Get Started</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </motion.div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
