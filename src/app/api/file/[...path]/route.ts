import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path: filePathParams } = await params;

        // Resolve safe path
        const dataDir = path.join(process.cwd(), "data");
        const requestedPath = path.join(dataDir, ...filePathParams);

        // Ensure the path does not escape the data directory (security check)
        if (!requestedPath.startsWith(dataDir)) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const fileBuffer = await fs.readFile(requestedPath);
        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": "inline", // view in browser
            },
        });
    } catch (error) {
        console.error("Error reading file:", error);
        return new NextResponse("Not Found", { status: 404 });
    }
}
