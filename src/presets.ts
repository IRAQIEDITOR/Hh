import { ServicePreset } from "./types";

export const SERVICE_PRESETS: ServicePreset[] = [
  { name: "استنساخ وجه واحد", defaultPrice: 100, category: "copy" },
  { name: "استنساخ وجهين", defaultPrice: 150, category: "copy" },
  { name: "استنساخ ملون", defaultPrice: 250, category: "copy" },
  { name: "طباعة أسود وأبيض A4", defaultPrice: 150, category: "print" },
  { name: "طباعة ملونة A4", defaultPrice: 500, category: "print" },
  { name: "طباعة ليزرية فاخرة", defaultPrice: 1000, category: "print" },
  { name: "تجليد حلزوني بلاستيك", defaultPrice: 1000, category: "bind" },
  { name: "تجليد سلك معدني", defaultPrice: 1500, category: "bind" },
  { name: "تجليد حراري هارد كفر", defaultPrice: 5000, category: "bind" },
  { name: "تجليد عادي لاصق", defaultPrice: 500, category: "bind" },
  { name: "طباعة فلكس (متر مربّع)", defaultPrice: 8000, category: "print" },
  { name: "درع خشبي مميز", defaultPrice: 15000, category: "other" },
  { name: "درع أكريليك فاخر", defaultPrice: 20000, category: "other" },
  { name: "ختم أوتوماتيك دائري", defaultPrice: 12000, category: "other" },
  { name: "باج شخصي دبوس", defaultPrice: 1500, category: "other" },
  { name: "باج شخصي مغناطيس", defaultPrice: 2500, category: "other" },
  { name: "ترجمة وثائق (صفحة)", defaultPrice: 5000, category: "other" },
];
