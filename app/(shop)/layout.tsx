import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomTabBar from "@/components/layout/BottomTabBar";
import { QueryProvider } from "@/lib/hooks/QueryProvider";
import { Toaster } from "@/components/ui/sonner";
import { syncUser } from "@/lib/user/sync";

export default async function ShopLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    await syncUser();
    return (
        <QueryProvider>
            <div className="flex min-h-screen flex-col">
                <Suspense fallback={null}>
                    <Navbar />
                </Suspense>
                <div id="skip-content" tabIndex={-1} className="outline-none" />
                <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-8 pb-24 lg:px-8 lg:pb-8">
                    {children}
                </div>
                <div className="pb-16 lg:pb-0">
                    <Footer />
                </div>
                <BottomTabBar />
            </div>
            <Toaster />
        </QueryProvider>
    );
}
