export const Utils = {
    formatCurrency: (cents) => {
        const rawCents = parseInt(cents, 10) || 0;
        const formatted = (rawCents / 100).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        return formatted.replace(/\u00A0/g, ' ');
    },

    parseCurrency: (value) => {
        if (!value) return 0;
        const outputValue = parseInt(value.toString().replace(/\D/g, ''), 10);
        return isNaN(outputValue) ? 0 : outputValue;
    }
};