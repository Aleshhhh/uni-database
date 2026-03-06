import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const dataDir = path.join(process.cwd(), "data");

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path: segments } = await params;
        const resolved = path.join(dataDir, ...segments.map(decodeURIComponent));

        if (!resolved.startsWith(dataDir)) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const buf = await fs.readFile(resolved);
        return new NextResponse(buf, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": "inline",
            },
        });
    } catch {
        return new NextResponse("Not Found", { status: 404 });
    }
}
