import { getCourses } from "@/lib/data";
import { WorkspaceDashboard } from "@/components/workspace-dashboard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
    const courses = await getCourses();
    return <WorkspaceDashboard courses={courses} />;
}
