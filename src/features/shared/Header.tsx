"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CartIcon, ClockIcon, UserIcon } from "@/src/lib/icons";
import CartComponent from "@/src/features/products/CartComponent";
import { useAuth } from "@/app/providers/AuthContext";

const Header = () => {
  const router = useRouter();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useAuth(); // remove logout from here

  // NEW: State for cart count
  const [cartCount, setCartCount] = useState(0);

  // On mount, and whenever "cartUpdated" event triggers, update cartCount
  useEffect(() => {
    const handleCartUpdated = () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("cart");
        if (stored) {
          const cart = JSON.parse(stored);
          // Sum up quantities
          const totalCount = cart.length
          setCartCount(totalCount);
        } else {
          setCartCount(0);
        }
      }
    };

    // Initial check on mount
    handleCartUpdated();

    // Listen for cart updates
    window.addEventListener("cartUpdated", handleCartUpdated);

    // Cleanup
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdated);
    };
  }, []);

  const toggleCartDrawer = () => {
    setIsCartOpen((prev) => !prev);
  };

  const handleProfileClick = () => {
    router.push("/profile");
  };

  return (
    <>
      <div className="sticky top-0 left-0 w-screen px-12 py-6 bg-primary-red text-white flex justify-between z-30">
        <Link href="/" className="underline">
          Menu
        </Link>

        <div className="flex items-center text-white text-2xl gap-6">
          {/* Cart Icon toggles the drawer */}
          <button onClick={toggleCartDrawer} className="relative">
            <CartIcon />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {cartCount}
              </span>
            )}
          </button>

          {/* If user is NOT logged in => show Login button */}
          {!user && (
            <Link href="/auth/login" className="underline">
              Login
            </Link>
          )}

          {/* If user IS logged in => show UserIcon (navigates to /profile) */}
          {user && (
            <button onClick={handleProfileClick} className="flex items-center gap-1">
              <UserIcon />
              {/* <span className="text-sm">{user.username}</span> */}
            </button>
          )}
          {user && (
            <Link href="/my-orders" className="flex items-center gap-1">
              <ClockIcon />
              {/* <span className="text-sm">{user.username}</span> */}
            </Link>
          )}
        </div>
      </div>

      <CartComponent isOpen={isCartOpen} onClose={toggleCartDrawer} />
    </>
  );
};

export default Header;
