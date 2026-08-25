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

/**
 * Converte uma string no formato DD/MM/AAAA para um objeto Date à meia-noite (00:00:00).
 * @param {string} dateStr - Data no formato DD/MM/AAAA
 * @returns {Date}
 */
export const parseDateString = (dateStr) => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
};

/**
 * Verifica se duas faixas de datas se sobrepõem.
 * Duas faixas (A_start - A_end) e (B_start - B_end) se sobrepõem se:
 * A_start <= B_end && A_end >= B_start
 * @param {Date} startA
 * @param {Date} endA
 * @param {Date} startB
 * @param {Date} endB
 * @returns {boolean}
 */
export const isOverlapping = (startA, endA, startB, endB) => {
    return startA <= endB && endA >= startB;
};