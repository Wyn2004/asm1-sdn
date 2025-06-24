import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOption } from "../../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// POST - Process payment (simulate payment)
export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOption);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = params;
    const { paymentMethod = "credit_card" } = await request.json();

    // Verify order belongs to user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: "Order is not in pending status" },
        { status: 400 }
      );
    }

    // Simulate payment processing
    // In a real application, you would integrate with a payment provider here
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate processing time

    // Simulate payment success (95% success rate for demo)
    const paymentSuccess = Math.random() > 0.05;

    if (!paymentSuccess) {
      return NextResponse.json(
        { error: "Payment failed. Please try again." },
        { status: 400 }
      );
    }

    // Update order status to PAID
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        updatedAt: new Date(),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      paymentMethod,
      transactionId: `txn_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
