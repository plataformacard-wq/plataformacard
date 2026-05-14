export type TimeShift = {
  open: string;
  close: string;
};

export type DaySchedule = {
  isOpen: boolean;
  shifts: TimeShift[];
};

export type BusinessHours = {
  timezone: string;
  manual_override: "open" | "closed" | null;
  schedule: {
    monday: DaySchedule;
    tuesday: DaySchedule;
    wednesday: DaySchedule;
    thursday: DaySchedule;
    friday: DaySchedule;
    saturday: DaySchedule;
    sunday: DaySchedule;
  };
};

export const DEFAULT_BUSINESS_HOURS: BusinessHours = {
  timezone: "America/Sao_Paulo",
  manual_override: null,
  schedule: {
    monday: { isOpen: true, shifts: [{ open: "08:00", close: "18:00" }] },
    tuesday: { isOpen: true, shifts: [{ open: "08:00", close: "18:00" }] },
    wednesday: { isOpen: true, shifts: [{ open: "08:00", close: "18:00" }] },
    thursday: { isOpen: true, shifts: [{ open: "08:00", close: "18:00" }] },
    friday: { isOpen: true, shifts: [{ open: "08:00", close: "18:00" }] },
    saturday: { isOpen: true, shifts: [{ open: "08:00", close: "12:00" }] },
    sunday: { isOpen: false, shifts: [] },
  },
};

export type BusinessStatus = {
  isOpenNow: boolean;
  message: string;
};

const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

export function getBusinessStatus(businessHours: BusinessHours | null): BusinessStatus {
  const hours = (!businessHours || !businessHours.schedule || Object.keys(businessHours.schedule).length === 0)
    ? DEFAULT_BUSINESS_HOURS
    : businessHours;

  if (hours.manual_override === "open") {
    return { isOpenNow: true, message: "Aberto agora" };
  }

  if (hours.manual_override === "closed") {
    return { isOpenNow: false, message: "Fechado temporariamente" };
  }

  const now = new Date();
  
  // Use Intl to get the current date/time components in the specified timezone
  const options: Intl.DateTimeFormatOptions = {
    timeZone: hours.timezone || "America/Sao_Paulo",
    hour12: false,
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short"
  };

  const formatter = new Intl.DateTimeFormat("en-US", options);
  const parts = formatter.formatToParts(now);

  const getPart = (type: string) => parts.find((p) => p.type === type)?.value || "";
  
  const currentHour = parseInt(getPart("hour"), 10);
  const currentMinute = parseInt(getPart("minute"), 10);
  
  // To get the local day of the week reliably in the target timezone
  const weekdayEn = getPart("weekday").toLowerCase();
  const currentDayIndex = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].indexOf(weekdayEn);
  
  if (currentDayIndex === -1) {
    return { isOpenNow: true, message: "Disponível" }; // Fallback
  }

  const dayKey = dayNames[currentDayIndex];
  const todaySchedule = hours.schedule[dayKey];

  if (!todaySchedule || !todaySchedule.isOpen) {
    return { isOpenNow: false, message: "Fechado hoje" };
  }

  const currentMinutesTotal = currentHour * 60 + currentMinute;

  let isOpenNow = false;

  for (const shift of todaySchedule.shifts) {
    if (!shift.open || !shift.close) continue;

    const [openH, openM] = shift.open.split(":").map(Number);
    const [closeH, closeM] = shift.close.split(":").map(Number);

    const openMinutesTotal = openH * 60 + openM;
    let closeMinutesTotal = closeH * 60 + closeM;

    // Handle shifts that end at midnight or cross midnight (e.g. 18:00 to 02:00)
    if (closeMinutesTotal <= openMinutesTotal) {
       closeMinutesTotal += 24 * 60; // Add 24 hours
    }

    if (currentMinutesTotal >= openMinutesTotal && currentMinutesTotal < closeMinutesTotal) {
      isOpenNow = true;
      break;
    }
  }

  if (isOpenNow) {
    return { isOpenNow: true, message: "Aberto agora" };
  } else {
    return { isOpenNow: false, message: "Fechado agora" };
  }
}
