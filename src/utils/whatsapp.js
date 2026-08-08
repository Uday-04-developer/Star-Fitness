export const buildWhatsAppLink = (phoneNumber, message) => {
  const digits = String(phoneNumber || '').replace(/\D/g, '');
  const withCountry = digits.length === 10 ? `91${digits}` : digits;
  const text = encodeURIComponent(message || '');
  return `https://wa.me/${withCountry}?text=${text}`;
};

export const getReminderMessage = (member) => {
  const name = member?.full_name || 'there';
  return `Hi ${name}, this is a friendly reminder from Star Fitness Gym that your membership is due for renewal. Reply here if you'd like to continue training with us.`;
};
