import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import type { CreateOrderInvoiceDetailDto, OrderSchedule } from '@/types/order';
import { formatCurrency } from '../../utils/formatting';
import type { ProductTotals } from '../../utils/calculations';
import type { PhaseFormData } from '../../hooks/order-detail/use-phase-form';

interface CreatePhaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: OrderSchedule;
  totals: ProductTotals;
  phaseData: PhaseFormData;
  onPhaseDataChange: (updates: Partial<PhaseFormData>) => void;
  onQuantityChange: (productId: string, quantity: number) => void;
  onCreate: () => void;
  loading: boolean;
}

export function CreatePhaseDialog({
  open,
  onOpenChange,
  schedule,
  totals,
  phaseData,
  onPhaseDataChange,
  onQuantityChange,
  onCreate,
  loading
}: CreatePhaseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[85vh] max-w-4xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Tạo đợt giao hàng mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin cho đợt giao hàng mới
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-6'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div>
              <Label htmlFor='phaseNumber'>Số đợt</Label>
              <Input
                id='phaseNumber'
                type='number'
                value={phaseData.phaseNumber}
                onChange={(e) =>
                  onPhaseDataChange({
                    phaseNumber: parseInt(e.target.value) || 1
                  })
                }
                className='mt-2'
                min={1}
              />
            </div>
            <div>
              <Label htmlFor='taxRate'>Mức thuế (%)</Label>
              <Input
                id='taxRate'
                type='number'
                value={phaseData.taxRate}
                onChange={(e) =>
                  onPhaseDataChange({
                    taxRate: parseInt(e.target.value) || 0
                  })
                }
                className='mt-2'
                min={0}
                max={100}
              />
            </div>
          </div>
          <div>
            <Label htmlFor='description'>Mô tả</Label>
            <Textarea
              id='description'
              value={phaseData.description}
              onChange={(e) =>
                onPhaseDataChange({ description: e.target.value })
              }
              placeholder='Nhập mô tả...'
              rows={3}
              className='mt-2'
            />
          </div>
          <div>
            <Label className='mb-4 block'>Chi tiết sản phẩm</Label>
            <div className='overflow-x-auto rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Còn lại</TableHead>
                    <TableHead>Số lượng giao</TableHead>
                    <TableHead>Đơn vị</TableHead>
                    <TableHead>Đơn giá</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {phaseData.invoiceDetails.map((detail, index) => {
                    const product = schedule.orderDetails?.find(
                      (d) => d.product?.id === detail.product.id
                    );
                    const productId = detail.product.id;
                    const productTotals = totals[productId];
                    const remaining = productTotals
                      ? productTotals.total - productTotals.used
                      : 0;

                    return (
                      <TableRow key={index}>
                        <TableCell className='font-medium'>
                          {product?.product?.name || '-'}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              remaining > 0
                                ? 'font-medium text-green-600'
                                : 'text-muted-foreground'
                            }
                          >
                            {remaining}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Input
                            type='number'
                            min={0}
                            max={remaining}
                            value={detail.quantity ?? 0}
                            onChange={(e) =>
                              onQuantityChange(
                                detail.product.id,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className='w-24'
                            disabled={remaining === 0}
                          />
                        </TableCell>
                        <TableCell>{detail.unit || '-'}</TableCell>
                        <TableCell>
                          {formatCurrency(detail.unitPrice ?? 0)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button onClick={onCreate} disabled={loading}>
            {loading ? 'Đang tạo...' : 'Tạo đợt giao hàng'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
