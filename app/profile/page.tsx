"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAuth } from "@/app/providers/AuthContext";

type ProfileFormValues = {
  username: string;
  phone: string;
  address: string;
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export default function ProfilePage() {
  console.log("profile is runned");
  const router = useRouter();
  const { user, jwt, loading, logout, updateUser } = useAuth();

  console.log(user);

  // 1) Always call your hooks unconditionally
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      username: user?.username || "",
      phone: user?.phone || "",
      address: user?.address || "",
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  // 2) Use an effect to redirect only if not loading AND no user
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [loading, user, router]);

  // 3) Re-sync fields if user changes
  useEffect(() => {
    if (user) {
      setValue("username", user.username || "");
      setValue("phone", user.phone || "");
      setValue("address", user.address || "");
    }
  }, [user, setValue]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      if (!user) throw new Error("User is null (still loading?).");
      const userId = user.id;
      if (!userId) throw new Error("User ID not found.");

      let passwordPayload = {};
      if (data.oldPassword || data.newPassword || data.confirmNewPassword) {
        if (data.newPassword !== data.confirmNewPassword) {
          throw new Error("New passwords do not match");
        }
        passwordPayload = {
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
        };
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({
            username: data.username,
            phone: data.phone,
            address: data.address,
            ...passwordPayload,
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(
          errData.error?.message || "Failed to update user profile"
        );
      }

      // 4) Re-fetch the updated user data from Strapi to update context
      await updateUser();

      alert("Profile updated successfully!");
      router.push("/");
    } catch (error: any) {
      alert(error.message);
      console.error(error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Render logic
  if (loading) {
    // We are still checking localStorage or finishing auth => show spinner
    return <p>Loading user data...</p>;
  }

  // If loading is done, but user is null => the effect above triggered a redirect
  // but we can just return nothing to avoid another render
  if (!user) {
    return null;
  }

  // Otherwise, show the profile form
  return (
    <div className="flex flex-col items-center pt-12 text-sm">
      <h1 className="text-lg mb-6">Edit Your Profile</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-2 w-64"
      >
        {/* Username */}
        <div>
          <label htmlFor="username" className="block mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            className="border p-2 w-full"
            {...register("username", { required: "Username is required" })}
          />
          {errors.username && (
            <p className="text-red-500 text-sm">{errors.username.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block mb-1">
            Phone
          </label>
          <input
            id="phone"
            type="text"
            className="border p-2 w-full"
            {...register("phone", {
              required: "Phone number is required",
              pattern: {
                value: /^\d{10}$/,
                message: "Phone number must be exactly 10 digits",
              },
            })}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="address" className="block mb-1">
            Address
          </label>
          <input
            id="address"
            type="text"
            className="border p-2 w-full"
            {...register("address", { required: "Address is required" })}
          />
          {errors.address && (
            <p className="text-red-500 text-sm">{errors.address.message}</p>
          )}
        </div>

        <hr className="my-4" />
{/*         
        <p className="font-medium">Change Password (optional)</p>

        <div>
          <label htmlFor="oldPassword" className="block mb-1">
            Old Password
          </label>
          <input
            id="oldPassword"
            type="password"
            className="border p-2 w-full"
            {...register("oldPassword")}
          />
          {errors.oldPassword && (
            <p className="text-red-500 text-sm">{errors.oldPassword.message}</p>
          )}
        </div>

        New Password
        <div>
          <label htmlFor="newPassword" className="block mb-1">
            New Password
          </label>
          <input
            id="newPassword"
            type="password"
            className="border p-2 w-full"
            {...register("newPassword")}
          />
          {errors.newPassword && (
            <p className="text-red-500 text-sm">{errors.newPassword.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmNewPassword" className="block mb-1">
            Confirm New Password
          </label>
          <input
            id="confirmNewPassword"
            type="password"
            className="border p-2 w-full"
            {...register("confirmNewPassword")}
          />
          {errors.confirmNewPassword && (
            <p className="text-red-500 text-sm">
              {errors.confirmNewPassword.message}
            </p>
          )}
        </div> */}

        <button type="submit" className="bg-primary-red text-white py-2 mt-4">
          Save
        </button>
      </form>

      {/* Logout Button */}
      <button onClick={handleLogout} className="mt-6 underline text-primary-red">
        Logout
      </button>
    </div>
  );
}
