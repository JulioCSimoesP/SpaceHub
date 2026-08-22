/**
 * Retorna a data atual ou uma data informada no formato DD/MM/AAAA.
 * @param {Date} [date=new Date()]
 * @returns {string} Data formatada como DD/MM/AAAA
 */
export const getFormattedDate = (date = new Date()) => {
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    const day = String(targetDate.getDate()).padStart(2, '0');
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const year = targetDate.getFullYear();

    return `${day}/${month}/${year}`;
};