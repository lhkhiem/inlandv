import Image from 'next/image'

type WechatProps = {
  size?: string | number;
  className?: string;
};

const Wechat = ({ size = 24, className = '' }: WechatProps) => {
  const sizeNum = typeof size === 'string' ? parseInt(size) : size;
  
  return (
    <Image
      src="/images/wechat-o-svgrepo-com.svg"
      alt="WeChat"
      width={sizeNum}
      height={sizeNum}
      className={`${className} brightness-0 invert`}
      style={{ width: size, height: size }}
    />
  );
};

export default Wechat;

