import React from "react";
import { ReceiptData, ReceiptItem } from "../types";
import { toArabicDigits, formatIraqiDinar, formatDateArabic } from "../utils";
import UniversityLogo from "./UniversityLogo";

interface ReceiptPreviewProps {
  data: ReceiptData;
}

export default function ReceiptPreview({ data }: ReceiptPreviewProps) {
  // Ensure we always have exactly 10 table rows to match the paper pad design
  const fullRows = Array.from({ length: 10 }, (_, index) => {
    const itemIndex = index + 1;
    const existingItem = data.items.find((item) => item.index === itemIndex);
    return (
      existingItem || {
        id: `empty-${itemIndex}`,
        index: itemIndex,
        details: "",
        quantity: "",
        price: "",
        total: 0,
      }
    );
  });

  const { year, month, day } = formatDateArabic(data.date);

  return (
    <div
      id="receipt-print-container"
      className="receipt-card bg-white text-slate-800 p-6 md:p-8 rounded-xl shadow-lg border border-slate-200 mx-auto w-full max-w-[210mm] relative bg-invoice-paper print-area transition-all duration-300 select-text"
      style={{ minHeight: "297mm" }} // A4 proportions
    >
      {/* Outer Border Frame */}
      <div className="absolute inset-4 border-2 border-blue-700/65 rounded-lg pointer-events-none print:inset-2" />

      <div className="relative z-10 flex flex-col justify-between h-full min-h-[275mm] p-2">
        
        {/* ================= HEADER SECTION ================= */}
        <div className="flex flex-row justify-between items-center pb-6 border-b-2 border-dashed border-blue-300">
          
          {/* Top-Left: Logo & Subtitle */}
          <div className="flex flex-col items-center">
            <UniversityLogo className="w-24 h-24 md:w-28 md:h-28" />
          </div>

          {/* Top-Center Decorative dots & stars */}
          <div className="hidden sm:flex flex-col items-center justify-center space-y-1 mx-2">
            <div className="flex space-x-1.5 space-x-reverse">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
              <span className="w-1.5 h-1.5 bg-blue-300 rounded-full"></span>
              <span className="w-1.5 h-1.5 bg-cyan-300 rounded-full"></span>
              <span className="w-1.5 h-1.5 bg-cyan-200 rounded-full"></span>
            </div>
            <div className="text-[10px] tracking-wide text-blue-400/80 font-mono">EST. 2014</div>
            <div className="flex items-center space-x-1 space-x-reverse text-amber-500 text-xs">
              <span>✦</span>
              <span>✦</span>
            </div>
          </div>

          {/* Top-Right: Shop Title and Services Banner */}
          <div className="flex flex-col text-right flex-1 pr-4 md:pr-6">
            <div className="text-blue-900 font-extrabold flex flex-col mb-2">
              <span className="text-sm md:text-base text-blue-600 tracking-wider font-cairo">مكتبة ومطبعة</span>
              <span className="text-3xl md:text-5xl font-black font-cairo tracking-tight text-blue-800 drop-shadow-[0_2px_2px_rgba(59,130,246,0.15)] leading-none mt-1">
                الجامعة
              </span>
            </div>

            {/* Cyan banners for services */}
            <div className="flex flex-col space-y-1 mt-1 font-semibold max-w-sm sm:max-w-md">
              <div className="bg-cyan-50/90 border border-cyan-200 text-cyan-800 text-xs md:text-sm py-1 px-3 rounded-md text-center shadow-sm">
                استنساخ <span className="text-cyan-400 mx-1">/</span> فلكس <span className="text-cyan-400 mx-1">/</span> دروع
              </div>
              <div className="bg-blue-50/90 border border-blue-100 text-blue-800 text-[10px] md:text-xs py-1 px-2 rounded-md text-center">
                وصولات <span className="text-blue-300 mx-1">/</span> باجات <span className="text-blue-300 mx-1">/</span> اختام <span className="text-blue-300 mx-1">/</span> تجليد وتذهيب
              </div>
            </div>
          </div>
        </div>

        {/* ================= CUSTOMER INFO SECTION ================= */}
        <div className="mt-6 mb-6">
          <div className="border-[2px] border-blue-600 rounded-xl p-3 md:p-4 bg-blue-50/40 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            {/* Customer Name */}
            <div className="flex-1 flex items-center min-w-0">
              <span className="font-bold text-blue-800 text-sm md:text-base whitespace-nowrap ml-2">
                حضرة / السيد :
              </span>
              <div className="flex-1 border-b-2 border-dotted border-blue-400/80 pb-0.5 min-w-[120px] px-2 flex items-center">
                {data.clientName ? (
                  <span className="text-slate-900 font-extrabold text-base md:text-lg break-words leading-tight">
                    {data.clientName}
                  </span>
                ) : (
                  <span className="text-slate-400 select-none text-xs italic">
                    زبون كاش (نقدي)
                  </span>
                )}
              </div>
              <span className="font-bold text-blue-700 text-xs md:text-sm mr-2 whitespace-nowrap">
                المحترم
              </span>
            </div>

            {/* Date Picker Display */}
            <div className="flex items-center shrink-0">
              <span className="font-bold text-blue-800 text-sm ml-2">التاريخ :</span>
              <div className="flex items-center text-slate-800 font-bold text-sm md:text-base space-x-1 space-x-reverse mr-1 bg-white border border-blue-300 rounded px-3 py-1 shadow-inner">
                {/* Year */}
                <div className="w-8 text-center border-b border-slate-300">
                  {year ? toArabicDigits(year) : "٢٦"}
                </div>
                <span className="text-blue-500 font-mono">/</span>
                {/* Month */}
                <div className="w-6 text-center border-b border-slate-300">
                  {month ? toArabicDigits(month) : "   "}
                </div>
                <span className="text-blue-500 font-mono">/</span>
                {/* Day */}
                <div className="w-6 text-center border-b border-slate-300">
                  {day ? toArabicDigits(day) : "   "}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= ITEMS TABLE SECTION ================= */}
        <div className="relative flex-1 mt-2">
          {/* Large faint background watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none z-0">
            <UniversityLogo className="w-80 h-80 md:w-[450px] md:h-[450px]" watermark={true} />
          </div>

          <div className="relative z-10 border-2 border-blue-700 rounded-xl overflow-hidden bg-white/70 shadow-sm">
            
            {/* Table Header - Order from Right to Left: ت -> التفاصيل -> العدد -> السعر -> المبلغ */}
            <div className="grid grid-cols-[45px_1fr_80px_100px_120px] divide-x divide-x-reverse divide-blue-700 border-b-2 border-blue-700 bg-blue-100 text-blue-900 font-bold text-center text-xs md:text-sm py-2">
              <div className="flex items-center justify-center font-bold">ت</div>
              <div className="text-right pr-4 font-bold">التفاصيل</div>
              <div className="flex items-center justify-center font-bold">العدد</div>
              <div className="flex items-center justify-center font-bold">السعر</div>
              <div className="flex items-center justify-center font-bold text-blue-950">المبلغ الكلي</div>
            </div>

            {/* Table Rows (Fixed at 10 rows) */}
            <div className="divide-y divide-blue-400">
              {fullRows.map((row, i) => {
                const isEven = i % 2 === 0;
                const hasValue = row.details || row.quantity || row.price;

                return (
                  <div
                    key={row.id}
                    className={`grid grid-cols-[45px_1fr_80px_100px_120px] divide-x divide-x-reverse divide-blue-400 text-xs md:text-sm items-center min-h-[40px] py-1 select-text transition-all ${
                      hasValue ? "bg-white/90" : isEven ? "bg-slate-50/20" : "bg-white/20"
                    }`}
                  >
                    {/* 1. ت (Rightmost) */}
                    <div className="flex items-center justify-center">
                      <span className="w-6 h-6 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center shadow-inner">
                        {toArabicDigits(row.index)}
                      </span>
                    </div>

                    {/* 2. التفاصيل - supporting clean wrapping so it never truncates or overlaps */}
                    <div className="text-right font-medium text-slate-900 pr-4 pl-2 break-words leading-tight" dir="rtl">
                      {row.details || ""}
                    </div>

                    {/* 3. العدد */}
                    <div className="text-center text-slate-800 font-semibold text-xs md:text-sm px-1">
                      {row.quantity ? toArabicDigits(row.quantity) : ""}
                    </div>

                    {/* 4. السعر */}
                    <div className="text-center text-slate-800 font-medium px-1">
                      {row.price ? toArabicDigits(formatIraqiDinar(row.price)) : ""}
                    </div>

                    {/* 5. المبلغ الكلي */}
                    <div className="font-bold text-center text-blue-900 whitespace-nowrap px-1">
                      {row.total ? toArabicDigits(formatIraqiDinar(row.total)) : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= NOTES & SUM SEGMENT ================= */}
        <div className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-4">
            
            {/* Notes Section (الملاحظات) */}
            <div className="border-2 border-blue-600 rounded-xl p-3 bg-white flex flex-col justify-between min-h-[60px] relative">
              <span className="text-xs font-bold text-blue-800 absolute top-1.5 right-3 bg-white px-1">
                الملاحظات :
              </span>
              <p className="text-slate-800 text-xs font-medium mt-4 leading-relaxed px-1">
                {data.notes || "لا توجد ملاحظات إضافية."}
              </p>
            </div>

            {/* Total Sum Section (المجموع الكلي) */}
            <div className="border-2 border-blue-600 rounded-xl p-3 bg-blue-50/60 flex flex-col justify-center items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-12 h-12 bg-blue-200/40 rounded-full blur-sm -mr-4 -mt-4"></div>
              
              <span className="text-xs font-bold text-blue-800 mb-1">المجموع الكلي</span>
              <div className="text-xl md:text-2xl font-black text-blue-900 bg-white border-2 border-blue-700 px-4 py-1.5 rounded-lg shadow-sm">
                {toArabicDigits(formatIraqiDinar(data.totalAmount || 0))}
              </div>
            </div>

          </div>
        </div>

        {/* ================= FOOTER / SIGNATURE SECTION ================= */}
        <div className="mt-6 pt-3 relative">
          
          {/* Custom shaped diagonal banner for footer details */}
          <div className="relative bg-blue-900 text-white rounded-lg px-4 py-3 text-[10px] md:text-xs flex flex-col sm:flex-row justify-between items-center gap-3 overflow-hidden shadow-md">
            
            {/* Diagonal accent strip in footer */}
            <div className="absolute top-0 bottom-0 left-1/2 w-4 bg-cyan-400 -skew-x-12 opacity-80 transform -translate-x-1/2 hidden md:block"></div>

            {/* Right: Instagram Contact */}
            <div className="flex items-center space-x-1.5 space-x-reverse z-10">
              <span className="text-cyan-300 font-semibold bg-white/10 px-2 py-0.5 rounded">
                Instagram :
              </span>
              <span className="font-bold tracking-wide">JAMEA_PRINT</span>
            </div>

            {/* Center: Address */}
            <div className="flex items-center space-x-1.5 space-x-reverse z-10 text-center">
              <span className="bg-cyan-400 font-bold p-0.5 rounded-full text-blue-900">
                📌
              </span>
              <span className="font-bold">الموقع: بصرة - الزبير - شارع الضريبة القديمة</span>
            </div>

            {/* Left: Phone */}
            <div className="flex items-center space-x-1.5 space-x-reverse z-10">
              <span className="bg-emerald-500 font-bold p-0.5 rounded-full text-white">
                📞
              </span>
              <span className="font-extrabold tracking-widest text-[11px] md:text-sm">
                {toArabicDigits("07847752888")}
              </span>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
