import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomTabBar from "@/components/layout/BottomTabBar";

export default function ShopLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <div id="skip-content" />
            <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-8 pb-24 lg:px-8 lg:pb-8">
                {children}
            </div>
            <Footer />
            <BottomTabBar />
        </div>
    );
}
