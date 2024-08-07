export const getStartOfWeek = (date: Date) => {
    const day = date.getDay();
    const diff = (day < 1 ? -6 : 1) - day;
    return new Date(date.setDate(date.getDate() + diff));
  };
  
  export const getCurrentWeekRange = () => {
    const today = new Date();
    const startOfWeek = getStartOfWeek(today);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    return {
      start: startOfWeek.toDateString(),
      end: endOfWeek.toDateString(),
    };
  };
  
  export const formatWeekRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const startFormatted = startDate.toLocaleDateString('en-US', options);
    const endFormatted = endDate.toLocaleDateString('en-US', options);
    const weekNumber = getWeekNumber(startDate);
    return `${startFormatted} - ${endFormatted} [Week-${weekNumber}]`;
  };
  
  export const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };
  