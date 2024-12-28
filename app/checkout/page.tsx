"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { useAuth } from "@/app/providers/AuthContext"; // <-- adjust path if needed
import Image from "next/image";

interface IFormInput {
  fullName: string;
  phone: string;
  address: string;
  notes: string;
  email: string;
  screenshot?: FileList;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, jwt } = useAuth();

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  // Use React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IFormInput>({
    defaultValues: {
      fullName: "",
      phone: "",
      address: "",
      notes: "",
      email: "",
    },
  });

  // 1) Load cart from localStorage on mount
  useEffect(() => {
    const cartInStorage = localStorage.getItem("cart");
    if (cartInStorage) {
      const parsedCart = JSON.parse(cartInStorage);
      setCartItems(parsedCart);

      const total = parsedCart.reduce(
        (acc: number, item: any) => acc + item.price * item.quantity,
        0
      );
      setTotalPrice(total);
    }
  }, []);

  // 2) If user is logged in, fetch user data from Strapi to pre-fill shipping info.
  useEffect(() => {
    if (!jwt || !user) return;

    const fetchUserData = async () => {
      try {
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

        const userData = await res.json();
        // Pre-fill the form
        reset({
          fullName: userData.fullName || "",
          phone: userData.phone || "",
          address: userData.address || "",
          notes: "",
          email: userData.email || "",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [jwt, user, reset]);

  // 3) Handle Form Submit => Create Order in Strapi
  const onSubmit = async (formData: IFormInput) => {
    try {
      const generatedUUID = nanoid();

      // Step 1: Upload screenshot if provided
      let uploadedScreenshotId = null;
      if (formData.screenshot && formData.screenshot[0]) {
        const screenshotFormData = new FormData();
        screenshotFormData.append("files", formData.screenshot[0]);

        const screenshotRes = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/upload`,
          {
            method: "POST",
            body: screenshotFormData,
          }
        );
        console.log(screenshotRes)
        if (!screenshotRes.ok) {
          throw new Error("Failed to upload screenshot");
        }

        const screenshotResult = await screenshotRes.json();
        uploadedScreenshotId = screenshotResult[0]?.id;
      }

      // Step 2: Build Order data (including user.id if logged in)
      const orderData = {
        username: user?.username || "guest", // optional reference
        user: user?.id,                     // link to user in Strapi
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        notes: formData.notes,
        email: formData.email,
        uuid: generatedUUID,
        orderStatus: "pending",
        totalPrice,
        items: cartItems,
        screenshot: uploadedScreenshotId,
      };

      // Step 3: Create the order via Strapi
      const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`, // if your order endpoint requires auth
        },
        body: JSON.stringify({ data: orderData }),
      });

      if (!res.ok) {
        throw new Error(`Failed to create order: ${res.statusText}`);
      }

      // Step 4: Clear the cart + redirect
      localStorage.removeItem("cart");
      router.push(`/checkout/complete?orderId=${generatedUUID}`);
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("There was a problem placing your order. Please try again.");
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
       <div className="bg-gray-100 p-2 my-4">
          <p>
            <strong>Total Items:</strong> {cartItems.length}
          </p>
          <p>
            <strong>Total Price:</strong> {totalPrice} BAHT
          </p>
        </div>
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      {user && (
        <p className="mb-4">
          <strong>User:</strong> {user.username}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Full Name */}
        <div className="mb-3">
          <label>Full Name:</label>
          <input
            type="text"
            className="border w-full p-2"
            {...register("fullName", { required: "Full Name is required" })}
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm">{errors.fullName.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="mb-3">
          <label>Phone:</label>
          <input
            type="text"
            className="border w-full p-2"
            {...register("phone", {
              required: "Phone number is required",
              minLength: {
                value: 10,
                message: "Phone number must be 10 digits",
              },
              maxLength: {
                value: 10,
                message: "Phone number must be 10 digits",
              },
            })}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm">{errors.phone.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="mb-3">
          <label>Email:</label>
          <input
            type="email"
            className="border w-full p-2"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email address",
              },
            })}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        {/* Address */}
        <div className="mb-3">
          <label>Address:</label>
          <input
            type="text"
            className="border w-full p-2"
            {...register("address", { required: "Address is required" })}
          />
          {errors.address && (
            <p className="text-red-500 text-sm">{errors.address.message}</p>
          )}
        </div>

        {/* Notes */}
        <div className="mb-3">
          <label>Notes (optional):</label>
          <textarea className="border w-full p-2" {...register("notes")} />
        </div>
          <Image src={'/qr.png'} alt="qr" width={300} height={300}/>
        {/* Screenshot */}
        <div className="mb-3">
          <label>Upload Screenshot (optional):</label>
          <input type="file" accept="image/*" {...register("screenshot")} />
        </div>

        {/* Cart Summary */}
       

        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          Confirm
        </button>
      </form>
    </div>
  );
}
