// file: /app/api/pay/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { amount, student_id, description } = body;

  // Clean student ID (UUIDs are long, so just slice a bit)
  const studentChunk = student_id?.slice(0, 6) || "std";
  const timestamp = Date.now();
  const rawReceipt = `rcpt_${studentChunk}_${timestamp}`;

  // Ensure max length 40
  const receipt = rawReceipt.slice(0, 40);

  const order = await razorpay.orders.create({
    amount: amount * 100, // amount in paisa
    currency: 'INR',
    receipt,
    payment_capture: true, // Fixed to boolean
  });

  return NextResponse.json({
    order,
    student_id,
    description,
  });
}
