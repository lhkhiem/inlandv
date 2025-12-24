import Image from 'next/image'

type TiktokProps = {
  size?: string | number;
  className?: string;
};

const Tiktok = ({ size = 24, className = '' }: TiktokProps) => {
  const sizeNum = typeof size === 'string' ? parseInt(size) : size;
  
  return (
    <Image
      src="/images/tiktok-circle-icon.svg"
      alt="TikTok"
      width={sizeNum}
      height={sizeNum}
      className={`${className} brightness-0 invert`}
      style={{ width: size, height: size }}
    />
  );
};

export default Tiktok;

