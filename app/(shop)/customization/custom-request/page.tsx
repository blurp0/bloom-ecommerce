import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma/client";
import { CustomRequestForm } from "@/features/customization/components";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/date";

export const metadata: Metadata = {
  title: "Custom Request | Bloom & Bind",
};

export default async function CustomRequestPage() {
  const session = await auth();
  const clerkUserId = session?.userId;

  let requests: Array<{
    id: string;
    status: "PENDING" | "PROPOSED" | "APPROVED" | "REJECTED";
    createdAt: Date;
  }> = [];

  if (clerkUserId) {
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });

    if (user) {
      requests = await prisma.customRequest.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: { id: true, status: true, createdAt: true },
      });
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="mb-6 space-y-3">
        <h1 className="text-2xl font-semibold">My Requests</h1>

        {requests.length === 0 ? (
          <Card className="border-interactive/60 p-4 text-sm text-muted-foreground">
            No requests yet. Submit the form below to create your first request.
          </Card>
        ) : (
          <div className="space-y-2">
            {requests.map((r) => (
              <Link
                key={r.id}
                href={`/customization/custom-request/${r.id}`}
                className="block"
              >
                <Card className="border-interactive/60 p-4 transition-colors hover:bg-muted/30">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate font-medium">Request #{r.id}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {formatDate(r.createdAt)}
                      </div>
                    </div>

                    {(() => {
                      const variant =
                        r.status === "REJECTED"
                          ? "destructive"
                          : r.status === "APPROVED"
                            ? "default"
                            : "outline";

                      return (
                        <Badge variant={variant} key={`badge-${r.id}`}>
                          {r.status}
                        </Badge>
                      );
                    })()}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <CustomRequestForm />
    </div>
  );
}
