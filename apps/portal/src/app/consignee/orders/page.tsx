// 'use client';

// import PageContainer from '@/components/layout/page-container';
// import { Button } from '@/components/ui/button';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle
// } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import {
//   IconPlus,
//   IconSearch,
//   IconEye,
//   IconX,
//   IconClock,
//   IconTruck,
//   IconCheck,
//   IconRefresh
// } from '@tabler/icons-react';
// import Link from 'next/link';
// import { useState } from 'react';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow
// } from '@/components/ui/table';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue
// } from '@/components/ui/select';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger
// } from '@/components/ui/dropdown-menu';
// import { useToast } from '@/components/ui/use-toast';
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle
// } from '@/components/ui/alert-dialog';
// import ConsigneeOrdersFeature from '@/features/consignee/orders/orders';

// // Mock data for orders
// const mockOrders = [
//   {
//     id: 'ORD-001',
//     items: 'Gạo ST25 Organic, Gạo Jasmine',
//     itemCount: 2,
//     totalAmount: 33000000,
//     quantity: '800 kg',
//     orderDate: '2024-04-01',
//     status: 'Pending',
//     supplier: 'Công ty TNHH Nông sản Đồng Tháp'
//   },
//   {
//     id: 'ORD-002',
//     items: 'Cà chua cherry organic, Xà lách xoăn, Cải bó xôi baby',
//     itemCount: 3,
//     totalAmount: 14375000,
//     quantity: '225 kg',
//     orderDate: '2024-04-05',
//     status: 'In Delivery',
//     supplier: 'Trang trại Rau sạch Đà Lạt'
//   },
//   {
//     id: 'ORD-003',
//     items: 'Tôm sú tươi size 20-30, Cua biển tươi',
//     itemCount: 2,
//     totalAmount: 14250000,
//     quantity: '35 kg',
//     orderDate: '2024-04-01',
//     status: 'Delivered',
//     supplier: 'Công ty CP Thủy sản Cà Mau'
//   },
//   {
//     id: 'ORD-004',
//     items: 'Xoài cát Hòa Lộc, Bưởi da xanh',
//     itemCount: 2,
//     totalAmount: 17500000,
//     quantity: '200 kg + 100 trái',
//     orderDate: '2024-04-02',
//     status: 'Cancelled',
//     supplier: 'Hợp tác xã Trái cây Tiền Giang'
//   }
// ];

// export default function OrdersPage() {
//   const { toast } = useToast();
//   const [searchQuery, setSearchQuery] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [orders, setOrders] = useState(mockOrders);
//   const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
//   const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'Pending':
//         return <IconClock className='h-4 w-4' />;
//       case 'In Delivery':
//         return <IconTruck className='h-4 w-4' />;
//       case 'Delivered':
//         return <IconCheck className='h-4 w-4' />;
//       case 'Cancelled':
//         return <IconX className='h-4 w-4' />;
//       default:
//         return <IconClock className='h-4 w-4' />;
//     }
//   };

//   const getStatusVariant = (status: string) => {
//     switch (status) {
//       case 'Pending':
//         return 'outline';
//       case 'In Delivery':
//         return 'secondary';
//       case 'Delivered':
//         return 'default';
//       case 'Cancelled':
//         return 'destructive';
//       default:
//         return 'outline';
//     }
//   };

//   const handleCancelOrder = (orderId: string) => {
//     setSelectedOrderId(orderId);
//     setCancelDialogOpen(true);
//   };

//   const confirmCancelOrder = () => {
//     if (selectedOrderId) {
//       // TODO: Implement API call to cancel order
//       setOrders((prev) =>
//         prev.map((order) =>
//           order.id === selectedOrderId
//             ? { ...order, status: 'Cancelled' }
//             : order
//         )
//       );
//       toast({
//         title: 'Order Cancelled',
//         description: `Order ${selectedOrderId} has been cancelled.`
//       });
//     }
//     setCancelDialogOpen(false);
//     setSelectedOrderId(null);
//   };

//   const handleReorder = (orderId: string) => {
//     toast({
//       title: 'Reorder Created',
//       description: `Creating a new order based on ${orderId}...`
//     });
//     // TODO: Implement reorder functionality
//   };

//   const filteredOrders = orders.filter((order) => {
//     const matchesSearch =
//       order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       order.items.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       order.supplier.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesStatus =
//       statusFilter === 'all' || order.status === statusFilter;
//     return matchesSearch && matchesStatus;
//   });

//   const statusCounts = {
//     all: orders.length,
//     Pending: orders.filter((o) => o.status === 'Pending').length,
//     'In Delivery': orders.filter((o) => o.status === 'In Delivery').length,
//     Delivered: orders.filter((o) => o.status === 'Delivered').length
//   };

//   return (
//     <PageContainer>
//       <div className='w-full space-y-6'>
//         <div className='flex items-center justify-between'>
//           <div>
//             <h2 className='text-3xl font-bold tracking-tight'>Orders</h2>
//             <p className='text-muted-foreground'>
//               Manage and track your orders
//             </p>
//           </div>
//           <Link href='/consignee/orders/new'>
//             <Button>
//               <IconPlus className='mr-2 h-4 w-4' />
//               New Order
//             </Button>
//           </Link>
//         </div>

//         {/* Status Cards */}
//         <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
//           <Card
//             className='hover:border-primary cursor-pointer'
//             onClick={() => setStatusFilter('all')}
//           >
//             <CardHeader className='pb-3'>
//               <CardDescription>Total Orders</CardDescription>
//               <CardTitle className='text-3xl'>{statusCounts.all}</CardTitle>
//             </CardHeader>
//           </Card>
//           <Card
//             className='hover:border-primary cursor-pointer'
//             onClick={() => setStatusFilter('Pending')}
//           >
//             <CardHeader className='pb-3'>
//               <CardDescription className='flex items-center gap-2'>
//                 <IconClock className='h-4 w-4' />
//                 Pending
//               </CardDescription>
//               <CardTitle className='text-3xl'>{statusCounts.Pending}</CardTitle>
//             </CardHeader>
//           </Card>
//           <Card
//             className='hover:border-primary cursor-pointer'
//             onClick={() => setStatusFilter('In Delivery')}
//           >
//             <CardHeader className='pb-3'>
//               <CardDescription className='flex items-center gap-2'>
//                 <IconTruck className='h-4 w-4' />
//                 In Delivery
//               </CardDescription>
//               <CardTitle className='text-3xl'>
//                 {statusCounts['In Delivery']}
//               </CardTitle>
//             </CardHeader>
//           </Card>
//           <Card
//             className='hover:border-primary cursor-pointer'
//             onClick={() => setStatusFilter('Delivered')}
//           >
//             <CardHeader className='pb-3'>
//               <CardDescription className='flex items-center gap-2'>
//                 <IconCheck className='h-4 w-4' />
//                 Delivered
//               </CardDescription>
//               <CardTitle className='text-3xl'>
//                 {statusCounts.Delivered}
//               </CardTitle>
//             </CardHeader>
//           </Card>
//         </div>

//         {/* Orders Table */}
//         <Card>
//           <CardHeader>
//             <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
//               <div className='flex flex-1 items-center space-x-2'>
//                 <div className='relative flex-1'>
//                   <IconSearch className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
//                   <Input
//                     placeholder='Search by ID, items, or supplier...'
//                     className='pl-8'
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                   />
//                 </div>
//                 <Select value={statusFilter} onValueChange={setStatusFilter}>
//                   <SelectTrigger className='w-[180px]'>
//                     <SelectValue placeholder='Filter by status' />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value='all'>All Status</SelectItem>
//                     <SelectItem value='Pending'>Pending</SelectItem>
//                     <SelectItem value='In Delivery'>In Delivery</SelectItem>
//                     <SelectItem value='Delivered'>Delivered</SelectItem>
//                     <SelectItem value='Cancelled'>Cancelled</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className='rounded-md border'>
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Order ID</TableHead>
//                     <TableHead>Items</TableHead>
//                     <TableHead>Supplier</TableHead>
//                     <TableHead>Quantity</TableHead>
//                     <TableHead>Order Date</TableHead>
//                     <TableHead>Amount</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead className='text-right'>Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {filteredOrders.length === 0 ? (
//                     <TableRow>
//                       <TableCell colSpan={8} className='text-center'>
//                         No orders found
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     filteredOrders.map((order) => (
//                       <TableRow key={order.id}>
//                         <TableCell className='font-medium'>
//                           {order.id}
//                         </TableCell>
//                         <TableCell>
//                           <div>
//                             <p className='text-sm'>{order.items}</p>
//                             <p className='text-muted-foreground text-xs'>
//                               {order.itemCount} item(s)
//                             </p>
//                           </div>
//                         </TableCell>
//                         <TableCell>{order.supplier}</TableCell>
//                         <TableCell>{order.quantity}</TableCell>
//                         <TableCell>{order.orderDate}</TableCell>
//                         <TableCell className='font-medium'>
//                           ${order.totalAmount}
//                         </TableCell>
//                         <TableCell>
//                           <Badge
//                             variant={getStatusVariant(order.status)}
//                             className='flex w-fit items-center gap-1'
//                           >
//                             {getStatusIcon(order.status)}
//                             {order.status}
//                           </Badge>
//                         </TableCell>
//                         <TableCell className='text-right'>
//                           <DropdownMenu>
//                             <DropdownMenuTrigger asChild>
//                               <Button variant='ghost' size='sm'>
//                                 Actions
//                               </Button>
//                             </DropdownMenuTrigger>
//                             <DropdownMenuContent align='end'>
//                               <DropdownMenuLabel>Actions</DropdownMenuLabel>
//                               <DropdownMenuSeparator />
//                               <DropdownMenuItem asChild>
//                                 <Link
//                                   href={`/consignee/orders/${order.id}`}
//                                   className='flex items-center'
//                                 >
//                                   <IconEye className='mr-2 h-4 w-4' />
//                                   View Details
//                                 </Link>
//                               </DropdownMenuItem>
//                               <DropdownMenuItem
//                                 onClick={() => handleReorder(order.id)}
//                               >
//                                 <IconRefresh className='mr-2 h-4 w-4' />
//                                 Reorder
//                               </DropdownMenuItem>
//                               {order.status === 'Pending' && (
//                                 <DropdownMenuItem
//                                   onClick={() => handleCancelOrder(order.id)}
//                                   className='text-destructive'
//                                 >
//                                   <IconX className='mr-2 h-4 w-4' />
//                                   Cancel Order
//                                 </DropdownMenuItem>
//                               )}
//                             </DropdownMenuContent>
//                           </DropdownMenu>
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   )}
//                 </TableBody>
//               </Table>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Cancel Confirmation Dialog */}
//       <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This action will cancel order <strong>{selectedOrderId}</strong>.
//               This cannot be undone.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>No, Keep It</AlertDialogCancel>
//             <AlertDialogAction onClick={confirmCancelOrder}>
//               Yes, Cancel Order
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </PageContainer>
//   );
// }
'use client';

import ConsigneeOrdersFeature from '@/features/consignee/orders/orders';

export default function OrdersPage() {
  return <ConsigneeOrdersFeature />;
}
