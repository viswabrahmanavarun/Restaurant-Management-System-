"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, Download } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type InvoiceItem = {
  itemName: string;
  quantity: number;
  price: number;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  customerName: string;
  tableNumber: string;
  modeOfPayment: string;
  subTotal: number;
  tax: number;
  serviceCharge: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  orderStatus?: string;
  items: InvoiceItem[];
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [modeOfPayment, setModeOfPayment] = useState("Cash");
  const [subTotal, setSubTotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [serviceCharge, setServiceCharge] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [items, setItems] = useState<InvoiceItem[]>([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [items, tax, serviceCharge]);

  // =============================
  // Fetch all invoices
  // =============================
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/invoices");
      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      console.error("❌ Error fetching invoices:", err);
      toast({ title: "Error", description: "Failed to fetch invoices" });
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // Add / Modify Items
  // =============================
  const handleAddItem = () => {
    setItems([...items, { itemName: "", quantity: 1, price: 0 }]);
  };

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const updatedItems = [...items];
    updatedItems[index][field] =
      field === "itemName" ? (value as string) : Number(value);
    setItems(updatedItems);
  };

  // =============================
  // Calculate Totals
  // =============================
  const calculateTotals = () => {
    const subTotalCalc = items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
    setSubTotal(subTotalCalc);
    const total = subTotalCalc + Number(tax) + Number(serviceCharge);
    setTotalAmount(total);
  };

  // =============================
  // Create New Invoice
  // =============================
  const handleCreateInvoice = async () => {
    if (!customerName.trim()) {
      toast({ title: "Customer name required" });
      return;
    }

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          tableNumber,
          modeOfPayment,
          subTotal,
          tax,
          serviceCharge,
          totalAmount,
          items,
        }),
      });

      if (!res.ok) throw new Error("Failed to create invoice");
      toast({ title: "✅ Invoice created successfully" });

      setOpen(false);
      setCustomerName("");
      setTableNumber("");
      setModeOfPayment("Cash");
      setSubTotal(0);
      setTax(0);
      setServiceCharge(0);
      setTotalAmount(0);
      setItems([]);
      fetchInvoices();
    } catch (error) {
      console.error("❌ Error creating invoice:", error);
      toast({ title: "Error", description: "Failed to create invoice" });
    }
  };

  // =============================
  // Download PDF for Invoice
  // =============================
  const handleDownloadPDF = async (invoice: Invoice) => {
    const doc = new jsPDF();

    // === 🏪 Header with Logo ===
    const logoUrl = "/logo.png"; // Put your logo inside public/logo.png or use an external URL
    const imgWidth = 25;
    const imgHeight = 25;
    const startX = 14;
    const startY = 10;

    try {
      const img = new Image();
      img.src = logoUrl;

      await new Promise<void>((resolve) => {
        img.onload = () => {
          doc.addImage(img, "PNG", startX, startY, imgWidth, imgHeight);
          resolve();
        };
        img.onerror = () => resolve();
      });
    } catch (error) {
      console.warn("⚠️ Logo could not be loaded:", error);
    }

    // === 🧾 Restaurant Header ===
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text("Bella Vista", 45, 18);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text("Delicious food, delightful experience", 45, 25);

    // Separator line
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 35, 195, 35);

    // === 📄 Invoice Details ===
    doc.setFontSize(12);
    doc.setTextColor(0);
    let y = 45;
    doc.text(`Invoice No: ${invoice.invoiceNumber}`, 14, y);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleString()}`, 140, y);

    y += 8;
    doc.text(`Customer Name: ${invoice.customerName}`, 14, y);
    y += 8;
    doc.text(`Table Number: ${invoice.tableNumber}`, 14, y);
    y += 8;
    doc.text(`Mode of Payment: ${invoice.modeOfPayment}`, 14, y);

    // === 🍽️ Items Table ===
    const tableData = invoice.items.map((item) => [
      item.itemName,
      item.quantity,
      `₹${item.price.toFixed(2)}`,
      `₹${(item.quantity * item.price).toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: y + 10,
      head: [["Item", "Qty", "Price", "Total"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [41, 128, 185] },
    });

    const finalY = (doc as any).lastAutoTable.finalY || y + 30;

    // === 💰 Totals Section ===
    doc.setFontSize(12);
    doc.text(`Subtotal: ₹${invoice.subTotal.toFixed(2)}`, 140, finalY + 10);
    doc.text(`Tax: ₹${invoice.tax.toFixed(2)}`, 140, finalY + 17);
    doc.text(`Service Charge: ₹${invoice.serviceCharge.toFixed(2)}`, 140, finalY + 24);
    doc.setFontSize(13);
    doc.text(`Total: ₹${invoice.totalAmount.toFixed(2)}`, 140, finalY + 33);

    // === 📌 Footer ===
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(
      "Thank you for dining with us! Visit again soon.",
      14,
      finalY + 50
    );

    // Save the PDF
    doc.save(`${invoice.invoiceNumber}.pdf`);
  };

  // =============================
  // Render UI
  // =============================
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-semibold">Invoices</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4">
              {/* Customer Details */}
              <div>
                <Label>Customer Name</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              <div>
                <Label>Table Number</Label>
                <Input
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                />
              </div>

              <div>
                <Label>Mode of Payment</Label>
                <select
                  className="w-full border p-2 rounded-md"
                  value={modeOfPayment}
                  onChange={(e) => setModeOfPayment(e.target.value)}
                >
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>CreditCard</option>
                  <option>DebitCard</option>
                  <option>NetBanking</option>
                </select>
              </div>

              {/* Menu Items */}
              <div>
                <Label>Menu Items</Label>
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-2 items-center mb-2 border p-2 rounded-md"
                  >
                    <Input
                      placeholder="Item name"
                      value={item.itemName}
                      onChange={(e) =>
                        handleItemChange(index, "itemName", e.target.value)
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, "quantity", e.target.value)
                      }
                      className="w-20"
                    />
                    <Input
                      type="number"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) =>
                        handleItemChange(index, "price", e.target.value)
                      }
                      className="w-28"
                    />
                  </div>
                ))}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleAddItem}
                  className="mt-2"
                >
                  + Add Item
                </Button>
              </div>

              {/* Totals */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <Label>Sub Total</Label>
                  <Input value={subTotal.toFixed(2)} readOnly />
                </div>
                <div>
                  <Label>Tax</Label>
                  <Input
                    type="number"
                    value={tax}
                    onChange={(e) => setTax(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Service Charge</Label>
                  <Input
                    type="number"
                    value={serviceCharge}
                    onChange={(e) =>
                      setServiceCharge(Number(e.target.value))
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Total Amount</Label>
                <Input value={totalAmount.toFixed(2)} readOnly />
              </div>

              <Button onClick={handleCreateInvoice} className="mt-4">
                Create Invoice
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Invoices Display */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {invoices.map((invoice) => (
            <Card key={invoice.id}>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>{invoice.invoiceNumber}</CardTitle>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    invoice.orderStatus === "COMPLETED"
                      ? "bg-green-100 text-green-700"
                      : invoice.orderStatus === "PENDING"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {invoice.orderStatus}
                </span>
              </CardHeader>

              <CardContent>
                <p><strong>Customer:</strong> {invoice.customerName}</p>
                <p><strong>Table:</strong> {invoice.tableNumber}</p>
                <p><strong>Mode:</strong> {invoice.modeOfPayment}</p>
                <p><strong>Sub Total:</strong> ₹{invoice.subTotal}</p>
                <p><strong>Tax:</strong> ₹{invoice.tax}</p>
                <p><strong>Service Charge:</strong> ₹{invoice.serviceCharge}</p>
                <p><strong>Total:</strong> ₹{invoice.totalAmount}</p>

                {invoice.items?.length > 0 && (
                  <div className="mt-3">
                    <strong>Items:</strong>
                    <ul className="list-disc ml-6">
                      {invoice.items.map((item, idx) => (
                        <li key={idx}>
                          {item.itemName} — {item.quantity} × ₹{item.price}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-xs text-gray-400 mt-2">
                  {new Date(invoice.createdAt).toLocaleString()}
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadPDF(invoice)}
                  className="mt-3"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
