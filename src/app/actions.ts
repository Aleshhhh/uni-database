"use server";

import { revalidatePath } from "next/cache";

export async function syncDataDir() {
    revalidatePath("/", "layout");
}
