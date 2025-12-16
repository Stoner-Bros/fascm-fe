import QRCode from 'qrcode';

/**
 * Generate a QR code data URL from a string
 * @param text - The text/string to encode as QR code
 * @returns Promise that resolves to a data URL (base64 image)
 */
export async function generateQRCodeDataURL(text: string): Promise<string> {
  try {
    const dataURL = await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    });
    return dataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}
