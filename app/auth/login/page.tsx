"use client";
import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { debounce } from "lodash";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthContext";

type LoginFormValues = {
  identifier: string;
  password: string;
};

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDebounced, setIsDebounced] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>();

  const handleLogin = async (values: LoginFormValues) => {
    try {
      setServerError(null);
      setIsSubmitting(true);
      await login(values.identifier, values.password);
      // If login successful, go to home or profile or wherever
      router.push("/");
    } catch (err: any) {
      setServerError(err.message);
    } finally {
      setIsSubmitting(false);
      setIsDebounced(false);
    }
  };

  const debouncedHandleLogin = useCallback(
    debounce((values: LoginFormValues) => {
      handleLogin(values);
    }, 1000),
    []
  );

  const onSubmit = (values: LoginFormValues) => {
    setIsDebounced(true);
    debouncedHandleLogin(values);
  };

  const isButtonDisabled = isSubmitting || isDebounced;

  if (loading) {
    return <p>Loading user data...</p>;
  }

  if (user) {
    return null;
  }

  return (
    <div className="flex flex-col items-center pt-12">
      <h1 className="text-2xl mb-2">Login & Start Ordering!</h1>
      <p className="mb-6 text-gray-700">Enter your credentials below.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-64">
        <div>
          <label htmlFor="identifier" className="block mb-1">
            Email / Username
          </label>
          <input
            id="identifier"
            type="text"
            className="border p-2 w-full"
            {...register("identifier", { required: true })}
          />
          {errors.identifier && <p className="text-red-500 text-sm">Identifier is required</p>}
        </div>

        <div>
          <label htmlFor="password" className="block mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="border p-2 w-full"
            {...register("password", { required: true })}
          />
          {errors.password && <p className="text-red-500 text-sm">Password is required</p>}
        </div>

        {serverError && <p className="text-red-600 text-sm">{serverError}</p>}

        <button
          type="submit"
          disabled={isButtonDisabled}
          className={`py-2 text-white ${
            isButtonDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-primary-red"
          }`}
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>

      {/* Link to register */}
      <p className="mt-4 text-gray-700">
        Don’t have an account yet?{" "}
        <span
          onClick={() => router.push("/auth/register")}
          className="underline text-primary-red cursor-pointer"
        >
          Register here
        </span>
      </p>
    </div>
  );
}
