import React, { useState, useEffect } from "react";
import { ReceiptData, ReceiptItem } from "./types";
import ReceiptForm from "./components/ReceiptForm";
import ReceiptPreview from "./components/ReceiptPreview";
import { motion, AnimatePresence } from "motion/react";

// Initial empty items template with indices 1 to 10
const createEmptyItems = (): ReceiptItem[] => {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `row-${i + 1}`,
    index: i + 1,
    details: "",
    quantity: "",
    price: "",
    total: 0,
  }));
};

export default function App() {
  const [data, setData] = useState<ReceiptData>({
    clientName: "",
    clientPhone: "",
    date: "",
    notes: "",
    items: createEmptyItems(),
    totalAmount: 0,
  });

  const [history, setHistory] = useState<ReceiptData[]>([]);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize date to today's local date (RTL friendly)
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    
    setData((prev) => ({
      ...prev,
      date: `${yyyy}-${mm}-${dd}`,
    }));

    // Retrieve invoice history from localStorage
    try {
      const stored = localStorage.getItem("jamea_invoice_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load invoice history", e);
    }
  }, []);

  // Show automatic timed toast notifications
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Hardclear the invoice pad
  const handleClear = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    setData({
      clientName: "",
      clientPhone: "",
      date: `${yyyy}-${mm}-${dd}`,
      notes: "",
      items: createEmptyItems(),
      totalAmount: 0,
    });
    triggerToast("✨ تم إرجاع الفاتورة إلى الوضع الخالي.");
  };

  // Populate dynamic high-quality demo data for the operator to test
  const handleLoadDemo = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    const demoItems = createEmptyItems();
    
    // Fill custom demo contents
    demoItems[0] = {
      id: "row-1",
      index: 1,
      details: "استنساخ ملازم دراسية لطلبة الهندسة (أوراق ممتازة)",
      quantity: 120,
      price: 150,
      total: 18000,
    };
    demoItems[1] = {
      id: "row-2",
      index: 2,
      details: "تجليد حلزوني بلاستيك فاخر مع غلاف سميك ملون",
      quantity: 6,
      price: 1000,
      total: 6000,
    };
    demoItems[2] = {
      id: "row-3",
      index: 3,
      details: "طباعة بوسترات ملونة لامعة حجم A3 بدقة عالية",
      quantity: 10,
      price: 1500,
      total: 15000,
    };
    demoItems[3] = {
      id: "row-4",
      index: 4,
      details: "درع خشبي مطعم بنحاس مذهب مع علبة مخملية",
      quantity: 2,
      price: 25000,
      total: 50000,
    };

    const totalAmount = demoItems.reduce((acc, cur) => acc + cur.total, 0);

    setData({
      clientName: "أ.د. حيدر جعفر المياحي - عميد كلية الهندسة",
      clientPhone: "07847752888",
      date: `${yyyy}-${mm}-${dd}`,
      notes: "يرجى تسليم الدروع مغلّفة بشكل ممتاز قبل موعد حفل التخرج يوم الثلاثاء.",
      items: demoItems,
      totalAmount,
    });

    triggerToast("📥 تم تحميل بيانات التجربة والمثال بنجاح.");
  };

  // Trigger system print and backup to browser database
  const handlePrint = () => {
    // Add current transaction to history if there are details filled
    const hasItemsWritten = data.items.some(
      (item) => item.details.trim() !== "" || (item.quantity && item.price)
    );

    if (hasItemsWritten) {
      // Avoid exact duplicates in history index by comparison
      const isDuplicate = history.some(
        (h) =>
          h.clientName === data.clientName &&
          h.totalAmount === data.totalAmount &&
          h.date === data.date
      );

      if (!isDuplicate) {
        const updatedHistory = [data, ...history].slice(0, 30); // keep last 30 receipts
        setHistory(updatedHistory);
        localStorage.setItem("jamea_invoice_history", JSON.stringify(updatedHistory));
      }
    }

    // Call browser's dynamic print flow
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Load old invoice from history archive
  const handleLoadHistory = (historicalItem: ReceiptData) => {
    // Clean fields that might be empty
    const paddedItems = createEmptyItems().map((emptyItem) => {
      const savedItem = historicalItem.items.find((item) => item.index === emptyItem.index);
      return savedItem ? { ...savedItem } : { ...emptyItem };
    });

    setData({
      ...historicalItem,
      items: paddedItems,
    });
    triggerToast(`📖 تم استعادة وصل السيد: ${historicalItem.clientName || "زبون نقدي"}`);
    
    // Auto focus preview to let them see it
    setActiveTab("preview");
  };

  // Delete historic invoice safely from localized Storage
  const handleDeleteHistory = (targetIndex: number) => {
    const updatedHistory = history.filter((_, idx) => idx !== targetIndex);
    setHistory(updatedHistory);
    localStorage.setItem("jamea_invoice_history", JSON.stringify(updatedHistory));
    triggerToast("🗑️ تم حذف الفاتورة المحددة من السجل.");
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col justify-between">
      
      {/* Toast Notification Widget */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-cyan-500 text-slate-950 font-bold px-6 py-3 rounded-full shadow-lg border border-cyan-300 pointer-events-none no-print text-sm flex items-center gap-2"
          >
            <span>🔔</span> {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= APP HEADER ================= */}
      <header className="bg-slate-900 border-b border-slate-800 py-4 px-6 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <span className="text-3xl">🖨️</span>
            <div>
              <h1 className="text-xl font-extrabold text-white font-cairo">
                نظام فواتير والوصولات الرقمي
              </h1>
              <p className="text-xs text-slate-400">
                الحل الإلكتروني المتكامل لمكتبة ومطبعة الجامعة السريعة | البصرة - الزبير
              </p>
            </div>
          </div>

          {/* Quick instructions counter / System status */}
          <div className="flex items-center gap-3 bg-slate-950/60 p-2 px-4 rounded-xl border border-slate-800">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-xs text-slate-300 font-semibold">
              المتصفح جاهز للطباعة والـ PDF بنسبة 100%
            </span>
          </div>
          
        </div>
      </header>

      {/* ================= MOBILE SWITCHER TABS ================= */}
      <div className="bg-slate-900/60 py-2.5 px-4 sticky top-0 z-40 border-b border-slate-800 md:hidden no-print">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <button
            onClick={() => setActiveTab("edit")}
            className={`flex-1 font-bold py-2.5 text-center text-xs rounded-xl transition ${
              activeTab === "edit"
                ? "bg-cyan-500 text-slate-950 shadow-md"
                : "bg-slate-800 text-slate-300 hover:bg-slate-705"
            }`}
          >
            ✍️ تعديل وتعبئة البيانات
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex-1 font-bold py-2.5 text-center text-xs rounded-xl transition ${
              activeTab === "preview"
                ? "bg-cyan-500 text-slate-950 shadow-md"
                : "bg-slate-800 text-slate-300 hover:bg-slate-705"
            }`}
          >
            👁️ معاينة شكل الوصل المطبوع
          </button>
        </div>
      </div>

      {/* ================= CORE CONTENT CONTAINER ================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Desktop dual side-by-side view, mobile custom tab filter */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 items-start">
          
          {/* Controls Panel Section */}
          <div className={`space-y-6 ${activeTab === "edit" ? "block" : "hidden md:block"} no-print`}>
            <ReceiptForm
              data={data}
              onChange={setData}
              onPrint={handlePrint}
              onLoadDemo={handleLoadDemo}
              onClear={handleClear}
              history={history}
              onLoadHistory={handleLoadHistory}
              onDeleteHistory={handleDeleteHistory}
            />
          </div>

          {/* Visual Receipt Preview Column */}
          <div className={`${activeTab === "preview" ? "block" : "hidden md:block"} print:block`}>
            
            {/* Context Notice box for desktop */}
            <div className="bg-blue-950/20 text-blue-300 border border-blue-900/40 p-3.5 rounded-xl mb-4 text-xs font-semibold leading-relaxed no-print hidden md:flex items-start gap-2.5">
              <span className="text-sm">👁️</span>
              <div>
                قم بتعبئة ومراجعة التفاصيل في النموذج المقابل. عند الانتهاء اضغط على <strong className="text-cyan-400">"طباعة وحفظ كـ PDF"</strong>. سيقوم نظام المتصفح بالفتح لطباعتها فوراً أو اختيار <strong className="text-emerald-400">Save as PDF</strong> لحفظها على جهازك.
              </div>
            </div>

            {/* Interactive container that will be printed */}
            <ReceiptPreview data={data} />
          </div>

        </div>

      </main>

      {/* ================= APP FOOTER ================= */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 space-y-2 no-print bg-slate-950">
        <p className="font-semibold text-slate-400">
          نظام مولد وصلات الجامعة الرقمية لخدمات الطلاب الاستنساخ والطباعة والترجمة
        </p>
        <p dir="ltr" className="font-mono">
          © 2026 مكتبة ومطبعة الجامعة - تم التطوير بحرفية رقمية فائقة.
        </p>
      </footer>

    </div>
  );
}
