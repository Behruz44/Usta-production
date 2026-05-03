import { 
  Sheet, Package, Wrench, Ruler, Zap, Tool, Palette, Layers,
  Search, Phone, MapPin, Menu, X, Star, Truck, Shield, MessageCircle, 
  DollarSign, ArrowRight, Home, Grid, ChevronRight, Heart, ShoppingCart,
  Edit, Trash2, Plus, Upload, Image as ImageIcon
} from 'lucide-react';

export const categoryIcons = {
  'Гипсокартон': Sheet,
  'Сухие смеси': Package,
  'Саморезы': Wrench,
  'Профиль': Ruler,
  'Генераторы': Zap,
  'Инструменты': Tool,
  'Краски': Palette,
  'Утеплители': Layers,
};

export const getCategoryIcon = (categoryName) => {
  return categoryIcons[categoryName] || Package;
};

export {
  Sheet, Package, Wrench, Ruler, Zap, Tool, Palette, Layers,
  Search, Phone, MapPin, Menu, X, Star, Truck, Shield, MessageCircle,
  DollarSign, ArrowRight, Home, Grid, ChevronRight, Heart, ShoppingCart,
  Edit, Trash2, Plus, Upload, ImageIcon
};
