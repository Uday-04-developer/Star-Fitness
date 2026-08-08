import { MessageCircle } from 'lucide-react';
import LiquidButton from '@/components/common/LiquidButton/LiquidButton';
import { supabase } from '@/lib/supabaseClient';
import { buildWhatsAppLink } from '@/utils/whatsapp';

const WhatsAppButton = ({
  memberId,
  phoneNumber,
  message,
  label = 'WhatsApp',
  size = 'sm',
  fullWidth = false,
}) => {
  const handleClick = (event) => {
    event.stopPropagation();
    const url = buildWhatsAppLink(phoneNumber, message);
    window.open(url, '_blank', 'noopener,noreferrer');

    if (!memberId) {
      return;
    }

    // Fire-and-forget reminder log — never block opening WhatsApp.
    void supabase
      .from('reminder_log')
      .insert({
        member_id: memberId,
        channel: 'whatsapp',
      })
      .then(({ error }) => {
        if (error) {
          console.error(error);
        }
      });
  };

  return (
    <LiquidButton
      type="button"
      variant="whatsapp"
      size={size}
      label={label}
      icon={MessageCircle}
      onClick={handleClick}
      fullWidth={fullWidth}
      aria-label={`Send WhatsApp reminder to ${phoneNumber}`}
      hoverScale={1.03}
    />
  );
};

export default WhatsAppButton;
