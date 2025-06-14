"use client";
import Link from "next/link";
import { ShoppingBag, Settings, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  console.log(session);

  const handleLogin = () => {
    router.push("/auth");
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6" />
            <span className="text-xl font-bold">Fashion Store</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost">Home</Button>
            </Link>

            {user ? (
              <>
                <Link href="/admin">
                  <Button variant="ghost">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>

                {/* User Avatar hoặc Tên */}
                {user.image ? (
                  <Image
                    src={user.image}
                    alt="avatar"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <span className="font-medium">{user.name}</span>
                )}

                <Button
                  variant="ghost"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                className="flex items-center gap-2"
                onClick={handleLogin}
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden lg:inline">Sign In</span>
              </Button>
            )}

            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
