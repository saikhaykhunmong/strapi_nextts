"use client";
import { LeftArrowIcon } from "@/src/lib/icons";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // We'll store the full order object here
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // The "uuid" passed as ?orderId=xxxx
  const orderId = searchParams.get("orderId");

  // 1) Fetch the order from Strapi by matching the "uuid" field
  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        // Example: populate=* to get screenshots and all fields
        const url = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/orders?filters[uuid][$eq]=${orderId}&populate=*`;

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to fetch order: ${res.statusText}`);
        }

        const json = await res.json();
        // If there's at least one matching order, store the first
        if (json.data && json.data.length > 0) {
          // Typically there's only 1 order with that UUID
          setOrder(json.data[0]);
        } else {
          setError("No order found with this UUID.");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // 2) Handle states
  if (!orderId) {
    return <p className="p-4">No order ID found in URL.</p>;
  }

  if (loading) {
    return <p className="p-4">Loading order details...</p>;
  }

  if (error) {
    return <p className="p-4 text-red-500">Error: {error}</p>;
  }

  if (!order) {
    return <p className="p-4">No order data found.</p>;
  }

  // 3) Now display the order detail
  // Because of how Strapi returns data, the main fields are on order.attributes in some setups.
  // But from your snippet, it looks like they're directly on `order` (like order.uuid, order.items, etc.).
  // If you see them on `order.attributes`, adjust accordingly.

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

  // 4) We'll render all the info, plus a "Go to My Orders" button
  return (
    <div className="p-4 max-w-2xl mx-auto">
       <button
          onClick={() => router.push("/my-orders")}
        >
          <LeftArrowIcon />
        </button>
      <h1 className="text-2xl font-bold mb-4">Order Complete</h1>

      {/* Basic info */}
      <p>
        <strong>Order ID:</strong> {id}
      </p>
      <p>
        <strong>Status:</strong> {orderStatus}
      </p>
      <p>
        <strong>Placed At:</strong> {new Date(createdAt).toLocaleString()}
      </p>
      <p>
        <strong>Full Name:</strong> {fullName}
      </p>
      <p>
        <strong>Phone:</strong> {phone}
      </p>
      <p>
        <strong>Email:</strong> {email}
      </p>
      <p>
        <strong>Address:</strong> {address}
      </p>
      {notes && (
        <p>
          <strong>Notes:</strong> {notes}
        </p>
      )}
      <p>
        <strong>Total Price:</strong> {totalPrice} BAHT
      </p>

      {/* Items */}
      <div className="mt-4">
        <strong>Items:</strong>
        <ul className="list-none">
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

      {/* Screenshot(s) - in your example, it's an array */}
      {screenshot && screenshot.length > 0 && (
        <div className="mt-4">
          <p className="font-semibold">My Screenshot(s):</p>
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

      {/* Button to go to My Orders */}
      <div className="mt-6">
        <button
          onClick={() => router.push("/my-orders")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Go to My Order History
        </button>
      </div>
    </div>
  );
}
