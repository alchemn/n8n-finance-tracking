import crypto from "crypto"

interface MidtransConfig {
  serverKey: string
  clientKey: string
  isProduction: boolean
}

interface PaymentRequest {
  orderId: string
  grossAmount: number
  customerDetails: {
    firstName: string
    lastName?: string
    email: string
    phone?: string
  }
  itemDetails: Array<{
    id: string
    price: number
    quantity: number
    name: string
  }>
}

interface PaymentResponse {
  token: string
  redirectUrl: string
}

class MidtransClient {
  private config: MidtransConfig
  private snapBaseUrl: string

  constructor() {
    this.config = {
      serverKey: process.env.MIDTRANS_SERVER_KEY || "",
      clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    }

    this.snapBaseUrl = this.config.isProduction ? "https://app.midtrans.com/snap/v1" : "https://app.sandbox.midtrans.com/snap/v1"

    if (!this.config.serverKey || !this.config.clientKey) {
      throw new Error("Midtrans configuration is missing. Please check your environment variables.")
    }
  }

  private getAuthHeader(): string {
    const auth = Buffer.from(`${this.config.serverKey}:`).toString("base64")
    return `Basic ${auth}`
  }

  async createPaymentToken(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      const payload = {
        transaction_details: {
          order_id: paymentRequest.orderId,
          gross_amount: paymentRequest.grossAmount,
        },
        customer_details: {
          first_name: paymentRequest.customerDetails.firstName,
          last_name: paymentRequest.customerDetails.lastName || "",
          email: paymentRequest.customerDetails.email,
          phone: paymentRequest.customerDetails.phone || "",
        },
        item_details: paymentRequest.itemDetails,
        callbacks: {
          finish: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/upgrade/success`,
        },
      }

      const response = await fetch(`${this.snapBaseUrl}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": this.getAuthHeader(),
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Midtrans API error: ${JSON.stringify(errorData.error_messages) || "Unknown error"}`)
      }

      const data = await response.json()

      return {
        token: data.token,
        redirectUrl: data.redirect_url,
      }
    } catch (error) {
      console.error("Error creating payment token:", error)
      throw error
    }
  }

  verifySignature(notificationPayload: any): boolean {
    const { order_id, status_code, gross_amount, signature_key } = notificationPayload;
    const serverKey = this.config.serverKey;
    const input = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const hash = crypto.createHash("sha512").update(input).digest("hex");
    return hash === signature_key;
  }

  getSnapUrl(): string {
    return this.config.isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js"
  }

  getClientKey(): string {
    return this.config.clientKey
  }
}

export const midtransClient = new MidtransClient()