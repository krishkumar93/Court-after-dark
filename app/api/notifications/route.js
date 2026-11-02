import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const session = getSessionUser(request);
  if (!session) {
    return NextResponse.json({ notifications: [] });
  }

  try {
    await connectDB();
    const notifications = await Notification.find({ userId: session.id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({ userId: session.id, isRead: false });

    return NextResponse.json({ notifications, unreadCount });
  } catch (err) {
    console.error("GET /api/notifications error:", err);
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }
}

export async function PUT(request) {
  const session = getSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json().catch(() => ({}));
    if (body.id) {
      await Notification.findOneAndUpdate({ _id: body.id, userId: session.id }, { isRead: true });
    } else {
      // Mark all read
      await Notification.updateMany({ userId: session.id, isRead: false }, { isRead: true });
    }

    return NextResponse.json({ message: "Notifications updated." });
  } catch (err) {
    console.error("PUT /api/notifications error:", err);
    return NextResponse.json({ error: "Failed to update notifications." }, { status: 500 });
  }
}

