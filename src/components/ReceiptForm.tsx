import React, { useState } from "react";
import { ReceiptData, ReceiptItem, ServicePreset } from "../types";
import { SERVICE_PRESETS } from "../presets";
import { formatIraqiDinar, toArabicDigits } from "../utils";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface ReceiptFormProps {
  data: ReceiptData;
  onChange: (newData: ReceiptData) => void;
  onPrint: () => void;
  onLoadDemo: () => void;
  onClear: () => void;
  history: ReceiptData[];
  onLoadHistory: (item: ReceiptData) => void;
  onDeleteHistory: (index: number) => void;
}

export default function ReceiptForm({
  data,
  onChange,
  onPrint,
  onLoadDemo,
  onClear,
  history,
  onLoadHistory,
  onDeleteHistory
}: ReceiptFormProps) {
  const [activeRowIndex, setActiveRowIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // High fidelity client-side PDF capture and download
  const generateAndDownloadPdf = async (silent = false): Promise<string | null> => {
    const element = document.getElementById("receipt-print-container");
    if (!element) {
      if (!silent) alert("خطأ: لم يتم العثور على منطقة معاينة الوصل لتوليد ملف الـ PDF.");
      return null;
    }

    try {
      setIsGeneratingPdf(true);
      
      // Store current scroll position and scroll to top for full capture
      const scrollY = window.scrollY;
      window.scrollTo(0, 0);

      // We capture with high-quality parameters
      const canvas = await html2canvas(element, {
        scale: 2.5, // Ultra-high density for perfect Arabic font render
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      // Restore scroll
      window.scrollTo(0, scrollY);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // A4 measurements: 210mm x 297mm
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      
      const sanitizedName = data.clientName ? data.clientName.trim().replace(/\s+/g, "_") : "زبون";
      const fileName = `وصل_مكتبة_الجامعة_${sanitizedName}.pdf`;
      pdf.save(fileName);
      
      setIsGeneratingPdf(false);
      return fileName;
    } catch (error) {
      console.error("PDF generation error:", error);
      setIsGeneratingPdf(false);
      if (!silent) alert("حدث خطأ أثناء إعداد الـ PDF. يرجى المحاولة لاحقاً.");
      return null;
    }
  };

  // Handler for row changes
  const handleItemChange = (
    indexNum: number,
    field: keyof ReceiptItem,
    value: string | number
  ) => {
    const updatedItems = [...data.items];
    const itemIndex = updatedItems.findIndex((item) => item.index === indexNum);

    if (itemIndex > -1) {
      const item = { ...updatedItems[itemIndex] };

      if (field === "quantity") {
        item.quantity = value === "" ? "" : Number(value);
      } else if (field === "price") {
        item.price = value === "" ? "" : Number(value);
      } else if (field === "details") {
        item.details = String(value);
      }

      // Re-calculate row total
      const qty = item.quantity || 0;
      const prc = item.price || 0;
      item.total = Number(qty) * Number(prc);

      updatedItems[itemIndex] = item;
    }

    // Calculate total amount
    const totalAmount = updatedItems.reduce((acc, cur) => acc + cur.total, 0);

    onChange({
      ...data,
      items: updatedItems,
      totalAmount,
    });
  };

  // Handler for general string inputs
  const handleMetaChange = (field: keyof ReceiptData, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  // Apply service preset to active row
  const applyPreset = (preset: ServicePreset) => {
    const activeIndex = activeRowIndex + 1; // 1-based index
    handleItemChange(activeIndex, "details", preset.name);
    if (preset.defaultPrice !== undefined) {
      handleItemChange(activeIndex, "price", preset.defaultPrice);
    }
    // Set default quantity as 1 if it is currently empty or 0
    const currentItem = data.items.find((item) => item.index === activeIndex);
    if (!currentItem?.quantity) {
      handleItemChange(activeIndex, "quantity", 1);
    }

    // Auto-advance to next row for blazing fast typing
    if (activeRowIndex < 9) {
      setActiveRowIndex(activeRowIndex + 1);
    }
  };

  // Filter service presets based on search query
  const filteredPresets = SERVICE_PRESETS.filter((preset) =>
    preset.name.includes(searchQuery)
  );

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl p-6 shadow-2xl space-y-6 border border-slate-800 no-print">
      
      {/* Header and Branding inside Widget */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-cairo text-cyan-400 flex items-center gap-2">
            <span>⚙️</span> لوحة تحكم وإدخال البيانات السريعة
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            املأ تفاصيل الوصل؛ سيتم حساب المجاميع والضرب تلقائياً وجاهزاً للطباعة والـ PDF.
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto shrink-0">
          <button
            onClick={onLoadDemo}
            type="button"
            className="flex-1 sm:flex-initial bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 transition"
          >
            📋 نموذج تجريبي
          </button>
          <button
            onClick={onClear}
            type="button"
            className="flex-1 sm:flex-initial bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs px-3 py-1.5 rounded-lg border border-red-900/40 transition"
          >
            🗑️ تصفية الوصل
          </button>
        </div>
      </div>

      {/* ================= SECTION A: CUSTOMER METADATA ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950/50 p-4 rounded-lg border border-slate-800/80">
        
        {/* Customer Name */}
        <div className="flex flex-col space-y-1.5 col-span-1 sm:col-span-2 md:col-span-1">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
            👤 اسم الزبون (حضرة السيد):
          </label>
          <input
            type="text"
            className="bg-slate-900 text-white border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 font-medium"
            placeholder="مثال: د. محمد علي البصري"
            value={data.clientName}
            onChange={(e) => handleMetaChange("clientName", e.target.value)}
            list="past-clients-list"
          />
          {/* Datatags for repeating clients selection */}
          <datalist id="past-clients-list">
            {Array.from(new Set(history.map((h) => h.clientName)))
              .filter(Boolean)
              .map((name) => (
                <option key={name} value={name} />
              ))}
          </datalist>
        </div>

        {/* Customer Phone (WhatsApp) */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
            💬 رقم واتساب الزبون:
          </label>
          <div className="relative flex">
            <input
              type="text"
              className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg pr-3 pl-12 py-2 text-sm focus:outline-none focus:border-cyan-500 font-bold"
              placeholder="مثال: 07847752888"
              value={data.clientPhone || ""}
              onChange={(e) => handleMetaChange("clientPhone", e.target.value)}
            />
            <button
              type="button"
              disabled={isGeneratingPdf}
              onClick={async () => {
                if (!data.clientPhone) {
                  alert("يرجى إدخال رقم WhatsApp المستلم أولاً لتشغيل الإرسال.");
                  return;
                }

                // 1. Generate & download the PDF receipt first
                const fileName = await generateAndDownloadPdf(false);
                if (!fileName) return; // If generation fails, abort

                // 2. Build and execute the send with Iraqi-formatted numbers
                let phoneCleaned = data.clientPhone.replace(/\D/g, "");
                if (phoneCleaned.startsWith("07")) {
                  phoneCleaned = "964" + phoneCleaned.substring(1);
                } else if (phoneCleaned.startsWith("7")) {
                  phoneCleaned = "964" + phoneCleaned;
                }

                const clientDisplayName = data.clientName ? data.clientName.trim() : "زبون كاش (محترم)";
                const brandHeader = "🎓 *مكتبة ومطبعة الجامعة للأستنساخ والطباعة والترجمة* 🎓\n";
                const subHeader = "📍 بصرة - الزبير - شارع الضريبة القديمة\n";
                const divider = "------------------------------------------\n";
                
                let bodyText = brandHeader + subHeader + divider;
                bodyText += `🌸 *مرحباً حضرة السيد / ${clientDisplayName} المحترم* 🌸\n`;
                bodyText += `نرفق لك طيه الوصل الإلكتروني الرسمي الخاص بك لمشاهدة تفاصيل الطلب والأسعار الكاملة بدقة عالية 📥\n\n`;
                bodyText += `📅 *التاريخ:* ${toArabicDigits(data.date)}\n`;
                bodyText += `💰 *المجموع الكلي:* *${toArabicDigits(formatIraqiDinar(data.totalAmount))}*\n`;
                if (data.notes) {
                  bodyText += `📝 *ملاحظات:* ${data.notes}\n`;
                }
                bodyText += divider;
                bodyText += "📥 *لقد قمنا بتنزيل وحفظ ملف الـ PDF للتو على جهازك للتسهيل. يرجى سحب وإرفاق ملف الوصل باسم (وصل_مكتبة_الجامعة_...) وإرساله هنا كملف.*\n\n";
                bodyText += "✨ شكراً لتعاملكم مع مكتبة الجامعة! ✨\n";
                bodyText += "📞 هاتف الاستفسار: 07847752888";

                // Open WhatsApp link in new tab
                window.open(`https://wa.me/${phoneCleaned}?text=${encodeURIComponent(bodyText)}`, "_blank");
              }}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white p-1 px-2.5 rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              title="توليد وتنزيل ملف PDF ثم فتح واتساب للإرسال مباشرة"
            >
              <span>{isGeneratingPdf ? "جاري..." : "إرسال"}</span>
              <span className="text-sm">💬</span>
            </button>
          </div>
        </div>

        {/* Invoice Date */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">
            📅 تاريخ الوصل:
          </label>
          <input
            type="date"
            className="bg-slate-900 text-white border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 font-semibold text-center"
            value={data.date}
            onChange={(e) => handleMetaChange("date", e.target.value)}
          />
        </div>

        {/* Invoice Notes */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">
            📝 ملاحظات إضافية في ذيل الوصل:
          </label>
          <input
            type="text"
            className="bg-slate-900 text-white border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
            placeholder="مثال: يرجى التسليم يوم الأربعاء ظهراً"
            value={data.notes}
            onChange={(e) => handleMetaChange("notes", e.target.value)}
          />
        </div>

      </div>

      {/* ================= SECTION B: SERVICE PRESETS FAST SELECT ================= */}
      <div className="space-y-3 bg-slate-950/30 p-4 rounded-lg border border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h3 className="text-sm font-bold text-cyan-400 font-cairo">
            🎯 الإدخال السريع للخدمات (اضغط لإدراج القيمة تلقائياً):
          </h3>
          <input
            type="text"
            className="bg-slate-900 border border-slate-800 rounded-md px-2 py-1 text-xs w-full sm:w-44 text-slate-200 focus:outline-none focus:border-cyan-500"
            placeholder="🔍 تصفية الخدمات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* categorized chips */}
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-800">
          {filteredPresets.map((preset) => {
            let colorClass = "bg-slate-800 text-slate-300 hover:bg-slate-700";
            if (preset.category === "copy") colorClass = "bg-teal-950/80 text-teal-300 hover:bg-teal-900 border border-teal-950";
            if (preset.category === "print") colorClass = "bg-blue-950/80 text-blue-300 hover:bg-blue-900 border border-blue-950";
            if (preset.category === "bind") colorClass = "bg-indigo-950/80 text-indigo-300 hover:bg-indigo-900 border border-indigo-950";

            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`text-[11px] lg:text-xs py-1 px-2.5 rounded-lg font-medium transition cursor-pointer ${colorClass}`}
                title={`السعر الافتراضي: ${preset.defaultPrice ? formatIraqiDinar(preset.defaultPrice) : "مفتوح"}`}
              >
                {preset.name}
                {preset.defaultPrice !== undefined && (
                  <span className="opacity-75 mr-1 font-semibold">({toArabicDigits(formatIraqiDinar(preset.defaultPrice))})</span>
                )}
              </button>
            );
          })}
          {filteredPresets.length === 0 && (
            <span className="text-xs text-slate-500">لا توجد خدمات مطابقة للتصفية. اكتب اسماً مخصصاً في الخلايا أدناه.</span>
          )}
        </div>
        <div className="text-[10px] text-slate-500">
          💡 معلومات: عند الضغط على خدمة، سيتم تعبئتها في السطر النشط حالياً (السطر المحدد باللون الأزرق) ثم ينتقل المؤشر تلقائياً للسطر التالي.
        </div>
      </div>

      {/* ================= SECTION C: 10 DETAILS ROWS (GRID SPREADSHEET) ================= */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-200 font-cairo">
            📝 جدول تفاصيل الوصل (10 سطور مطابقة لدفتر الطباعة):
          </h3>
          <span className="text-xs text-cyan-400 font-semibold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-900/60">
            السطر النشط حالياً للإدخال السريع: {toArabicDigits(activeRowIndex + 1)}
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-right border-collapse min-w-[620px]">
            <thead>
              <tr className="bg-slate-950 text-slate-300 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider">
                <th className="p-2 py-3 text-center w-12">اختر</th>
                <th className="p-2 py-3 text-center w-12">ت</th>
                <th className="p-2 py-3 pr-4">التفاصيل / الخدمة المطلوبة</th>
                <th className="p-2 py-3 text-center w-24">العدد (الكمية)</th>
                <th className="p-2 py-3 text-center w-32">السعر المفرد (د.ع)</th>
                <th className="p-2 py-3 text-center w-36">المبلغ الكلي (د.ع)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/40">
              {Array.from({ length: 10 }).map((_, idx) => {
                const itemIndex = idx + 1;
                const item = data.items.find((it) => it.index === itemIndex) || {
                  id: `empty-${itemIndex}`,
                  index: itemIndex,
                  details: "",
                  quantity: "",
                  price: "",
                  total: 0,
                };
                const isActive = activeRowIndex === idx;

                return (
                  <tr
                    key={itemIndex}
                    className={`transition-colors text-xs ${
                      isActive
                        ? "bg-blue-950/50 border-r-4 border-r-blue-500"
                        : "hover:bg-slate-800/30"
                    }`}
                    onClick={() => setActiveRowIndex(idx)}
                  >
                    {/* Select active row trigger button */}
                    <td className="p-1 px-2 text-center">
                      <input
                        type="radio"
                        name="activeRow"
                        checked={isActive}
                        onChange={() => setActiveRowIndex(idx)}
                        className="cursor-pointer h-3.5 w-3.5 text-cyan-500 focus:ring-cyan-500 bg-slate-800 border-slate-700"
                        title="اختره كسطر نشط لتعبئته بالضغط على الأزرار"
                      />
                    </td>

                    {/* index badge */}
                    <td className="p-1 text-center font-bold text-slate-500">
                      {toArabicDigits(itemIndex)}
                    </td>

                    {/* text details box */}
                    <td className="p-1 pr-3">
                      <input
                        type="text"
                        className="w-full bg-slate-950 text-slate-100 border border-slate-850 focus:border-cyan-500 rounded px-2 py-1.5 text-xs focus:outline-none"
                        placeholder={`تفاصيل العملية رقم ${toArabicDigits(itemIndex)}...`}
                        value={item.details}
                        onChange={(e) =>
                          handleItemChange(itemIndex, "details", e.target.value)
                        }
                      />
                    </td>

                    {/* qty details box */}
                    <td className="p-1 text-center">
                      <input
                        type="number"
                        min="1"
                        className="w-full text-center bg-slate-950 text-slate-100 border border-slate-850 focus:border-cyan-500 rounded px-2 py-1.5 text-xs focus:outline-none font-bold"
                        placeholder="ـ"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(itemIndex, "quantity", e.target.value)
                        }
                      />
                    </td>

                    {/* price details box */}
                    <td className="p-1 text-center">
                      <input
                        type="number"
                        step="50"
                        min="0"
                        className="w-full text-center bg-slate-950 text-slate-100 border border-slate-850 focus:border-cyan-500 rounded px-2 py-1.5 text-xs focus:outline-none font-bold text-teal-400"
                        placeholder="السعر"
                        value={item.price}
                        onChange={(e) =>
                          handleItemChange(itemIndex, "price", e.target.value)
                        }
                      />
                    </td>

                    {/* total sum box for this item */}
                    <td className="p-2 text-center text-slate-400 font-bold font-mono">
                      {item.total ? toArabicDigits(formatIraqiDinar(item.total)) : "٠"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= SECTION D: PAST INVOICES ARCHIVE ================= */}
      {history.length > 0 && (
        <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-slate-300 font-cairo flex items-center gap-1.5">
            📂 محفوظات السجل السريع ({toArabicDigits(history.length)} فواتير سابقة):
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-36 overflow-y-auto p-1">
            {history.map((histItem, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex items-start justify-between gap-2 hover:border-slate-700 transition group"
              >
                <div
                  className="flex-1 text-right cursor-pointer"
                  onClick={() => onLoadHistory(histItem)}
                >
                  <div className="font-bold text-xs text-white truncate max-w-[150px]">
                    {histItem.clientName || "زبون مجهول"}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {toArabicDigits(histItem.date)} | {toArabicDigits(formatIraqiDinar(histItem.totalAmount))}
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => onDeleteHistory(idx)}
                  className="text-slate-500 hover:text-red-400 text-xs p-1 rounded hover:bg-slate-800 transition"
                  title="حذف من السجل"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="text-[10px] text-slate-500">
            * يتم حفظ الوصلات السابقة تلقائياً في المتصفّح بعد الضغط على "طباعة وحفظ كـ PDF" للرجوع إليها لاحقاً.
          </div>
        </div>
      )}

      {/* ================= ACTIONS FOOTER ================= */}
      <div className="border-t border-slate-800 pt-5 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Math summary quick glance */}
        <div className="bg-slate-950 p-3 px-5 rounded-xl border border-slate-800/80 w-full md:w-auto text-center md:text-right flex items-center justify-between md:justify-start gap-4">
          <span className="text-xs text-slate-400 font-semibold">المجموع المحسوب:</span>
          <span className="text-xl font-black text-cyan-400 font-mono">
            {toArabicDigits(formatIraqiDinar(data.totalAmount))}
          </span>
        </div>

        {/* PRINT & DOWNLOAD TRIGGER BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Direct client-side PDF Generator */}
          <button
            onClick={() => generateAndDownloadPdf(false)}
            disabled={isGeneratingPdf}
            type="button"
            className="w-full sm:w-auto border-2 border-cyan-500/60 text-cyan-400 hover:text-white hover:bg-cyan-500/20 disabled:border-slate-800 disabled:text-slate-600 font-bold p-4 px-8 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-base"
          >
            <span className="text-xl">📥</span>
            <span>{isGeneratingPdf ? "جاري التوليد..." : "تحميل PDF مباشر"}</span>
          </button>

          <button
            onClick={onPrint}
            type="button"
            className="w-full sm:w-auto bg-gradient-to-l from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold p-4 px-10 rounded-xl shadow-lg shadow-cyan-900/30 transition-transform active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer text-base"
          >
            <span className="text-xl">🖨️</span>
            <span>طباعة وحفظ السجل</span>
          </button>
        </div>
      </div>

    </div>
  );
}
