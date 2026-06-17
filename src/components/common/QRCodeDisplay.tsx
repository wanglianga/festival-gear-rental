import { QRCodeSVG } from 'qrcode.react';
import { useBrightMode } from '../../hooks/useBrightMode';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
  includeMargin?: boolean;
}

export const QRCodeDisplay = ({
  value,
  size = 200,
  bgColor,
  fgColor,
  includeMargin = true,
}: QRCodeDisplayProps) => {
  const brightMode = useBrightMode();

  const bg = bgColor || (brightMode ? '#FFFFFF' : '#FFFFFF');
  const fg = fgColor || '#000000';

  return (
    <div className="relative inline-block p-4 bg-white rounded-2xl shadow-2xl">
      <QRCodeSVG
        value={value}
        size={size}
        bgColor={bg}
        fgColor={fg}
        level="H"
        includeMargin={includeMargin}
      />
    </div>
  );
};
