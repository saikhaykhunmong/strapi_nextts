"use client";
import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { debounce } from "lodash";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthContext";

type RegisterFormValues = {
  email: string;
  username: string;
  password: string;
};

export default function RegisterPage() {
  const { user, loading, registerUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/profile");
    }
  }, [user, loading, router]);

  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDebounced, setIsDebounced] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>();

  const handleRegister = async (data: RegisterFormValues) => {
    try {
      setServerError(null);
      setIsSubmitting(true);

      await registerUser(data.email, data.username, data.password);
      // If register is successful, go to /profile
      router.push("/profile");
    } catch (err: any) {
      setServerError(err.message);
    } finally {
      setIsSubmitting(false);
      setIsDebounced(false);
    }
  };

  const debouncedHandleRegister = useCallback(
    debounce((data: RegisterFormValues) => {
      handleRegister(data);
    }, 1000),
    []
  );

  const onSubmit = (data: RegisterFormValues) => {
    setIsDebounced(true);
    debouncedHandleRegister(data);
  };

  const isButtonDisabled = isSubmitting || isDebounced;

  // If still loading, show a spinner
  if (loading) {
    return <p>Loading user data...</p>;
  }

  // If user is already logged in, we return null or a loader
  if (user) {
    return null;
  }

  return (
    <div className="flex flex-col items-center pt-12">
      <h1 className="text-2xl mb-2">Welcome to Our Store!</h1>
      <p className="mb-6 text-gray-700">Let’s get you set up with a new account.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-64">
        <div>
          <label htmlFor="email" className="block mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="border p-2 w-full"
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

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

        <div>
          <label htmlFor="password" className="block mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="border p-2 w-full"
            {...register("password", { required: "Password is required" })}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>

        {serverError && <p className="text-red-600 text-sm">{serverError}</p>}

        <button
          type="submit"
          disabled={isButtonDisabled}
          className={`py-2 text-white ${
            isButtonDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-primary-red"
          }`}
        >
          {isSubmitting ? "Registering..." : "Register"}
        </button>
      </form>

      {/* Link to login */}
      <p className="mt-4 text-gray-700">
        Already have an account?{" "}
        <span
          onClick={() => router.push("/auth/login")}
          className="underline text-primary-red cursor-pointer"
        >
          Login here
        </span>
      </p>
    </div>
  );
}
