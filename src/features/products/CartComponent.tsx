"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthContext";  // <--- import your Auth hook
import { CrossIcon } from "@/src/lib/icons";

type TCartItem = {
  id: number;
  title?: string;
  imageUrl?: string;
  price: number;
  quantity: number;
};

interface CartComponentProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartComponent({ isOpen, onClose }: CartComponentProps) {
  const router = useRouter();
  const { user, loading } = useAuth(); // <--- useAuth to check if user is logged in
  
  const [cartItems, setCartItems] = useState<TCartItem[]>([]);

  // On mount, read from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    // If user is not logged in, clear cart
    // But wait until we've finished checking (loading === false)
    if (!loading) {
      if (!user) {
        // No user => clear localStorage cart
        localStorage.removeItem("cart");
        setCartItems([]);
      } else {
        // Otherwise, user is logged in => load cart
        const stored = localStorage.getItem("cart");
        if (stored) {
          setCartItems(JSON.parse(stored));
        }
      }
    }
  }, [user, loading]);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdated = () => {
      if (!user) {
        // If user logs out mid-session, also clear the cart
        localStorage.removeItem("cart");
        setCartItems([]);
      } else {
        // If user is still logged in, read from localStorage
        const stored = localStorage.getItem("cart");
        if (stored) {
          setCartItems(JSON.parse(stored));
        } else {
          setCartItems([]);
        }
      }
    };

    window.addEventListener("cartUpdated", handleCartUpdated);
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdated);
    };
  }, [user]);

  // Remove an item from the cart
  const handleRemove = (productId: number) => {
    const updated = cartItems.filter((item) => item.id !== productId);
    localStorage.setItem("cart", JSON.stringify(updated));
    setCartItems(updated);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // Increase or decrease quantity
  const handleChangeQty = (productId: number, newQty: number) => {
    if (newQty < 1) return;
    const updated = cartItems.map((item) =>
      item.id === productId ? { ...item, quantity: newQty } : item
    );
    localStorage.setItem("cart", JSON.stringify(updated));
    setCartItems(updated);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // Calculate total price
  const overallTotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cartItems]);

  // Render cart items
  const renderCartItems = () => {
    if (cartItems.length === 0) {
      return <p className="p-4">Cart is empty</p>;
    }

    return cartItems.map((item) => {
      const itemTotal = item.price * item.quantity;
      return (
        <div key={item.id} className="flex gap-2 border-b p-2">
          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-[70px] h-[70px] object-cover"
            />
          )}

          <div className="flex flex-col flex-grow">
            <p className="font-bold">{item.title}</p>
            <div className="flex items-center gap-2 mt-2">
              <button
                className="border px-2"
                onClick={() => handleChangeQty(item.id, item.quantity - 1)}
              >
                -
              </button>
              <span>{item.quantity}</span>
              <button
                className="border px-2"
                onClick={() => handleChangeQty(item.id, item.quantity + 1)}
              >
                +
              </button>
              <span className="ml-4">{itemTotal} BAHT</span>
            </div>
          </div>
          <button onClick={() => handleRemove(item.id)} className="px-2 text-red-500">
            <CrossIcon/>
          </button>
        </div>
      );
    });
  };

  // Handle Checkout Button
  const handleCheckout = () => {
    // If the user is not logged in or cart is empty, do nothing
    // But we already empty the cart for no user, so just check length
    if (cartItems.length === 0) return;

    // Navigate to the Checkout page
    router.push("/checkout");
  };

  // Decide if the Checkout button is disabled
  const isCheckoutDisabled = cartItems.length === 0;

  return (
    <div
      className={`
        fixed top-0 right-0 h-screen bg-white text-black shadow-lg transition-transform duration-300 z-50
        ${isOpen ? "translate-x-0" : "translate-x-full"}
      `}
      style={{ width: "90vw", maxWidth: "400px" }}
    >
      {/* Header of the cart drawer */}
      <div className="flex justify-between items-center px-4 py-3 bg-gray-200">
        <h2 className="text-xl font-bold">My Cart</h2>
        <button onClick={onClose} className="text-2xl text-red-500 font-bold">
          <CrossIcon/>
        </button>
      </div>

      {/* Cart Items */}
      <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 120px)" }}>
        {loading ? (
          <p className="p-4">Loading user session...</p>
        ) : (
          renderCartItems()
        )}
      </div>

      {/* Overall total & Checkout button */}
      {!loading && cartItems.length > 0 && (
        <div className="px-4 py-3 border-t bg-gray-100 flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="font-semibold">Total:</span>
            <span className="font-bold">{overallTotal} BAHT</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={isCheckoutDisabled}
            className={`py-2 rounded-md ${
              isCheckoutDisabled
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-primary-green text-white hover:bg-primary-green2"
            }`}
          >
            {isCheckoutDisabled ? "No items" : "Check out"}
          </button>
        </div>
      )}
    </div>
  );
}
