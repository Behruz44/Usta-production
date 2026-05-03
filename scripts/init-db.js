import { sequelize, User, Category, Product } from '../models/index.js';
import bcrypt from 'bcryptjs';

const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    await sequelize.sync({ force: true });
    console.log('Database synchronized.');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Super Admin',
      username: 'admin',
      phone: '+996312000000',
      email: 'admin@usta.kg',
      password: hashedPassword,
      role: 'super_admin'
    });
    console.log('Admin user created.');

    // Create categories
    const categories = await Category.bulkCreate([
      {
        name: 'Гипсокартон',
        nameRu: 'Гипсокартон',
        nameKg: 'Гипсокартон',
        icon: 'Sheet',
        desc: 'Листовые материалы для стен и перегородок',
        descRu: 'Листовые материалы для стен и перегородок',
        descKg: 'Дубал жана бөлмөлөр үчүн жалпак материалдар',
        order: 1
      },
      {
        name: 'Сухие смеси',
        nameRu: 'Сухие смеси',
        nameKg: 'Кургак аралашмалар',
        icon: 'Package',
        desc: 'Штукатурки, шпатлевки и кладочные смеси',
        descRu: 'Штукатурки, шпатлевки и кладочные смеси',
        descKg: 'Бозуу, шпатлевка жана курулуш аралашмалары',
        order: 2
      },
      {
        name: 'Саморезы',
        nameRu: 'Саморезы',
        nameKg: 'Өзөктөр',
        icon: 'Wrench',
        desc: 'Крепежные изделия различных размеров',
        descRu: 'Крепежные изделия различных размеров',
        descKg: 'Ар кандай өлчөмдөгү бекитүү буюмдары',
        order: 3
      },
      {
        name: 'Профиль',
        nameRu: 'Профиль',
        nameKg: 'Профиль',
        icon: 'Ruler',
        desc: 'Металлические профили для каркасов',
        descRu: 'Металлические профили для каркасов',
        descKg: 'Калкалар үчүн металл профилдери',
        order: 4
      },
      {
        name: 'Генераторы',
        nameRu: 'Генераторы',
        nameKg: 'Генераторлор',
        icon: 'Zap',
        desc: 'Бензиновые и дизельные генераторы',
        descRu: 'Бензиновые и дизельные генераторы',
        descKg: 'Бензин жана дизель генераторлору',
        order: 5
      },
      {
        name: 'Инструменты',
        nameRu: 'Инструменты',
        nameKg: 'Аспаптар',
        icon: 'Tool',
        desc: 'Электроинструменты и ручной инструмент',
        descRu: 'Электроинструменты и ручной инструмент',
        descKg: 'Электр аспаптар жана кол аспаптар',
        order: 6
      }
    ]);
    console.log('Categories created.');

    // Create sample products
    await Product.bulkCreate([
      {
        name: 'Гипсокартон настенный KNAUF',
        nameRu: 'Гипсокартон настенный KNAUF',
        nameKg: 'KNAUF дубал гипсокартону',
        desc: 'Стандартный настенный гипсокартон для жилых помещений',
        descRu: 'Стандартный настенный гипсокартон для жилых помещений',
        descKg: 'Турак жайлар үчүн стандартдуу дубал гипсокартону',
        categoryId: categories[0].id,
        price: 18000,
        sku: 'GYP-001',
        stock: 150,
        unit: 'лист',
        specs: { толщина: '12.5 мм', размер: '1200x2500 мм', тип: 'настенный' }
      },
      {
        name: 'Гипсокартон потолочный KNAUF',
        nameRu: 'Гипсокартон потолочный KNAUF',
        nameKg: 'KNAUF тосмо гипсокартону',
        desc: 'Облегчённый лист для потолочных конструкций',
        descRu: 'Облегчённый лист для потолочных конструкций',
        descKg: 'Тосмо конструкциялары үчүн жеңил жалпак',
        categoryId: categories[0].id,
        price: 16000,
        sku: 'GYP-002',
        stock: 200,
        unit: 'лист',
        specs: { толщина: '9.5 мм', размер: '1200x2500 мм', тип: 'потолочный' }
      },
      {
        name: 'Штукатурка гипсовая KNAUF Rotband',
        nameRu: 'Штукатурка гипсовая KNAUF Rotband',
        nameKg: 'KNAUF Rotband гипс бозуусу',
        desc: 'Универсальная гипсовая штукатурка для внутренних работ',
        descRu: 'Универсальная гипсовая штукатурка для внутренних работ',
        descKg: 'Ички иштер үчүн универсалдуу гипс бозуусу',
        categoryId: categories[1].id,
        price: 850,
        sku: 'MIX-001',
        stock: 500,
        unit: 'мешок',
        specs: { вес: '25 кг', тип: 'гипсовая', расход: '8-10 кг/м²' }
      }
    ]);
    console.log('Sample products created.');

    console.log('Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initializeDatabase();
