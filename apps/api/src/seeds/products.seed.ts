import { Collection } from 'mongodb';

// Danh sách thương hiệu
const brands = [
  'La Roche-Posay',
  'CeraVe',
  'Bioderma',
  'Vichy',
  'Avène',
  'Neutrogena',
  'Eucerin',
  'The Ordinary',
  "L'Oreal",
  'Innisfree',
];

// Danh sách các loại sản phẩm theo danh mục
const productTypes: Record<string, string[]> = {
  'Sữa rửa mặt': [
    'Sữa rửa mặt tạo bọt',
    'Gel rửa mặt dịu nhẹ',
    'Sữa rửa mặt cho da dầu',
    'Sữa rửa mặt cho da khô',
    'Sữa rửa mặt cho da nhạy cảm',
    'Gel rửa mặt kiểm soát dầu',
    'Sữa rửa mặt cấp ẩm',
    'Sữa rửa mặt làm sáng da',
  ],
  'Kem chống nắng': [
    'Kem chống nắng không gây nhờn',
    'Kem chống nắng dạng gel',
    'Kem chống nắng dạng sữa',
    'Kem chống nắng vật lý',
    'Kem chống nắng hóa học',
    'Kem chống nắng cho da dầu',
    'Kem chống nắng cho da nhạy cảm',
    'Kem chống nắng nâng tone',
  ],
  'Tẩy trang': [
    'Nước tẩy trang Micellar',
    'Dầu tẩy trang',
    'Sữa tẩy trang',
    'Khăn ướt tẩy trang',
    'Gel tẩy trang',
    'Nước tẩy trang cho da dầu',
    'Nước tẩy trang cho da nhạy cảm',
    'Nước tẩy trang cho da mụn',
  ],
  Serum: [
    'Serum Vitamin C',
    'Serum Hyaluronic Acid',
    'Serum Niacinamide',
    'Serum Retinol',
    'Serum chống lão hóa',
    'Serum trị mụn',
    'Serum làm sáng da',
    'Serum dưỡng ẩm sâu',
  ],
  'Kem dưỡng': [
    'Kem dưỡng ẩm cho da dầu',
    'Kem dưỡng ẩm cho da khô',
    'Kem dưỡng cho da nhạy cảm',
    'Kem dưỡng ban đêm',
    'Kem dưỡng ban ngày',
    'Kem dưỡng chống lão hóa',
    'Kem dưỡng làm sáng da',
    'Kem dưỡng phục hồi da',
  ],
  'Trị mụn': [
    'Kem trị mụn đầu đen',
    'Gel trị mụn viêm',
    'Miếng dán trị mụn',
    'Sữa rửa mặt trị mụn',
    'Kem trị mụn chuyên sâu',
    'Serum trị mụn',
    'Mặt nạ trị mụn',
    'Kem trị thâm mụn',
  ],
};

// Các công dụng theo danh mục sản phẩm
const benefitsByCategory: Record<string, string[]> = {
  'Sữa rửa mặt': [
    'Làm sạch da',
    'Loại bỏ bụi bẩn',
    'Loại bỏ dầu thừa',
    'Không làm khô da',
    'Duy trì độ ẩm',
    'Làm dịu da',
    'Tẩy tế bào chết nhẹ nhàng',
    'Loại bỏ tạp chất',
  ],
  'Kem chống nắng': [
    'Bảo vệ da khỏi tia UV',
    'Ngăn ngừa cháy nắng',
    'Chống lão hóa sớm',
    'Ngăn ngừa đốm nâu',
    'Bảo vệ toàn diện',
    'Không gây nhờn rít',
    'Không để lại vệt trắng',
    'Chống thấm nước',
  ],
  'Tẩy trang': [
    'Làm sạch lớp trang điểm',
    'Loại bỏ kem chống nắng',
    'Không gây khô da',
    'Làm sạch sâu',
    'Không cần rửa lại',
    'Dịu nhẹ với da',
    'Loại bỏ lớp trang điểm không trôi',
    'Không làm bít lỗ chân lông',
  ],
  Serum: [
    'Cung cấp dưỡng chất đậm đặc',
    'Thẩm thấu nhanh',
    'Cải thiện kết cấu da',
    'Làm sáng da',
    'Giảm nếp nhăn',
    'Tăng cường độ đàn hồi',
    'Chống oxy hóa',
    'Cải thiện tông màu da',
  ],
  'Kem dưỡng': [
    'Dưỡng ẩm sâu',
    'Phục hồi hàng rào bảo vệ da',
    'Làm dịu da kích ứng',
    'Củng cố độ đàn hồi',
    'Cung cấp dưỡng chất',
    'Làm mềm da',
    'Bảo vệ da khỏi tác nhân môi trường',
    'Nuôi dưỡng da ban đêm',
  ],
  'Trị mụn': [
    'Giảm viêm',
    'Tiêu diệt vi khuẩn gây mụn',
    'Làm giảm dầu nhờn',
    'Ngăn ngừa mụn mới',
    'Làm mờ vết thâm mụn',
    'Làm xẹp mụn nhanh chóng',
    'Giảm đỏ',
    'Làm thông thoáng lỗ chân lông',
  ],
};

// Giá cơ bản theo thương hiệu
const priceByBrand: Record<string, number> = {
  'La Roche-Posay': 450000,
  CeraVe: 350000,
  Bioderma: 400000,
  Vichy: 500000,
  Avène: 420000,
  Neutrogena: 280000,
  Eucerin: 380000,
  'The Ordinary': 250000,
  "L'Oreal": 220000,
  Innisfree: 200000,
};

// Điều chỉnh giá theo loại sản phẩm
const priceAdjustByCategory: Record<string, number> = {
  'Sữa rửa mặt': -30000,
  'Kem chống nắng': 100000,
  'Tẩy trang': -50000,
  Serum: 150000,
  'Kem dưỡng': 0,
  'Trị mụn': 50000,
};

// Danh sách URL Shopee (mẫu)
const shopeeUrlTemplates = [
  'https://shopee.vn/product-name-i.37251700.580590480',
  'https://shopee.vn/skin-care-item-i.42587123.786345912',
  'https://shopee.vn/beauty-product-i.58612340.912375684',
  'https://shopee.vn/cosmetic-item-i.23491758.647281935',
  'https://shopee.vn/facial-care-i.85621379.359147862',
];

// Hàm tạo shopee URL giả
function generateShopeeUrl(name: string, brand: string): string {
  const template =
    shopeeUrlTemplates[Math.floor(Math.random() * shopeeUrlTemplates.length)];
  const slug = name.toLowerCase().replace(/ /g, '-');
  const randomId = Math.floor(10000000 + Math.random() * 90000000);
  const randomProductId = Math.floor(100000000 + Math.random() * 900000000);

  return template
    .replace('product-name', slug)
    .replace(/i\.\d+\.\d+/, `i.${randomId}.${randomProductId}`);
}

// Tạo một giá tiền dựa trên thương hiệu và loại sản phẩm
function determinePrice(category: string, brand: string): number {
  const basePrice = priceByBrand[brand] || 300000;
  const adjustment = priceAdjustByCategory[category] || 0;

  // Thêm một chút ngẫu nhiên để giá trông tự nhiên hơn
  const randomVariation = Math.floor(Math.random() * 50000) - 25000;

  // Làm tròn đến 1000 gần nhất
  return Math.round((basePrice + adjustment + randomVariation) / 1000) * 1000;
}

// Tạo dữ liệu sản phẩm ngẫu nhiên
function generateMockProducts(count: number = 100) {
  const products = [];
  const categories = Object.keys(productTypes);

  for (let i = 0; i < count; i++) {
    // Chọn ngẫu nhiên thương hiệu, danh mục và loại sản phẩm
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const productType =
      productTypes[category][
        Math.floor(Math.random() * productTypes[category].length)
      ];

    // Tạo tên sản phẩm
    const name = `${productType} ${brand}`;

    // Chọn công dụng ngẫu nhiên (2-4 công dụng)
    const availableBenefits = [...benefitsByCategory[category]];
    const benefitCount = Math.floor(Math.random() * 3) + 2; // 2-4 công dụng
    const benefits = [];

    for (let j = 0; j < benefitCount; j++) {
      if (availableBenefits.length === 0) break;

      const randomIndex = Math.floor(Math.random() * availableBenefits.length);
      benefits.push(availableBenefits[randomIndex]);
      availableBenefits.splice(randomIndex, 1);
    }

    // Tạo sản phẩm
    const productData = {
      name,
      brand,
      shopeeUrl: generateShopeeUrl(name, brand),
      imageUrl: `https://example.com/images/${brand.toLowerCase().replace(/ /g, '-')}/${encodeURIComponent(name.toLowerCase().replace(/ /g, '-'))}.jpg`,
      isActive: Math.random() > 0.1, // 90% sản phẩm đang hoạt động
      description: `${name} từ thương hiệu ${brand} giúp ${benefits[0].toLowerCase()} và ${benefits[1]?.toLowerCase() || 'chăm sóc da hiệu quả'}.`,
      price: determinePrice(category, brand),
      categories: [category],
      benefits: benefits,
    };

    products.push(productData);
  }

  return products;
}

export async function seedProducts(
  productsCollection: Collection,
): Promise<void> {
  console.log('Seeding products...');

  // Kiểm tra xem đã có sản phẩm trong cơ sở dữ liệu chưa
  const existingCount = await productsCollection.countDocuments();
  if (existingCount > 0) {
    console.log(
      `Đã có ${existingCount} sản phẩm trong cơ sở dữ liệu. Bỏ qua seed.`,
    );
    return;
  }

  try {
    // Tạo dữ liệu giả cho 100 sản phẩm
    const products = generateMockProducts(100);

    // Insert các sản phẩm vào cơ sở dữ liệu
    if (products.length > 0) {
      await productsCollection.insertMany(products);
      console.log(`Đã thêm ${products.length} sản phẩm vào cơ sở dữ liệu.`);
    } else {
      console.log('Không có sản phẩm nào được thêm.');
    }
  } catch (error) {
    console.error('Lỗi khi seed sản phẩm:', error);
    throw error;
  }
}
