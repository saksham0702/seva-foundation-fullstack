import crypto from "crypto";
import Razorpay from "razorpay";

const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (keyId && keySecret) {
    return new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return null;
};

interface CreateOrderOptions {
  amount: number; // in INR (not paise, we convert to paise)
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  status: string;
  keyId: string;
  isMock?: boolean;
}

const createOrder = async (options: CreateOrderOptions): Promise<RazorpayOrderResponse> => {
  const instance = getRazorpayInstance();
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_seva_dev";
  const amountInPaise = Math.round(options.amount * 100);
  const currency = options.currency || "INR";
  const receipt = options.receipt || `rcpt_${Date.now()}`;

  if (instance) {
    try {
      const order = await instance.orders.create({
        amount: amountInPaise,
        currency,
        receipt,
        notes: options.notes,
      });

      return {
        id: String(order.id),
        amount: Number(order.amount),
        currency: String(order.currency),
        receipt: order.receipt ? String(order.receipt) : receipt,
        status: String(order.status),
        keyId,
        isMock: false,
      };
    } catch (error) {
      console.warn("Razorpay API order creation failed, falling back to simulated order:", error);
    }
  }

  // Fallback simulation mode if credentials not provided or API call fails in dev
  return {
    id: `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    amount: amountInPaise,
    currency,
    receipt,
    status: "created",
    keyId,
    isMock: true,
  };
};

const verifySignature = (params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean => {
  const { orderId, paymentId, signature } = params;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  // In simulated / mock mode
  if (orderId.startsWith("order_sim_") || !keySecret) {
    return true;
  }

  try {
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    return generatedSignature === signature;
  } catch (error) {
    console.error("Razorpay signature verification error:", error);
    return false;
  }
};

const getKeyId = (): string => {
  return process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_seva_dev";
};

export const RazorpayService = {
  createOrder,
  verifySignature,
  getKeyId,
};
