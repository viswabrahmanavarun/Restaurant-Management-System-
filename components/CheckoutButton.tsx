"use client";
import { useEffect } from "react";

export default function CheckoutButton({
  totalAmount,
  customerName,
  customerPhone,
  paymentMethod,
  onOrderPlaced
}: any) {

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handlePlaceOrder = async () => {
    if (!customerName || !customerPhone) {
      alert("Enter Name & Phone Number");
      return;
    }

    // COD → no payment gateway
    if (paymentMethod === "COD") {
      onOrderPlaced({
        name: customerName,
        phone: customerPhone,
        amount: totalAmount,
        paymentStatus: "Pending (COD)",
      });
      alert("Order placed with Cash on Delivery!");
      return;
    }

    // Create Razorpay order
    const res = await fetch("/api/create-order", {
      method: "POST",
      body: JSON.stringify({ amount: totalAmount }),
    });

    const data = await res.json();

    if (!data.orderId) {
      alert("Error creating Razorpay order");
      return;
    }

    const options = {
      key: "rzp_test_RJTIkfZuG26cqc",
      order_id: data.orderId,
      amount: totalAmount * 100,
      currency: "INR",
      name: "Your Restaurant",
      description: "Food Order Payment",
      prefill: {
        name: customerName,
        contact: customerPhone,
      },
      handler: function (response: any) {
        alert("Payment Successful!");

        onOrderPlaced({
          name: customerName,
          phone: customerPhone,
          amount: totalAmount,
          paymentId: response.razorpay_payment_id,
          paymentStatus: "Paid",
        });
      },
      theme: { color: "#F37254" },
    };

    // @ts-ignore
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <button
      onClick={handlePlaceOrder}
      className="w-full bg-orange-500 text-white p-3 rounded-lg mt-4"
    >
      Place Order
    </button>
  );
}
