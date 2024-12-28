"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthContext";
import { LeftArrowIcon } from "@/src/lib/icons";

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, jwt, loading } = useAuth(); // from your AuthContext

  const [myUser, setMyUser] = useState<any>(null);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1) If auth is still loading, do nothing yet
    if (loading) return;

    // 2) If user is null after loading => redirect to login
    if (!user) {
      router.push("/auth/login");
      return;
    }

    // 3) Otherwise, fetch the user data (including orders) from /api/users/me?populate=*
    const fetchUserData = async () => {
      try {
        setIsFetching(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me?populate=*`,
          {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch user data: ${res.statusText}`);
        }

        const data = await res.json();

        // Remove duplicates based on documentId
        if (data.orders) {
          const uniqueOrders = data.orders.filter(
            (order: any, index: number, self: any[]) =>
              index === self.findIndex((o) => o.documentId === order.documentId)
          );

          // Sort orders from newest -> oldest by createdAt
          uniqueOrders.sort(
            (a: any, b: any) =>
              new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf()
          );

          data.orders = uniqueOrders;
        }

        setMyUser(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsFetching(false);
      }
    };

    fetchUserData();
  }, [loading, user, jwt, router]);

  // 4) Render states
  if (loading) {
    return <p className="p-4">Loading user session...</p>;
  }

  // If we triggered a redirect for no user, return null
  if (!user) {
    return null;
  }

  if (isFetching) {
    return <p className="p-4">Loading your orders...</p>;
  }

  if (error) {
    return <p className="p-4 text-red-500">Error: {error}</p>;
  }

  if (!myUser?.orders || myUser.orders.length === 0) {
    return <p className="p-4">No orders found.</p>;
  }

  // 5) Render minimal info for each order
  return (
    <div className="max-w-2xl mx-auto p-4">
      <button onClick={() => router.push("/")}>
        <LeftArrowIcon />
      </button>
      <h1 className="text-2xl mb-4">My Orders</h1>

      <ul className="space-y-4">
        {myUser.orders.map((order: any) => {
          const { id, createdAt, orderStatus, address, totalPrice, uuid } = order;
          return (
            <li key={id} className="border p-4 rounded">
              {/* Minimal fields */}
              <p><strong>Date:</strong> {new Date(createdAt).toLocaleString()}</p>
              <p><strong>Status:</strong> {orderStatus}</p>
              <p><strong>Address:</strong> {address}</p>
              <p><strong>Total Price:</strong> {totalPrice} BAHT</p>

              {/* Link to /my-orders/[orderId] */}
              <Link
                href={`/my-orders/${uuid}`}
                className="text-blue-600 underline mt-2 inline-block"
              >
                View Details
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
