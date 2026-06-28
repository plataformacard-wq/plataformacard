export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  type: string;
}

export async function getNationalHolidays(year: number): Promise<string[]> {
  try {
    const res = await fetch(`https://brasilapi.com.br/api/feriados/v1/${year}`, {
      next: { revalidate: 86400 } // cache for 24 hours
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch holidays from BrasilAPI for year ${year}: ${res.status}`);
      return [];
    }

    const holidays: Holiday[] = await res.json();
    return holidays.map(h => h.date);
  } catch (error) {
    console.error(`Error fetching holidays for year ${year}:`, error);
    return [];
  }
}

export async function getNationalHolidaysFull(year: number): Promise<Holiday[]> {
  try {
    const res = await fetch(`https://brasilapi.com.br/api/feriados/v1/${year}`, {
      next: { revalidate: 86400 } // cache for 24 hours
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch holidays from BrasilAPI for year ${year}: ${res.status}`);
      return [];
    }

    const holidays: Holiday[] = await res.json();
    return holidays;
  } catch (error) {
    console.error(`Error fetching holidays for year ${year}:`, error);
    return [];
  }
}
