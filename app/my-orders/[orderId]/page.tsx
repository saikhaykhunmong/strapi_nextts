"use client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/providers/AuthContext";
import { LeftArrowIcon } from "@/src/lib/icons";

export default function OrderDetailPage() {
  const router = useRouter();
  const { user, jwt, loading } = useAuth();
  const { orderId } = useParams(); // extracts [id] from the URL
    console.log(orderId)
  const [order, setOrder] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1) Wait for auth to load, then check if user is logged in
  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    // 2) Fetch the order from Strapi, matching id
    const fetchOrder = async () => {
      try {
        setIsFetching(true);
        // example: GET /api/orders?filters[id][$eq]=18&populate=*
        const url = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/orders?filters[uuid][$eq]=${orderId}&populate=*`;
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${jwt}`, // if needed
          },
        });
        console.log(res)
        if (!res.ok) {
          throw new Error(`Failed to fetch order: ${res.statusText}`);
        }
        const json = await res.json();

        if (json.data && json.data.length > 0) {
          setOrder(json.data[0]); // we assume 1 match
        } else {
          setError("No order found with that ID.");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsFetching(false);
      }
    };

    fetchOrder();
  }, [loading, user, jwt, router, orderId]);

  // 3) Render states
  if (loading) {
    return <p className="p-4">Loading user session...</p>;
  }

  if (!user) {
    return null;
  }

  if (isFetching) {
    return <p className="p-4">Loading order detail...</p>;
  }

  if (error) {
    return <p className="p-4 text-red-500">Error: {error}</p>;
  }

  if (!order) {
    return <p className="p-4">No order data found.</p>;
  }

  // 4) Let's show the full order detail
  const {
    id,
    uuid,
    orderStatus,
    totalPrice,
    fullName,
    phone,
    address,
    notes,
    email,
    items,
    screenshot,
    createdAt,
    updatedAt,
  } = order;

  return (
    <div className="p-4 max-w-2xl mx-auto">
        <button
          onClick={() => router.push("/my-orders")}
        >
          <LeftArrowIcon />
        </button>
      <h1 className="text-2xl font-bold mb-4">Order Detail</h1>

      <p><strong>Status:</strong> {orderStatus}</p>
      <p><strong>Created:</strong> {new Date(createdAt).toLocaleString()}</p>
      <p><strong>Full Name:</strong> {fullName}</p>
      <p><strong>Phone:</strong> {phone}</p>
      <p><strong>Email:</strong> {email}</p>
      <p><strong>Address:</strong> {address}</p>
      {notes && <p><strong>Notes:</strong> {notes}</p>}
      <p><strong>Total Price:</strong> {totalPrice} BAHT</p>

      <div className="mt-4">
        <strong>Items:</strong>
        <ul>
          {items?.map((item: any, idx: number) => (
            <li key={idx} className="my-2">
              <div>
                <strong>{item.title}</strong> x {item.quantity} ={" "}
                {item.price * item.quantity} BAHT
              </div>
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-32 h-auto mt-1 border"
                />
              )}
            </li>
          ))}
        </ul>
      </div>

      {screenshot && screenshot.length > 0 && (
        <div className="mt-4">
          <p className="font-semibold">Screenshot(s):</p>
          <ul className="flex flex-wrap gap-4 mt-2">
            {screenshot.map((img: any) => (
              <li key={img.id}>
                <img
                  alt={img.name}
                  src={`${process.env.NEXT_PUBLIC_STRAPI_URL}${img.url}`}
                  className="border w-48"
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={() => router.push("/my-orders")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Back to My Orders
        </button>
      </div>
    </div>
  );
}
