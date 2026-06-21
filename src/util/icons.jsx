import {
  Briefcase,
  Gift,
  PlusCircle,
  ShoppingCart,
  Zap,
  Car,
  Film,
  Home,
  HeartPulse,
  PiggyBank,
  Wallet,
  CreditCard,
  Smartphone,
  Coffee,
  Plane,
  Book,
  Dumbbell,
  Shirt,
  Dog,
  GraduationCap,
  Tag,
} from "lucide-react";

export const ICONS = {
  briefcase: Briefcase,
  gift: Gift,
  "plus-circle": PlusCircle,
  "shopping-cart": ShoppingCart,
  zap: Zap,
  car: Car,
  film: Film,
  home: Home,
  "heart-pulse": HeartPulse,
  "piggy-bank": PiggyBank,
  wallet: Wallet,
  "credit-card": CreditCard,
  smartphone: Smartphone,
  coffee: Coffee,
  plane: Plane,
  book: Book,
  dumbbell: Dumbbell,
  shirt: Shirt,
  dog: Dog,
  "graduation-cap": GraduationCap,
  tag: Tag,
};

export const ICON_KEYS = Object.keys(ICONS);

export function CategoryIcon({ icon, ...props }) {
  const Icon = ICONS[icon] || Tag;
  return <Icon {...props} />;
}
