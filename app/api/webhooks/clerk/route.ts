import { headers } from "next/headers";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma/client";

type ClerkUserPayload = {
  id: string;
  email_addresses: { email_address: string }[];
  first_name: string | null;
  last_name: string | null;
};

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) return new Response("Missing webhook secret", { status: 500 });

  const headersList = await headers();
  const svixId = headersList.get("svix-id");
  const svixTimestamp = headersList.get("svix-timestamp");
  const svixSignature = headersList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const body = await req.text();

  let event: { type: string; data: ClerkUserPayload };
  try {
    const wh = new Webhook(secret);
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as typeof event;
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const { type, data } = event;
  const email = data.email_addresses[0]?.email_address ?? "";
  const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || null;

  try {
    if (type === "user.created") {
      await prisma.user.upsert({
        where: { clerkId: data.id },
        create: { clerkId: data.id, email, name },
        update: {},
      });
    } else if (type === "user.updated") {
      await prisma.user.update({
        where: { clerkId: data.id },
        data: { email, name },
      });
    }

    return new Response("OK", { status: 200 });
  } catch {
    return new Response("Database error", { status: 500 });
  }
}
