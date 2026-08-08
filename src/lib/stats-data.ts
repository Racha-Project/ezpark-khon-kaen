/**
 * Demo statistics data. The shape mirrors what an aggregated query would
 * return, so it can be swapped for real data from parking_sessions later.
 */
export const HOURS = [
  "06:00",
  "08:00",
  "10:00",
  "12:00",
  "14:00",
  "16:00",
  "18:00",
  "20:00",
] as const;

export const hourlyCheckIns = [
  { hour: "06:00", count: 4 },
  { hour: "08:00", count: 28 },
  { hour: "10:00", count: 22 },
  { hour: "12:00", count: 16 },
  { hour: "14:00", count: 18 },
  { hour: "16:00", count: 11 },
  { hour: "18:00", count: 6 },
  { hour: "20:00", count: 2 },
];

export const heatmap: { zone: string; values: number[] }[] = [
  { zone: "Zone A", values: [2, 18, 14, 9, 12, 7, 4, 1] },
  { zone: "Zone B", values: [1, 13, 11, 8, 9, 5, 3, 1] },
  { zone: "Zone C", values: [3, 20, 16, 12, 14, 9, 5, 2] },
  { zone: "Zone D", values: [1, 6, 5, 4, 5, 3, 2, 1] },
];

/** Predicted free slots by hour (demo model over historical check-ins). */
export const predictionByHour: Record<string, number> = {
  "06:00": 48,
  "08:00": 9,
  "10:00": 14,
  "12:00": 22,
  "14:00": 18,
  "16:00": 27,
  "18:00": 38,
  "20:00": 50,
};

export function nextPredictionSlot(now = new Date()) {
  const hour = now.getHours();
  const target = HOURS.find((h) => Number(h.slice(0, 2)) > hour) ?? HOURS[0];
  return { time: target, free: predictionByHour[target] ?? 20 };
}

export const peakTimes = [
  { tone: "danger" as const, label: "ช่วงเวลาที่คนจอดมากที่สุด", value: "08:00 - 10:00" },
  { tone: "warning" as const, label: "ช่วงเวลาปานกลาง", value: "10:00 - 16:00" },
  { tone: "success" as const, label: "ช่วงเวลาน้อยที่สุด", value: "00:00 - 06:00 และ 20:00 - 24:00" },
];
