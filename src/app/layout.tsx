import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getCourses } from "@/lib/data";
import { Sidebar } from "@/components/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Uni Portal",
    description: "Manage and view university course materials",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const courses = await getCourses();

    return (
        <html lang="en" className="dark">
            <body className={`${inter.className} flex h-screen bg-background text-foreground antialiased overflow-hidden`}>
                <Sidebar courses={courses} />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </body>
        </html>
    );
}
