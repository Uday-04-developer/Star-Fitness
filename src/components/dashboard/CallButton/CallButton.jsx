import { Phone } from 'lucide-react';
import LiquidButton from '@/components/common/LiquidButton/LiquidButton';

/**
 * tel: link with the same liquid hover as WhatsApp.
 */
const CallButton = ({ phoneNumber, label = 'Call' }) => {
  const digits = String(phoneNumber || '').replace(/\D/g, '');

  if (!digits) {
    return (
      <LiquidButton
        label={label}
        variant="secondary"
        size="sm"
        icon={Phone}
        disabled
        fullWidth
        hoverScale={1.03}
        aria-label="Call unavailable"
      />
    );
  }

  return (
    <LiquidButton
      href={`tel:${digits}`}
      label={label}
      variant="secondary"
      size="sm"
      icon={Phone}
      fullWidth
      hoverScale={1.03}
      aria-label={`Call ${phoneNumber}`}
      onClick={(event) => event.stopPropagation()}
    />
  );
};

export default CallButton;
