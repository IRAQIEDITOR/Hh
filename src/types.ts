export interface ReceiptItem {
  id: string;
  index: number; // 1 to 10 representation
  details: string;
  quantity: number | "";
  price: number | "";
  total: number;
}

export interface ReceiptData {
  clientName: string;
  clientPhone: string; // WhatsApp number
  date: string;
  notes: string;
  items: ReceiptItem[];
  totalAmount: number;
}

export interface ServicePreset {
  name: string;
  defaultPrice?: number;
  category: "copy" | "print" | "bind" | "other";
}
