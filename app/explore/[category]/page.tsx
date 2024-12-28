"use client";
import { useQuery } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { TProduct } from "@/src/types/product.type";
import ProductCard from "@/src/features/products/ProductCard";
import { useAuth } from "@/app/providers/AuthContext";

const validCategories = ["food", "dry-food", "drinks"];

export default function CategoryPage() {
  const { user, loading } = useAuth();             // HOOK 1
  const router = useRouter();                      // HOOK 2
  const pathname = usePathname();                  // HOOK 3

  const [cart, setCart] = useState<{ id: number; quantity: number }[]>([]); // HOOK 4

  // HOOK 5
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!loading) {
      if (!user) {
        localStorage.removeItem("cart");
        setCart([]);
      } else {
        const storedCart = localStorage.getItem("cart");
        if (storedCart) {
          setCart(JSON.parse(storedCart));
        }
      }
    }
  }, [user, loading]);

  // Now do your category logic AFTER the hooks are set
  const category = pathname.split("/").pop();

  // If category is invalid => push to 404, but STILL do it AFTER the hooks have been called
  if (!validCategories.includes(category as string)) {
    router.push("/404");
    return null; 
  }

  // HOOK 6
  const {
    data: products,
    isLoading,
    isError,
  } = useQuery<TProduct[]>({
    queryKey: ["products", category],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/products?filters[category][$eq]=${category}&populate=*`
      );
      const json = await res.json();
      return json.data as TProduct[];
    },
  });

  if (isLoading) return <p>Loading products...</p>;
  if (isError) return <p>Something went wrong. Please try again later.</p>;

  return (
    <div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 m-8">
        {products?.map((product) => {
          const foundItem = cart.find((item) => item.id === product.id);
          const isInCart = !!foundItem;
          const defaultQty = foundItem?.quantity ?? 1;

          return (
            <ProductCard
              key={product.id}
              data={product}
              isInCart={isInCart}
              defaultQty={defaultQty}
            />
          );
        })}
      </ul>
    </div>
  );
}
