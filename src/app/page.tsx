import { Book } from "lucide-react";

export default function HomePage() {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Book className="w-8 h-8 text-primary" />
            </div>
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">University Portal</h1>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                    Select a file from the sidebar to view it, or create a new course with the <strong>+</strong> button.
                </p>
            </div>
        </div>
    );
}
