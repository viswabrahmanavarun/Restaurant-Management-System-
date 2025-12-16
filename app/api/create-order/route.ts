import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    const razorpay = new Razorpay({
      key_id: "rzp_test_RJTIkfZuG26cqc",
      key_secret: "fgvlUYolOLsYixkYm1SgCiO7",
    });

    const options = {
      amount: amount * 100, // INR → paise
      currency: "INR",
      receipt: "receipt_order_001",
    };

    const order = await razorpay.orders.create(options);

    return Response.json({ orderId: order.id });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Razorpay order creation failed" });
  }
}
