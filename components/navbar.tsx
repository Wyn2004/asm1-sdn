import Link from "next/link";
import { ShoppingBag, Settings, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import app from "next/app";
import { UserButton } from "@stackframe/stack";
import { stackServerApp } from "@/stack";

export async function Navbar() {
  const user = await stackServerApp.getUser();
  const app = stackServerApp.urls;
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

                <UserButton />
              </>
            ) : (
              <>
                {/*Sign Button*/}
                <Button
                  variant="ghost"
                  className="flex items-center gap-2"
                  asChild
                >
                  <Link href={app.signIn}>
                    <LogIn className="w-4 h-4" />
                    <span className="hidden lg:inline">Sign In</span>
                  </Link>
                </Button>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
