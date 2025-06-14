"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { LogIn, UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isLogin) {
      // Đăng nhập
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl: "/",
      });

      if (res?.error) {
        setError("Sai email hoặc mật khẩu.");
      } else {
        router.push("/");
      }
    } else {
      // Đăng ký
      try {
        const res = await fetch("/api/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        if (res.ok) {
          await signIn("credentials", {
            redirect: false,
            email,
            password,
            callbackUrl: "/",
          });
          router.push("/");
        } else {
          const data = await res.json();
          setError(data.message || "Đăng ký thất bại.");
        }
      } catch (err) {
        setError("Đăng ký thất bại.");
      }
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/" });
  };

  const handleChangeAuth = () => {
    setIsLogin(!isLogin);
    setError("");
    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-white">
          {isLogin ? "Đăng nhập vào tài khoản" : "Tạo tài khoản mới"}
        </h2>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <form onSubmit={handleCredentialSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Tên người dùng
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Mật khẩu
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isLogin ? (
              <>
                <LogIn className="w-5 h-5" />
                Đăng nhập
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Đăng ký
              </>
            )}
          </Button>
        </form>

        <div className="flex items-center gap-2 my-4">
          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
          <span className="text-sm text-gray-500 dark:text-gray-400">hoặc</span>
          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
        </div>

        <Button
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-2"
        >
          {googleLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <FcGoogle className="w-5 h-5" />
              Đăng nhập với Google
            </>
          )}
        </Button>

        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-4">
          {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
          <button
            type="button"
            onClick={handleChangeAuth}
            className="text-blue-500 hover:underline"
          >
            {isLogin ? "Đăng ký" : "Đăng nhập"}
          </button>
        </p>
      </div>
    </div>
  );
}
