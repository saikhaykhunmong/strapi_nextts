"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthContext";

import { TPhoto, TProduct } from "@/src/types/product.type";
import Image from "next/image";

interface ICartItem {
  id: number;
  title?: string;
  imageUrl?: string;
  price: number;
  quantity: number;
}

const ProductCard = ({
  data,
  isInCart = false,
  defaultQty = 1,
}: {
  data: TProduct;
  isInCart?: boolean;
  defaultQty?: number;
}) => {
  const router = useRouter();
  const { user } = useAuth();

  const [showQuantity, setShowQuantity] = useState(false);
  const [quantity, setQuantity] = useState(defaultQty);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    if (isInCart) {
      setShowQuantity(true);
      setDisabled(true);
    }
  }, [isInCart]);

  useEffect(() => {
    const handleCartUpdated = () => {
      if (typeof window === "undefined") return;
      const cartInStorage = localStorage.getItem("cart");

      if (!cartInStorage) {
        setShowQuantity(false);
        setQuantity(1);
        setDisabled(false);
        return;
      }

      const cart: ICartItem[] = JSON.parse(cartInStorage);
      const foundItem = cart.find((item) => item.id === data.id);

      if (foundItem) {
        setQuantity(foundItem.quantity);
        setShowQuantity(true);
        setDisabled(true);
      } else {
        setShowQuantity(false);
        setQuantity(1);
        setDisabled(false);
      }
    };

    window.addEventListener("cartUpdated", handleCartUpdated);
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdated);
    };
  }, [data.id]);

  const updateLocalStorage = (newQty: number) => {
    if (typeof window === "undefined") return;

    let cart: ICartItem[] = [];
    const cartInStorage = localStorage.getItem("cart");

    if (cartInStorage) {
      cart = JSON.parse(cartInStorage);
    }

    const existingIndex = cart.findIndex((item) => item.id === data.id);

    if (existingIndex >= 0) {
      cart[existingIndex].quantity = newQty;
    } else {
      cart.push({
        id: data.id,
        title: data.title,
        imageUrl:
          data.photos && data.photos.length > 0
            ? process.env.NEXT_PUBLIC_STRAPI_URL + data.photos[0].url
            : "https://www.vocaleurope.eu/wp-content/uploads/no-image.jpg",
        price: data.price,
        quantity: newQty,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleAddToCart = () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (!showQuantity) {
      setShowQuantity(true);
      setDisabled(true);
      setQuantity(1);
      updateLocalStorage(1);
    } else {
      updateLocalStorage(quantity);
      setDisabled(true);
    }
  };

  const handleIncrease = () => {
    const newQty = quantity + 1;
    setQuantity(newQty);
    if (showQuantity) {
      updateLocalStorage(newQty);
    }
  };

  const handleDecrease = () => {
    const newQty = Math.max(1, quantity - 1);
    setQuantity(newQty);
    if (showQuantity) {
      updateLocalStorage(newQty);
    }
  };

  return (
    <div className="relative bg-white p-4 sm:p-6 flex flex-col justify-between items-center gap-3 sm:gap-4">
      {/* Overlay for Sold Out */}
      {data.soldOut && (
        <div className="absolute inset-0 bg-gray-300 bg-opacity-75 flex items-center justify-center z-10">
          <p className="text-2xl font-bold text-red-600">Sold Out</p>
        </div>
      )}

      {/* Product Images */}
      <div className={`w-full flex justify-center ${data.soldOut ? "blur-sm" : ""}`}>
        <ul className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {data.photos?.map((image: TPhoto) => (
            <li key={image.id}>
              <img
                src={process.env.NEXT_PUBLIC_STRAPI_URL + image.url}
                alt={data.title}
                className="w-24 sm:w-32 h-24 sm:h-32 object-cover rounded-md"
              />
            </li>
          ))}
          {!data.photos && (
            <Image
              src="/placeholder.png"
              alt="No image"
              width={70}
              height={70}
              className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-md"
            />
          )}
        </ul>
      </div>

      {/* Product Info & Actions */}
      <div className={`w-full px-2 sm:px-4 flex flex-col ${data.soldOut ? "blur-sm" : ""}`}>
        <h2 className="text-lg sm:text-xl font-semibold">{data.title}</h2>
        <p className="text-sm sm:text-base text-gray-700 mt-1 sm:mt-2">{data.description}</p>
        <p className="text-md sm:text-lg font-medium mt-1">{data.price} BAHT</p>

        {/* Quantity Selector */}
        {showQuantity && !data.soldOut && (
          <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-3 self-center">
            <button
              className="border border-gray-300 rounded-md w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-lg sm:text-xl text-gray-700 hover:bg-gray-100"
              onClick={handleDecrease}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="text-sm sm:text-base font-medium">{quantity}</span>
            <button
              className="border border-gray-300 rounded-md w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-lg sm:text-xl text-gray-700 hover:bg-gray-100"
              onClick={handleIncrease}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          className="bg-primary-green disabled:bg-green-400 disabled:text-black text-white text-sm sm:text-base p-2 sm:p-3 w-full rounded-md hover:bg-primary-green2 mt-3 sm:mt-4 transition-colors"
          onClick={handleAddToCart}
          disabled={disabled || (data.soldOut ? true : false)}
        >
          {data.soldOut ? "Unavailable" : disabled ? "Added" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
