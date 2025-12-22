import Image from 'next/image'

type FacebookProps = {
  size?: string | number;
  className?: string;
};

const Facebook = ({ size = 24, className = '' }: FacebookProps) => {
  const sizeNum = typeof size === 'string' ? parseInt(size) : size;
  
  return (
    <Image
      src="/images/facebook-app-round-icon.svg"
      alt="Facebook"
      width={sizeNum}
      height={sizeNum}
      className={`${className} brightness-0 invert`}
      style={{ width: size, height: size }}
    />
  );
};

export default Facebook;

