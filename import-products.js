import sequelize from './config/database.js';
import Product from './models/Product.js';
import Category from './models/Category.js';

const productsData = [
  { id: 1, title: 'Клей AlinEX SET 300, 25 кг', brand: 'AlinEX', weight: '25 кг', price: 535, currency: 'сом', slug: 'kley-alinex-set-300-25-kg', sku: 'ALI-001-25', image: 'kley-alinex-set-300-25-kg.jpg' },
  { id: 2, title: 'Клей AlinEX SET 301, 25 кг', brand: 'AlinEX', weight: '25 кг', price: 630, currency: 'сом', slug: 'kley-alinex-set-301-25-kg', sku: 'ALI-002-25', image: 'kley-alinex-set-301-25-kg.jpg' },
  { id: 3, title: 'Клей AlinEX SET 302, 25 кг', brand: 'AlinEX', weight: '25 кг', price: 880, currency: 'сом', slug: 'kley-alinex-set-302-25-kg', sku: 'ALI-003-25', image: 'kley-alinex-set-302-25-kg.jpg' },
  { id: 4, title: 'Клей AlinEX SET 305, 25 кг', brand: 'AlinEX', weight: '25 кг', price: 1300, currency: 'сом', slug: 'kley-alinex-set-305-25-kg', sku: 'ALI-004-25', image: 'kley-alinex-set-305-25-kg.jpg' },
  { id: 5, title: 'Клей AlinEX SET 307, 25 кг', brand: 'AlinEX', weight: '25 кг', price: 974, currency: 'сом', slug: 'kley-alinex-set-307-25-kg', sku: 'ALI-005-25', image: 'kley-alinex-set-307-25-kg.jpg' },
  { id: 6, title: 'Клей AlinEX SET 308, 25 кг', brand: 'AlinEX', weight: '25 кг', price: 1082, currency: 'сом', slug: 'kley-alinex-set-308-25-kg', sku: 'ALI-006-25', image: 'kley-alinex-set-308-25-kg.jpg' },
  { id: 7, title: 'Клей AlinEX UNIFIX, 25 кг', brand: 'AlinEX', weight: '25 кг', price: 756, currency: 'сом', slug: 'kley-alinex-unifix-25-kg', sku: 'ALI-007-25', image: 'kley-alinex-unifix-25-kg.jpg' },
  { id: 8, title: 'Шпатлевка AlinEX FINISH, 25кг (полимерная)', brand: 'AlinEX', weight: '25 кг', price: 898, currency: 'сом', slug: 'shpatlevka-alinex-finish-25kg-polimernaya', sku: 'ALI-008-25', image: 'shpatlevka-alinex-finish-25kg-polimernaya.jpg' },
  { id: 9, title: 'Шпатлевка AlinEX FINISH AR, 1 кг', brand: 'AlinEX', weight: '1 кг', price: 161, currency: 'сом', slug: 'shpatlevka-alinex-finish-ar-1-kg', sku: 'ALI-009-1', image: 'shpatlevka-alinex-finish-ar-1-kg.jpg' },
  { id: 10, title: 'Шпатлевка AlinEX FINISH AR, 7,5 кг', brand: 'AlinEX', weight: '7,5 кг', price: 878, currency: 'сом', slug: 'shpatlevka-alinex-finish-ar-7-5-kg', sku: 'ALI-010-75', image: 'shpatlevka-alinex-finish-ar-7-5-kg.jpg' },
  { id: 11, title: 'Шпатлевка AlinEX FINISH AR, 20 кг', brand: 'AlinEX', weight: '20 кг', price: 1700, currency: 'сом', slug: 'shpatlevka-alinex-finish-ar-20-kg', sku: 'ALI-011-20', image: 'shpatlevka-alinex-finish-ar-20-kg.jpg' },
  { id: 12, title: 'Шпатлевка AlinEX FINISH Premium, 25кг', brand: 'AlinEX', weight: '25 кг', price: 750, currency: 'сом', slug: 'shpatlevka-alinex-finish-premium-25kg', sku: 'ALI-012-25', image: 'shpatlevka-alinex-finish-premium-25kg.jpg' },
  { id: 13, title: 'Шпатлевка AlinEX FINISH WP, 25кг', brand: 'AlinEX', weight: '25 кг', price: 951, currency: 'сом', slug: 'shpatlevka-alinex-finish-wp-25kg', sku: 'ALI-013-25', image: 'shpatlevka-alinex-finish-wp-25kg.jpg' },
  { id: 14, title: 'Шпатлевка AlinEX FINISH, 5кг (полимерная)', brand: 'AlinEX', weight: '5 кг', price: 225, currency: 'сом', slug: 'shpatlevka-alinex-finish-5kg-polimernaya', sku: 'ALI-014-5', image: 'shpatlevka-alinex-finish-5kg-polimernaya.jpg' },
  { id: 15, title: 'Шпатлевка AlinEX GLATT, 25кг', brand: 'AlinEX', weight: '25 кг', price: 870, currency: 'сом', slug: 'shpatlevka-alinex-glatt-25kg', sku: 'ALI-015-25', image: 'shpatlevka-alinex-glatt-25kg.jpg' },
  { id: 16, title: 'Шпатлевка AlinEX GLATT PLUS, 25кг', brand: 'AlinEX', weight: '25 кг', price: 1258, currency: 'сом', slug: 'shpatlevka-alinex-glatt-plus-25kg', sku: 'ALI-016-25', image: 'shpatlevka-alinex-glatt-plus-25kg.jpg' },
  { id: 17, title: 'Шпатлевка AlinEX GLATT, 5кг', brand: 'AlinEX', weight: '5 кг', price: 250, currency: 'сом', slug: 'shpatlevka-alinex-glatt-5kg', sku: 'ALI-017-5', image: 'shpatlevka-alinex-glatt-5kg.jpg' },
  { id: 18, title: 'Штукатурка AlinEX GRENDER, 30 кг', brand: 'AlinEX', weight: '30 кг', price: 600, currency: 'сом', slug: 'shtukaturka-alinex-grender-30-kg', sku: 'ALI-018-30', image: 'shtukaturka-alinex-grender-30-kg.jpg' },
  { id: 19, title: 'Штукатурка AlinEX GRENDER WP, 25 кг', brand: 'AlinEX', weight: '25 кг', price: 600, currency: 'сом', slug: 'shtukaturka-alinex-grender-wp-25-kg', sku: 'ALI-019-25', image: 'shtukaturka-alinex-grender-wp-25-kg.jpg' },
  { id: 20, title: 'Наливной пол AlinEX LEVEL 1, 25кг', brand: 'AlinEX', weight: '25 кг', price: 660, currency: 'сом', slug: 'nalivnoy-pol-alinex-level-1-25kg', sku: 'ALI-020-25', image: 'nalivnoy-pol-alinex-level-1-25kg.jpg' },
  { id: 21, title: 'Наливной пол AlinEX LEVEL 2, 25кг', brand: 'AlinEX', weight: '25 кг', price: 830, currency: 'сом', slug: 'nalivnoy-pol-alinex-level-2-25kg', sku: 'ALI-021-25', image: 'nalivnoy-pol-alinex-level-2-25kg.jpg' },
  { id: 22, title: 'Наливной пол AlinEX LEVEL 3, 25кг', brand: 'AlinEX', weight: '25 кг', price: 1097, currency: 'сом', slug: 'nalivnoy-pol-alinex-level-3-25kg', sku: 'ALI-022-25', image: 'nalivnoy-pol-alinex-level-3-25kg.jpg' },
  { id: 23, title: 'Наливной пол AlinEX LEVEL GYPS, 25кг', brand: 'AlinEX', weight: '25 кг', price: 610, currency: 'сом', slug: 'nalivnoy-pol-alinex-level-gyps-25kg', sku: 'ALI-023-25', image: 'nalivnoy-pol-alinex-level-gyps-25kg.jpg' },
  { id: 24, title: 'Наливной пол AlinEX UNILEVEL, 25 кг', brand: 'AlinEX', weight: '25 кг', price: 642, currency: 'сом', slug: 'nalivnoy-pol-alinex-unilevel-25-kg', sku: 'ALI-024-25', image: 'nalivnoy-pol-alinex-unilevel-25-kg.jpg' },
  { id: 25, title: 'Смесь AlinEX AQUAFLEX, 25кг', brand: 'AlinEX', weight: '25 кг', price: 1883, currency: 'сом', slug: 'smes-alinex-aquaflex-25kg', sku: 'ALI-025-25', image: 'smes-alinex-aquaflex-25kg.jpg' },
  { id: 26, title: 'Жидкая добавка AlinEX AQUAPROOF, 10 кг', brand: 'AlinEX', weight: '10 кг', price: 5553, currency: 'сом', slug: 'zhidkaya-dobavka-alinex-aquaproof-10-kg', sku: 'ALI-026-10', image: 'zhidkaya-dobavka-alinex-aquaproof-10-kg.jpg' },
  { id: 27, title: 'Сухая смесь AlinEX AQUAPROOF, 25кг', brand: 'AlinEX', weight: '25 кг', price: 615, currency: 'сом', slug: 'suhaya-smes-alinex-aquaproof-25kg', sku: 'ALI-027-25', image: 'suhaya-smes-alinex-aquaproof-25kg.jpg' },
  { id: 28, title: 'Штукатурка AlinEX AQUAPLASTЕР, 25кг', brand: 'AlinEX', weight: '25 кг', price: 1006, currency: 'сом', slug: 'shtukaturka-alinex-aquaplaster-25kg', sku: 'ALI-028-25', image: 'shtukaturka-alinex-aquaplaster-25kg.jpg' },
  { id: 29, title: 'Штукатурка AlinEX Forman, 20 кг', brand: 'AlinEX', weight: '20 кг', price: 347, currency: 'сом', slug: 'shtukaturka-alinex-forman-20-kg', sku: 'ALI-029-20', image: 'shtukaturka-alinex-forman-20-kg.jpg' },
  { id: 30, title: 'Штукатурка AlinEX TERMOPLASTER, 25кг', brand: 'AlinEX', weight: '25 кг', price: 700, currency: 'сом', slug: 'shtukaturka-alinex-termoplaster-25kg', sku: 'ALI-030-25', image: 'shtukaturka-alinex-termoplaster-25kg.jpg' },
  { id: 31, title: 'Штукатурка AlinEX UNIPLASTER M100, 25кг', brand: 'AlinEX', weight: '25 кг', price: 640, currency: 'сом', slug: 'shtukaturka-alinex-uniplaster-m100-25kg', sku: 'ALI-031-25', image: 'shtukaturka-alinex-uniplaster-m100-25kg.jpg' },
  { id: 32, title: 'Грунтовка AlinEX PRIMER, 10 кг', brand: 'AlinEX', weight: '10 кг', price: 950, currency: 'сом', slug: 'gruntovka-alinex-primer-10-kg', sku: 'ALI-032-10', image: 'gruntovka-alinex-primer-10-kg.jpg' },
  { id: 33, title: 'Грунтовка AlinEX PRIMER-2, 5 кг', brand: 'AlinEX', weight: '5 кг', price: 834, currency: 'сом', slug: 'gruntovka-alinex-primer-2-5-kg', sku: 'ALI-033-5', image: 'gruntovka-alinex-primer-2-5-kg.jpg' },
  { id: 34, title: 'Грунтовка AlinEX PRIMER-3, 15 кг', brand: 'AlinEX', weight: '15 кг', price: 2092, currency: 'сом', slug: 'gruntovka-alinex-primer-3-15-kg', sku: 'ALI-034-15', image: 'gruntovka-alinex-primer-3-15-kg.jpg' },
  { id: 35, title: 'Грунтовка AlinEX PRIMER-3, 7 кг', brand: 'AlinEX', weight: '7 кг', price: 1046, currency: 'сом', slug: 'gruntovka-alinex-primer-3-7-kg', sku: 'ALI-035-7', image: 'gruntovka-alinex-primer-3-7-kg.jpg' },
  { id: 36, title: 'Декоративная штукатурка AlinEX FORTRESS, 25 кг', brand: 'AlinEX', weight: '25 кг', price: 1146, currency: 'сом', slug: 'dekorativnaya-shtukaturka-alinex-fortress-25-kg', sku: 'ALI-036-25', image: 'dekorativnaya-shtukaturka-alinex-fortress-25-kg.jpg' },
  { id: 37, title: 'Декоративная штукатурка AlinEX MUNFORT F 2,0, 25 кг', brand: 'AlinEX', weight: '25 кг', price: 951, currency: 'сом', slug: 'dekorativnaya-shtukaturka-alinex-munfort-f-2-0-25-kg', sku: 'ALI-037-25', image: 'dekorativnaya-shtukaturka-alinex-munfort-f-2-0-25-kg.jpg' },
  { id: 38, title: 'Декоративная штукатурка AlinEX MUNFORT F 2,5, 25 кг', brand: 'AlinEX', weight: '25 кг', price: 898, currency: 'сом', slug: 'dekorativnaya-shtukaturka-alinex-munfort-f-2-5-25-kg', sku: 'ALI-038-25', image: 'dekorativnaya-shtukaturka-alinex-munfort-f-2-5-25-kg.jpg' },
  { id: 39, title: 'Декоративная штукатурка AlinEX MUNFORT F 3,5, 25 кг', brand: 'AlinEX', weight: '25 кг', price: 910, currency: 'сом', slug: 'dekorativnaya-shtukaturka-alinex-munfort-f-3-5-25-kg', sku: 'ALI-039-25', image: 'dekorativnaya-shtukaturka-alinex-munfort-f-3-5-25-kg.jpg' },
  { id: 40, title: 'Затирка AlinEX FIXLINE, 2 кг белая', brand: 'AlinEX', weight: '2 кг', price: 286, currency: 'сом', slug: 'zatirka-alinex-fixline-2-kg-belaya', sku: 'ALI-040-2', image: 'zatirka-alinex-fixline-2-kg-belaya.jpg' },
  { id: 41, title: 'Затирка AlinEX FIXLINE, 2 кг бежевая', brand: 'AlinEX', weight: '2 кг', price: 286, currency: 'сом', slug: 'zatirka-alinex-fixline-2-kg-bezhevaya', sku: 'ALI-041-2', image: 'zatirka-alinex-fixline-2-kg-bezhevaya.jpg' },
  { id: 42, title: 'Затирка AlinEX FIXLINE, 2 кг серая', brand: 'AlinEX', weight: '2 кг', price: 286, currency: 'сом', slug: 'zatirka-alinex-fixline-2-kg-seraya', sku: 'ALI-042-2', image: 'zatirka-alinex-fixline-2-kg-seraya.jpg' },
  { id: 43, title: 'Затирка AlinEX FIXLINE, 2 кг светло-коричневая', brand: 'AlinEX', weight: '2 кг', price: 286, currency: 'сом', slug: 'zatirka-alinex-fixline-2-kg-svetlo-korichnevaya', sku: 'ALI-043-2', image: 'zatirka-alinex-fixline-2-kg-svetlo-korichnevaya.jpg' },
  { id: 44, title: 'Затирка AlinEX FIXLINE, 2 кг черная', brand: 'AlinEX', weight: '2 кг', price: 286, currency: 'сом', slug: 'zatirka-alinex-fixline-2-kg-chernaya', sku: 'ALI-044-2', image: 'zatirka-alinex-fixline-2-kg-chernaya.jpg' },
  { id: 45, title: 'Затирка AlinEX FIXLINE 2 кг темно-коричневая', brand: 'AlinEX', weight: '2 кг', price: 286, currency: 'сом', slug: 'zatirka-alinex-fixline-2-kg-temno-korichnevaya', sku: 'ALI-045-2', image: 'zatirka-alinex-fixline-2-kg-temno-korichnevaya.jpg' },
  { id: 46, title: 'Затирка AlinEX FIXLINE 4 кг бежевая', brand: 'AlinEX', weight: '4 кг', price: 530, currency: 'сом', slug: 'zatirka-alinex-fixline-4-kg-bezhevaya', sku: 'ALI-046-4', image: 'zatirka-alinex-fixline-4-kg-bezhevaya.jpg' },
  { id: 47, title: 'Затирка AlinEX FIXLINE 4 кг белая', brand: 'AlinEX', weight: '4 кг', price: 530, currency: 'сом', slug: 'zatirka-alinex-fixline-4-kg-belaya', sku: 'ALI-047-4', image: 'zatirka-alinex-fixline-4-kg-belaya.jpg' },
  { id: 48, title: 'Затирка AlinEX FIXLINE 4 кг темно-коричневая', brand: 'AlinEX', weight: '4 кг', price: 530, currency: 'сом', slug: 'zatirka-alinex-fixline-4-kg-temno-korichnevaya', sku: 'ALI-048-4', image: 'zatirka-alinex-fixline-4-kg-temno-korichnevaya.jpg' },
  { id: 49, title: 'Затирка AlinEX FIXLINE 4 кг серая', brand: 'AlinEX', weight: '4 кг', price: 530, currency: 'сом', slug: 'zatirka-alinex-fixline-4-kg-seraya', sku: 'ALI-049-4', image: 'zatirka-alinex-fixline-4-kg-seraya.jpg' },
  { id: 50, title: 'Затирка AlinEX FIXLINE 4 кг черная', brand: 'AlinEX', weight: '4 кг', price: 530, currency: 'сом', slug: 'zatirka-alinex-fixline-4-kg-chernaya', sku: 'ALI-050-4', image: 'zatirka-alinex-fixline-4-kg-chernaya.jpg' },
  { id: 51, title: 'Затирка AlinEX FIXLINE 4 кг светло-коричневая', brand: 'AlinEX', weight: '4 кг', price: 530, currency: 'сом', slug: 'zatirka-alinex-fixline-4-kg-svetlo-korichnevaya', sku: 'ALI-051-4', image: 'zatirka-alinex-fixline-4-kg-svetlo-korichnevaya.jpg' },
  { id: 52, title: 'Затирка AlinEX FIXLINE 25 кг серая', brand: 'AlinEX', weight: '25 кг', price: 1300, currency: 'сом', slug: 'zatirka-alinex-fixline-25-kg-seraya', sku: 'ALI-052-25', image: 'zatirka-alinex-fixline-25-kg-seraya.jpg' },
  { id: 53, title: 'Затирка AlinEX FIXLINE 25 кг белая', brand: 'AlinEX', weight: '25 кг', price: 1400, currency: 'сом', slug: 'zatirka-alinex-fixline-25-kg-belaya', sku: 'ALI-053-25', image: 'zatirka-alinex-fixline-25-kg-belaya.jpg' },
  { id: 54, title: 'Затирка AlinEX JOINT, 25 кг', brand: 'AlinEX', weight: '25 кг', price: 1342, currency: 'сом', slug: 'zatirka-alinex-joint-25-kg', sku: 'ALI-054-25', image: 'zatirka-alinex-joint-25-kg.jpg' },
  { id: 55, title: 'Затирка AlinEX JOINT, 5 кг', brand: 'AlinEX', weight: '5 кг', price: 368, currency: 'сом', slug: 'zatirka-alinex-joint-5-kg', sku: 'ALI-055-5', image: 'zatirka-alinex-joint-5-kg.jpg' },
  { id: 56, title: 'Клей НАШИ "Крепость", 25 кг', brand: 'Наши', weight: '25 кг', price: 410, currency: 'сом', slug: 'kley-nashi-krepost-25-kg', sku: 'НАШ-056-25', image: 'kley-nashi-krepost-25-kg.jpg' },
  { id: 57, title: 'Клей НАШИ "ТЕРМОС", 25 кг', brand: 'Наши', weight: '25 кг', price: 710, currency: 'сом', slug: 'kley-nashi-termos-25-kg', sku: 'НАШ-057-25', image: 'kley-nashi-termos-25-kg.jpg' },
  { id: 58, title: 'Клей НАШИ Аман 25 кг', brand: 'Наши', weight: '25 кг', price: 341, currency: 'сом', slug: 'kley-nashi-aman-25-kg', sku: 'НАШ-058-25', image: 'kley-nashi-aman-25-kg.jpg' },
  { id: 59, title: 'Клей НАШИ "МАСТАК", 25 кг', brand: 'Наши', weight: '25 кг', price: 450, currency: 'сом', slug: 'kley-nashi-mastak-25-kg', sku: 'НАШ-059-25', image: 'kley-nashi-mastak-25-kg.jpg' },
  { id: 60, title: 'Наливной пол НАШИ "Горизонт", 25 кг', brand: 'Наши', weight: '25 кг', price: 500, currency: 'сом', slug: 'nalivnoy-pol-nashi-gorizont-25-kg', sku: 'НАШ-060-25', image: 'nalivnoy-pol-nashi-gorizont-25-kg.jpg' },
  { id: 61, title: 'Наливной пол НАШИ "Нивелир", 25кг', brand: 'Наши', weight: '25 кг', price: 690, currency: 'сом', slug: 'nalivnoy-pol-nashi-nivelir-25kg', sku: 'НАШ-061-25', image: 'nalivnoy-pol-nashi-nivelir-25kg.jpg' },
  { id: 62, title: 'Шпатлевка НАШИ "УЮТ", 25кг', brand: 'Наши', weight: '25 кг', price: 590, currency: 'сом', slug: 'shpatlevka-nashi-uyut-25kg', sku: 'НАШ-062-25', image: 'shpatlevka-nashi-uyut-25kg.jpg' },
  { id: 63, title: 'Шпатлевка НАШИ Кайсар 25 кг', brand: 'Наши', weight: '25 кг', price: 370, currency: 'сом', slug: 'shpatlevka-nashi-kaysar-25-kg', sku: 'НАШ-063-25', image: 'shpatlevka-nashi-kaysar-25-kg.jpg' },
  { id: 64, title: 'Штукатурка НАШИ "Геркулес" (Гипсовка), 30 кг', brand: 'Наши', weight: '30 кг', price: 415, currency: 'сом', slug: 'shtukaturka-nashi-gerkules-gipsovka-30-kg', sku: 'НАШ-064-30', image: 'shtukaturka-nashi-gerkules-gipsovka-30-kg.jpg' },
  { id: 65, title: 'Штукатурка НАШИ "КОМФОРТ плюс", 25кг', brand: 'Наши', weight: '25 кг', price: 535, currency: 'сом', slug: 'shtukaturka-nashi-komfort-plyus-25kg', sku: 'НАШ-065-25', image: 'shtukaturka-nashi-komfort-plyus-25kg.jpg' },
  { id: 66, title: 'Грунтовка НАШИ "ДРАЙВ", 1 кг банка', brand: 'Наши', weight: '1 кг', price: 350, currency: 'сом', slug: 'gruntovka-nashi-drayv-1-kg-banka', sku: 'НАШ-066-1', image: 'gruntovka-nashi-drayv-1-kg-banka.jpg' },
  { id: 67, title: 'Грунтовка НАШИ "ДРАЙВ", 0,5 кг банка', brand: 'Наши', weight: '0,5 кг', price: 530, currency: 'сом', slug: 'gruntovka-nashi-drayv-0-5-kg-banka', sku: 'НАШ-067-05', image: 'gruntovka-nashi-drayv-0-5-kg-banka.jpg' },
  { id: 68, title: 'Стяжка НАШИ "Уровень", 25кг', brand: 'Наши', weight: '25 кг', price: 730, currency: 'сом', slug: 'styazhka-nashi-uroven-25kg', sku: 'НАШ-068-25', image: 'styazhka-nashi-uroven-25kg.jpg' },
  { id: 69, title: 'Шпатлевка НАШИ "МАГМА", 25кг', brand: 'Наши', weight: '25 кг', price: 550, currency: 'сом', slug: 'shpatlevka-nashi-magma-25kg', sku: 'НАШ-069-25', image: 'shpatlevka-nashi-magma-25kg.jpg' },
  { id: 70, title: 'Шпатлевка НАШИ "РЕКОРД", 25кг', brand: 'Наши', weight: '25 кг', price: 600, currency: 'сом', slug: 'shpatlevka-nashi-rekord-25kg', sku: 'НАШ-070-25', image: 'shpatlevka-nashi-rekord-25kg.jpg' },
  { id: 71, title: 'Штукатурка НАШИ "ДОЖДИК" Ф2,5, 25кг', brand: 'Наши', weight: '25 кг', price: 582, currency: 'сом', slug: 'shtukaturka-nashi-dozhdik-f2-5-25kg', sku: 'НАШ-071-25', image: 'shtukaturka-nashi-dozhdik-f2-5-25kg.jpg' },
  { id: 72, title: 'Штукатурка НАШИ "ДОЖДИК" Ф3,0, 25кг', brand: 'Наши', weight: '25 кг', price: 530, currency: 'сом', slug: 'shtukaturka-nashi-dozhdik-f3-0-25kg', sku: 'НАШ-072-25', image: 'shtukaturka-nashi-dozhdik-f3-0-25kg.jpg' },
  { id: 73, title: 'Штукатурка НАШИ "СКАЛА", 25 кг', brand: 'Наши', weight: '25 кг', price: 520, currency: 'сом', slug: 'shtukaturka-nashi-skala-25-kg', sku: 'НАШ-073-25', image: 'shtukaturka-nashi-skala-25-kg.jpg' },
  { id: 74, title: 'Штукатурка НАШИ "СЛОЙ", 25 кг', brand: 'Наши', weight: '25 кг', price: 528, currency: 'сом', slug: 'shtukaturka-nashi-sloy-25-kg', sku: 'НАШ-074-25', image: 'shtukaturka-nashi-sloy-25-kg.jpg' },
  { id: 75, title: 'Стяжка НАШИ "Ударник", 25кг', brand: 'Наши', weight: '25 кг', price: 1014, currency: 'сом', slug: 'styazhka-nashi-udarnik-25kg', sku: 'НАШ-075-25', image: 'styazhka-nashi-udarnik-25kg.jpg' },
  { id: 76, title: 'Штукатурка НАШИ "РЕЛЬЕФ", 25 кг', brand: 'Наши', weight: '25 кг', price: 309, currency: 'сом', slug: 'shtukaturka-nashi-relef-25-kg', sku: 'НАШ-076-25', image: 'shtukaturka-nashi-relef-25-kg.jpg' },
  { id: 77, title: 'Затирка НАШИ "Линия", 4 кг', brand: 'Наши', weight: '4 кг', price: 309, currency: 'сом', slug: 'zatirka-nashi-liniya-4-kg', sku: 'НАШ-077-4', image: 'zatirka-nashi-liniya-4-kg.jpg' },
  { id: 78, title: 'UNI База AA 4,16 кг', brand: 'Alina Paint', weight: '4,16 кг', price: 1022, currency: 'сом', slug: 'uni-baza-aa-4-16-kg', sku: 'ALI-078-416', image: 'uni-baza-aa-4-16-kg.jpg' },
  { id: 79, title: 'UNI База AA 13,86 кг', brand: 'Alina Paint', weight: '13,86 кг', price: 3020, currency: 'сом', slug: 'uni-baza-aa-13-86-kg', sku: 'ALI-079-1386', image: 'uni-baza-aa-13-86-kg.jpg' },
  { id: 80, title: 'UNI База B 3,8 кг', brand: 'Alina Paint', weight: '3,8 кг', price: 888, currency: 'сом', slug: 'uni-baza-b-3-8-kg', sku: 'ALI-080-38', image: 'uni-baza-b-3-8-kg.jpg' },
  { id: 81, title: 'UNI База B 12,68 кг', brand: 'Alina Paint', weight: '12,68 кг', price: 2690, currency: 'сом', slug: 'uni-baza-b-12-68-kg', sku: 'ALI-081-1268', image: 'uni-baza-b-12-68-kg.jpg' },
  { id: 82, title: 'UNI База C 3,44 кг', brand: 'Alina Paint', weight: '3,44 кг', price: 955, currency: 'сом', slug: 'uni-baza-c-3-44-kg', sku: 'ALI-082-344', image: 'uni-baza-c-3-44-kg.jpg' },
  { id: 83, title: 'UNI База C 11,52 кг', brand: 'Alina Paint', weight: '11,52 кг', price: 2668, currency: 'сом', slug: 'uni-baza-c-11-52-kg', sku: 'ALI-083-1152', image: 'uni-baza-c-11-52-kg.jpg' },
  { id: 84, title: 'UNDINA База AA 4 кг', brand: 'Alina Paint', weight: '4 кг', price: 1097, currency: 'сом', slug: 'undina-baza-aa-4-kg', sku: 'ALI-084-4', image: 'undina-baza-aa-4-kg.jpg' },
  { id: 85, title: 'UNDINA База AA 15 кг', brand: 'Alina Paint', weight: '15 кг', price: 3845, currency: 'сом', slug: 'undina-baza-aa-15-kg', sku: 'ALI-085-15', image: 'undina-baza-aa-15-kg.jpg' },
  { id: 86, title: 'UNDINA База B 3,8 кг', brand: 'Alina Paint', weight: '3,8 кг', price: 931, currency: 'сом', slug: 'undina-baza-b-3-8-kg', sku: 'ALI-086-38', image: 'undina-baza-b-3-8-kg.jpg' },
  { id: 87, title: 'UNDINA База B 12,68 кг', brand: 'Alina Paint', weight: '12,68 кг', price: 2998, currency: 'сом', slug: 'undina-baza-b-12-68-kg', sku: 'ALI-087-1268', image: 'undina-baza-b-12-68-kg.jpg' },
  { id: 88, title: 'UNDINA База C 3,44 кг', brand: 'Alina Paint', weight: '3,44 кг', price: 1002, currency: 'сом', slug: 'undina-baza-c-3-44-kg', sku: 'ALI-088-344', image: 'undina-baza-c-3-44-kg.jpg' },
  { id: 89, title: 'UNDINA База C 11,52 кг', brand: 'Alina Paint', weight: '11,52 кг', price: 3247, currency: 'сом', slug: 'undina-baza-c-11-52-kg', sku: 'ALI-089-1152', image: 'undina-baza-c-11-52-kg.jpg' },
  { id: 90, title: 'Грунтовка Alina Paint PRIMA 10 кг', brand: 'Alina Paint', weight: '10 кг', price: 792, currency: 'сом', slug: 'gruntovka-alina-paint-prima-10-kg', sku: 'ALI-090-10', image: 'gruntovka-alina-paint-prima-10-kg.jpg' },
  { id: 91, title: 'Грунтовка Alina Paint PRIMA 5 кг', brand: 'Alina Paint', weight: '5 кг', price: 450, currency: 'сом', slug: 'gruntovka-alina-paint-prima-5-kg', sku: 'ALI-091-5', image: 'gruntovka-alina-paint-prima-5-kg.jpg' },
  { id: 92, title: 'NORMA Arctic, 15 кг', brand: 'Norma', weight: '15 кг', price: 1657, currency: 'сом', slug: 'norma-arctic-15-kg', sku: 'NOR-092-15', image: 'norma-arctic-15-kg.jpg' },
  { id: 93, title: 'NORMA Arctic, 25 кг', brand: 'Norma', weight: '25 кг', price: 2676, currency: 'сом', slug: 'norma-arctic-25-kg', sku: 'NOR-093-25', image: 'norma-arctic-25-kg.jpg' },
  { id: 94, title: 'NORMA Arctic, 3 кг', brand: 'Norma', weight: '3 кг', price: 417, currency: 'сом', slug: 'norma-arctic-3-kg', sku: 'NOR-094-3', image: 'norma-arctic-3-kg.jpg' },
  { id: 95, title: 'NORMA Arctic, 4,5 кг', brand: 'Norma', weight: '4,5 кг', price: 543, currency: 'сом', slug: 'norma-arctic-4-5-kg', sku: 'NOR-095-45', image: 'norma-arctic-4-5-kg.jpg' },
  { id: 96, title: 'NORMA Arctic, 7 кг', brand: 'Norma', weight: '7 кг', price: 803, currency: 'сом', slug: 'norma-arctic-7-kg', sku: 'NOR-096-7', image: 'norma-arctic-7-kg.jpg' },
  { id: 97, title: 'NORMA FRONTA, 15 кг', brand: 'Norma', weight: '15 кг', price: 1854, currency: 'сом', slug: 'norma-fronta-15-kg', sku: 'NOR-097-15', image: 'norma-fronta-15-kg.jpg' },
  { id: 98, title: 'NORMA FRONTA, 25 кг', brand: 'Norma', weight: '25 кг', price: 2997, currency: 'сом', slug: 'norma-fronta-25-kg', sku: 'NOR-098-25', image: 'norma-fronta-25-kg.jpg' },
  { id: 99, title: 'NORMA FRONTA, 7 кг', brand: 'Norma', weight: '7 кг', price: 906, currency: 'сом', slug: 'norma-fronta-7-kg', sku: 'NOR-099-7', image: 'norma-fronta-7-kg.jpg' },
  { id: 100, title: 'NORMA FRONTA, 3 кг', brand: 'Norma', weight: '3 кг', price: 449, currency: 'сом', slug: 'norma-fronta-3-kg', sku: 'NOR-100-3', image: 'norma-fronta-3-kg.jpg' },
  { id: 101, title: 'NORMA Stronga, 15 кг', brand: 'Norma', weight: '15 кг', price: 934, currency: 'сом', slug: 'norma-stronga-15-kg', sku: 'NOR-101-15', image: 'norma-stronga-15-kg.jpg' },
  { id: 102, title: 'NORMA Stronga, 25 кг', brand: 'Norma', weight: '25 кг', price: 1406, currency: 'сом', slug: 'norma-stronga-25-kg', sku: 'NOR-102-25', image: 'norma-stronga-25-kg.jpg' },
  { id: 103, title: 'NORMA Stronga, 3 кг', brand: 'Norma', weight: '3 кг', price: 282, currency: 'сом', slug: 'norma-stronga-3-kg', sku: 'NOR-103-3', image: 'norma-stronga-3-kg.jpg' },
  { id: 104, title: 'NORMA Stronga, 4,5 кг', brand: 'Norma', weight: '4,5 кг', price: 343, currency: 'сом', slug: 'norma-stronga-4-5-kg', sku: 'NOR-104-45', image: 'norma-stronga-4-5-kg.jpg' },
  { id: 105, title: 'NORMA Stronga, 7 кг', brand: 'Norma', weight: '7 кг', price: 467, currency: 'сом', slug: 'norma-stronga-7-kg', sku: 'NOR-105-7', image: 'norma-stronga-7-kg.jpg' },
  { id: 106, title: 'NORMA Stronga, 1 кг', brand: 'Norma', weight: '1 кг', price: 106, currency: 'сом', slug: 'norma-stronga-1-kg', sku: 'NOR-106-1', image: 'norma-stronga-1-kg.jpg' },
  { id: 107, title: 'Лак RELACK глянцевый 1 кг', brand: 'Norma', weight: '1 кг', price: 400, currency: 'сом', slug: 'lak-relack-glyantsevyy-1-kg', sku: 'NOR-107-1', image: 'lak-relack-glyantsevyy-1-kg.jpg' },
  { id: 108, title: 'Лак RELACK глянцевый 9 кг', brand: 'Norma', weight: '9 кг', price: 2922, currency: 'сом', slug: 'lak-relack-glyantsevyy-9-kg', sku: 'NOR-108-9', image: 'lak-relack-glyantsevyy-9-kg.jpg' },
  { id: 109, title: 'Лак RELACK матовый 1 кг', brand: 'Norma', weight: '1 кг', price: 478, currency: 'сом', slug: 'lak-relack-matovyy-1-kg', sku: 'NOR-109-1', image: 'lak-relack-matovyy-1-kg.jpg' },
  { id: 110, title: 'Лак RELACK матовый 3 кг', brand: 'Norma', weight: '3 кг', price: 1167, currency: 'сом', slug: 'lak-relack-matovyy-3-kg', sku: 'NOR-110-3', image: 'lak-relack-matovyy-3-kg.jpg' },
  { id: 111, title: 'Лак RELACK глянцевый 1 кг (var)', brand: 'Norma', weight: '1 кг', price: 416, currency: 'сом', slug: 'lak-relack-glyantsevyy-1-kg-var', sku: 'NOR-111-1', image: 'lak-relack-glyantsevyy-1-kg-var.jpg' },
  { id: 112, title: 'Лак RELACK глянцевый 3 кг', brand: 'Norma', weight: '3 кг', price: 1120, currency: 'сом', slug: 'lak-relack-glyantsevyy-3-kg', sku: 'NOR-112-3', image: 'lak-relack-glyantsevyy-3-kg.jpg' },
  { id: 113, title: 'ПВА Econom 0,8 кг', brand: 'Norma', weight: '0,8 кг', price: 141, currency: 'сом', slug: 'pva-econom-0-8-kg', sku: 'NOR-113-08', image: 'pva-econom-0-8-kg.jpg' },
  { id: 114, title: 'ПВА Econom 3 кг', brand: 'Norma', weight: '3 кг', price: 446, currency: 'сом', slug: 'pva-econom-3-kg', sku: 'NOR-114-3', image: 'pva-econom-3-kg.jpg' },
  { id: 115, title: 'ПВА Econom 10 кг', brand: 'Norma', weight: '10 кг', price: 1359, currency: 'сом', slug: 'pva-econom-10-kg', sku: 'NOR-115-10', image: 'pva-econom-10-kg.jpg' },
  { id: 116, title: 'ПВА Econom 18 кг', brand: 'Norma', weight: '18 кг', price: 2323, currency: 'сом', slug: 'pva-econom-18-kg', sku: 'NOR-116-18', image: 'pva-econom-18-kg.jpg' }
];

const brandCategories = {
  'AlinEX': { name: 'AlinEX', nameRu: 'AlinEX', nameKg: 'AlinEX', desc: 'Сухие смеси и строительные материалы' },
  'Наши': { name: 'Наши', nameRu: 'Наши', nameKg: 'Наши', desc: 'Киргизские строительные материалы' },
  'Alina Paint': { name: 'Alina Paint', nameRu: 'Alina Paint', nameKg: 'Alina Paint', desc: 'Краски и отделочные материалы' },
  'Norma': { name: 'Norma', nameRu: 'Norma', nameKg: 'Norma', desc: 'Строительные смеси и лаки' }
};

async function importProducts() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Create categories for each brand
    const categoryMap = {};
    for (const [brand, categoryData] of Object.entries(brandCategories)) {
      const [category] = await Category.findOrCreate({
        where: { name: brand },
        defaults: categoryData
      });
      categoryMap[brand] = category.id;
      console.log(`Category ${brand} created/found with ID: ${category.id}`);
    }

    // Clear existing products
    await Product.destroy({ where: {} });
    console.log('Existing products cleared.');

    // Import products
    for (const product of productsData) {
      const categoryId = categoryMap[product.brand];
      if (!categoryId) {
        console.warn(`No category found for brand: ${product.brand}`);
        continue;
      }

      await Product.create({
        name: product.title,
        nameRu: product.title,
        nameKg: product.title,
        desc: `${product.brand} - ${product.weight}`,
        descRu: `${product.brand} - ${product.weight}`,
        descKg: `${product.brand} - ${product.weight}`,
        categoryId: categoryId,
        price: product.price,
        sku: product.sku,
        unit: product.weight,
        specs: { brand: product.brand, weight: product.weight },
        images: [`/uploads/${product.image}`],
        isActive: true,
        stock: 100
      });
      console.log(`Imported: ${product.title}`);
    }

    console.log('Import completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

importProducts();
