/**
 * Service Abstraction Layer for Event Hall Reservation System.
 * Currently reads/writes to AppContext state / localStorage fallback.
 * Backend-ready: Replace inner methods with Axios/Fetch calls to Node.js/Express API.
 */

export const checkSlotOverlap = (existingSlots, targetDate, startTime, endTime) => {
  const targetStart = new Date(`${targetDate}T${startTime}`);
  const targetEnd = new Date(`${targetDate}T${endTime}`);

  return existingSlots.some(slot => {
    // Only check slots on the same date and active/approved statuses
    if (slot.date !== targetDate) return false;
    if (slot.status === 'Rejected' || slot.status === 'Cancelled') return false;

    const existingStart = new Date(`${slot.date}T${slot.startTime}`);
    const existingEnd = new Date(`${slot.date}T${slot.endTime}`);

    // Check time overlap: (StartA < EndB) and (EndA > StartB)
    return targetStart < existingEnd && targetEnd > existingStart;
  });
};

export const checkBlockedOverlap = (blockedSlots, hallId, targetDate, startTime, endTime) => {
  const targetStart = new Date(`${targetDate}T${startTime}`);
  const targetEnd = new Date(`${targetDate}T${endTime}`);

  return blockedSlots.some(block => {
    if (block.hallId !== hallId) return false;

    const blockStart = new Date(`${block.startDate}T${block.startTime || '00:00'}`);
    const blockEnd = new Date(`${block.endDate}T${block.endTime || '23:59'}`);

    return targetStart < blockEnd && targetEnd > blockStart;
  });
};
