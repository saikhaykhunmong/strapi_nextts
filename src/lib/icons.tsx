import { FiShoppingCart, FiMenu, FiMinus, FiMail, FiLock, FiUser } from "react-icons/fi";
import { IoAdd, IoScanOutline } from "react-icons/io5";
import { ImFacebook2 } from "react-icons/im";
import { FaSquareWhatsapp } from "react-icons/fa6";
import { TfiLocationPin } from "react-icons/tfi";
import { RxCross2 } from "react-icons/rx";
import { PiMoney } from "react-icons/pi";
import { MdQrCodeScanner } from "react-icons/md";
import { FaClockRotateLeft } from "react-icons/fa6";
import { FaArrowLeft } from "react-icons/fa6";

interface IconProps {
  className?: string;
}

export const CartIcon: React.FC<IconProps> = (props) => (
  <FiShoppingCart {...props} />
);

export const AddIcon: React.FC<IconProps> = (props) => (
  <IoAdd {...props} />
);

export const MenuIcon: React.FC<IconProps> = (props) => (
  <FiMenu {...props} />
);

export const MinusIcon: React.FC<IconProps> = (props) => (
  <FiMinus {...props} />
);

export const FacebookIcon: React.FC<IconProps> = (props) => (
  <ImFacebook2 {...props} />
);

export const WhatsappIcon: React.FC<IconProps> = (props) => (
  <FaSquareWhatsapp {...props} />
);

export const MailIcon: React.FC<IconProps> = (props) => (
  <FiMail {...props} />
);

export const LocationIcon: React.FC<IconProps> = (props) => (
  <TfiLocationPin {...props} />
);

export const LockIcon: React.FC<IconProps> = (props) => (
  <FiLock {...props} />
);

export const UserIcon: React.FC<IconProps> = (props) => (
  <FiUser {...props} />
);

export const CrossIcon: React.FC<IconProps> = (props) => (
  <RxCross2 {...props} />
);

export const MoneyIcon: React.FC<IconProps> = (props) => (
  <PiMoney {...props} />
);

export const ScanIcon: React.FC<IconProps> = (props) => (
  <IoScanOutline {...props} />
);
export const QRScanIcon: React.FC<IconProps> = (props) => (
  <MdQrCodeScanner {...props} />
);
export const ClockIcon: React.FC<IconProps> = (props) => (
  <FaClockRotateLeft {...props} />
);
export const LeftArrowIcon: React.FC<IconProps> = (props) => (
  <FaArrowLeft {...props} />
);
