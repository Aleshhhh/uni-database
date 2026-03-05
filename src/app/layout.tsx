import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getCourses, getCourseContent } from "@/lib/data";
import { Sidebar } from "@/components/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "University Portal",
  description: "Manage and view university course materials",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read all courses to generate the navigation
  const courseNames = await getCourses();

  // Fetch contents for each course
  const coursesData = await Promise.all(
    courseNames.map(async (name) => {
      const content = await getCourseContent(name);
      return { name, content };
    })
  );

  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} flex h-screen bg-background text-foreground antialiased`}>
        <Sidebar courses={coursesData} />
        <main className="flex-1 overflow-y-auto w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
