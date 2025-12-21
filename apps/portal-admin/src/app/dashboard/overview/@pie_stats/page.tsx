import { delay } from '@/constants/mock-api';
import { TopSellingProductsGraph } from '@/features/overview/components/top-selling-products-graph';

export default async function Stats() {
  await delay(1000);
  return <TopSellingProductsGraph />;
}
