// Contact utilities for handling clickable contact actions

/**
 * Detect if the user is on a mobile device
 */
export const isMobileDevice = () => {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Detect if the user is on iOS
 */
export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

/**
 * Detect if the user is on Android
 */
export const isAndroid = () => {
  return /Android/i.test(navigator.userAgent);
};

/**
 * Validate and format phone number
 */
export const formatPhoneNumber = (phone) => {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // Ensure it starts with + if it doesn't already
  if (cleaned && !cleaned.startsWith('+')) {
    return `+${cleaned}`;
  }

  return cleaned;
};

/**
 * Validate and format username (remove @ if present)
 */
export const formatUsername = (username) => {
  return username.replace(/^@/, '');
};

/**
 * Generate WhatsApp URL
 */
export const generateWhatsAppURL = (phone) => {
  const formattedPhone = formatPhoneNumber(phone);
  const phoneNumber = formattedPhone.replace(/[^\d]/g, ''); // Remove + for WhatsApp

  if (isMobileDevice()) {
    // Try native app first
    return `whatsapp://send?phone=${phoneNumber}`;
  } else {
    // Use web version for desktop
    return `https://web.whatsapp.com/send?phone=${phoneNumber}`;
  }
};

/**
 * Generate Telegram URL
 */
export const generateTelegramURL = (username) => {
  const formattedUsername = formatUsername(username);

  if (isMobileDevice()) {
    // Try native app first
    return `tg://resolve?domain=${formattedUsername}`;
  } else {
    // Use web version
    return `https://t.me/${formattedUsername}`;
  }
};

/**
 * Generate Instagram URL
 */
export const generateInstagramURL = (username) => {
  const formattedUsername = formatUsername(username);

  if (isMobileDevice()) {
    // Try native app first
    return `instagram://user?username=${formattedUsername}`;
  } else {
    // Use web version
    return `https://instagram.com/${formattedUsername}`;
  }
};

/**
 * Generate Email URL
 */
export const generateEmailURL = (email) => {
  return `mailto:${email}`;
};

/**
 * Generate Phone URL
 */
export const generatePhoneURL = (phone) => {
  const formattedPhone = formatPhoneNumber(phone);
  return `tel:${formattedPhone}`;
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    // Modern Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Main function to handle contact clicks
 */
export const handleContactClick = async (contactType, contactValue, onSuccess, onError) => {
  try {
    let url = '';
    let fallbackText = contactValue;
    let successMessage = '';

    switch (contactType.toLowerCase()) {
      case 'whatsapp':
        url = generateWhatsAppURL(contactValue);
        fallbackText = formatPhoneNumber(contactValue);
        successMessage = isMobileDevice() ? 'Opening WhatsApp...' : 'Opening WhatsApp Web...';
        break;

      case 'telegram':
        url = generateTelegramURL(contactValue);
        fallbackText = `@${formatUsername(contactValue)}`;
        successMessage = isMobileDevice() ? 'Opening Telegram...' : 'Opening Telegram Web...';
        break;

      case 'instagram':
        url = generateInstagramURL(contactValue);
        fallbackText = `@${formatUsername(contactValue)}`;
        successMessage = isMobileDevice() ? 'Opening Instagram...' : 'Opening Instagram Web...';
        break;

      case 'email':
        url = generateEmailURL(contactValue);
        fallbackText = contactValue;
        successMessage = 'Opening email client...';
        break;

      case 'phone':
        if (isMobileDevice()) {
          url = generatePhoneURL(contactValue);
          successMessage = 'Opening dialer...';
        } else {
          // For desktop, just copy the phone number
          const copied = await copyToClipboard(formatPhoneNumber(contactValue));
          if (copied) {
            onSuccess?.('Phone number copied to clipboard!');
          } else {
            onError?.('Failed to copy phone number');
          }
          return;
        }
        break;

      default:
        // Unknown contact type, just copy the value
        const copied = await copyToClipboard(contactValue);
        if (copied) {
          onSuccess?.('Contact info copied to clipboard!');
        } else {
          onError?.('Failed to copy contact info');
        }
        return;
    }

    // Try to open the URL
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';

      // For mobile deep links, we need to handle fallbacks
      if (isMobileDevice() && (contactType === 'whatsapp' || contactType === 'telegram' || contactType === 'instagram')) {
        // Try to open the native app
        window.location.href = url;

        // Fallback to web version after a delay if app doesn't open
        setTimeout(() => {
          let webUrl = '';
          switch (contactType.toLowerCase()) {
            case 'whatsapp':
              webUrl = `https://web.whatsapp.com/send?phone=${formatPhoneNumber(contactValue).replace(/[^\d]/g, '')}`;
              break;
            case 'telegram':
              webUrl = `https://t.me/${formatUsername(contactValue)}`;
              break;
            case 'instagram':
              webUrl = `https://instagram.com/${formatUsername(contactValue)}`;
              break;
          }
          if (webUrl) {
            window.open(webUrl, '_blank');
          }
        }, 1000);

        onSuccess?.(successMessage);
      } else {
        // For desktop or email/phone, open normally
        if (contactType === 'email' || contactType === 'phone') {
          window.location.href = url;
        } else {
          window.open(url, '_blank');
        }
        onSuccess?.(successMessage);
      }
    }

  } catch (error) {
    console.error('Error handling contact click:', error);

    // Fallback: copy to clipboard
    const copied = await copyToClipboard(fallbackText || contactValue);
    if (copied) {
      onSuccess?.('Contact info copied to clipboard!');
    } else {
      onError?.('Failed to open contact and copy to clipboard');
    }
  }
};