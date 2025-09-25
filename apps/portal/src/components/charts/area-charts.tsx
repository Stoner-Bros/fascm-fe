// 'use client';

// import { useState } from 'react';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle
// } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue
// } from '@/components/ui/select';
// import {
//   LineChart,
//   Line,
//   AreaChart,
//   Area,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell
// } from 'recharts';
// import {
//   IconTrendingUp,
//   IconTrendingDown,
//   IconMinus,
//   IconCalendar,
//   IconDownload
// } from '@tabler/icons-react';

// interface AreaChartsProps {
//   areaId: string;
//   className?: string;
// }

// export default function AreaCharts({ areaId, className }: AreaChartsProps) {
//   const [timeRange, setTimeRange] = useState('7d');
//   const [chartType, setChartType] = useState('temperature');

//   // Mock data cho biểu đồ
//   const temperatureData = [
//     { time: '00:00', value: 24, optimal: 25 },
//     { time: '04:00', value: 23, optimal: 25 },
//     { time: '08:00', value: 26, optimal: 25 },
//     { time: '12:00', value: 28, optimal: 25 },
//     { time: '16:00', value: 27, optimal: 25 },
//     { time: '20:00', value: 25, optimal: 25 }
//   ];

//   const humidityData = [
//     { time: '00:00', value: 65, optimal: 60 },
//     { time: '04:00', value: 68, optimal: 60 },
//     { time: '08:00', value: 58, optimal: 60 },
//     { time: '12:00', value: 55, optimal: 60 },
//     { time: '16:00', value: 62, optimal: 60 },
//     { time: '20:00', value: 64, optimal: 60 }
//   ];

//   const inventoryTrendData = [
//     { date: '01/01', inbound: 120, outbound: 80, stock: 450 },
//     { date: '02/01', inbound: 100, outbound: 90, stock: 460 },
//     { date: '03/01', inbound: 150, outbound: 110, stock: 500 },
//     { date: '04/01', inbound: 80, outbound: 120, stock: 460 },
//     { date: '05/01', inbound: 200, outbound: 100, stock: 560 },
//     { date: '06/01', inbound: 90, outbound: 140, stock: 510 },
//     { date: '07/01', inbound: 110, outbound: 95, stock: 525 }
//   ];

//   const productDistributionData = [
//     { name: 'Cà chua', value: 150, color: '#8884d8' },
//     { name: 'Cà rốt', value: 80, color: '#82ca9d' },
//     { name: 'Khoai tây', value: 120, color: '#ffc658' },
//     { name: 'Hành tây', value: 95, color: '#ff7300' },
//     { name: 'Khác', value: 80, color: '#00ff88' }
//   ];

//   const alertsData = [
//     { date: '01/01', temperature: 2, humidity: 1, inventory: 0 },
//     { date: '02/01', temperature: 1, humidity: 2, inventory: 1 },
//     { date: '03/01', temperature: 3, humidity: 0, inventory: 0 },
//     { date: '04/01', temperature: 0, humidity: 1, inventory: 2 },
//     { date: '05/01', temperature: 2, humidity: 3, inventory: 1 },
//     { date: '06/01', temperature: 1, humidity: 1, inventory: 0 },
//     { date: '07/01', temperature: 0, humidity: 0, inventory: 1 }
//   ];

//   const getCurrentData = () => {
//     switch (chartType) {
//       case 'temperature':
//         return temperatureData;
//       case 'humidity':
//         return humidityData;
//       case 'inventory':
//         return inventoryTrendData;
//       case 'alerts':
//         return alertsData;
//       default:
//         return temperatureData;
//     }
//   };

//   const getChartTitle = () => {
//     switch (chartType) {
//       case 'temperature':
//         return 'Xu hướng nhiệt độ';
//       case 'humidity':
//         return 'Xu hướng độ ẩm';
//       case 'inventory':
//         return 'Xu hướng tồn kho';
//       case 'alerts':
//         return 'Thống kê cảnh báo';
//       default:
//         return 'Biểu đồ thống kê';
//     }
//   };

//   const getTrendIndicator = (current: number, previous: number) => {
//     if (current > previous) {
//       return <IconTrendingUp className='h-4 w-4 text-green-600' />;
//     } else if (current < previous) {
//       return <IconTrendingDown className='h-4 w-4 text-red-600' />;
//     } else {
//       return <IconMinus className='h-4 w-4 text-gray-600' />;
//     }
//   };

//   const renderChart = () => {
//     const data = getCurrentData();

//     switch (chartType) {
//       case 'temperature':
//       case 'humidity':
//         return (
//           <ResponsiveContainer width='100%' height={300}>
//             <LineChart data={data}>
//               <CartesianGrid strokeDasharray='3 3' />
//               <XAxis dataKey='time' />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Line
//                 type='monotone'
//                 dataKey='value'
//                 stroke='#8884d8'
//                 strokeWidth={2}
//                 name={
//                   chartType === 'temperature' ? 'Nhiệt độ (°C)' : 'Độ ẩm (%)'
//                 }
//               />
//               <Line
//                 type='monotone'
//                 dataKey='optimal'
//                 stroke='#82ca9d'
//                 strokeDasharray='5 5'
//                 name='Mức tối ưu'
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         );

//       case 'inventory':
//         return (
//           <ResponsiveContainer width='100%' height={300}>
//             <AreaChart data={data}>
//               <CartesianGrid strokeDasharray='3 3' />
//               <XAxis dataKey='date' />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Area
//                 type='monotone'
//                 dataKey='stock'
//                 stackId='1'
//                 stroke='#8884d8'
//                 fill='#8884d8'
//                 name='Tồn kho'
//               />
//               <Bar dataKey='inbound' fill='#82ca9d' name='Nhập kho' />
//               <Bar dataKey='outbound' fill='#ffc658' name='Xuất kho' />
//             </AreaChart>
//           </ResponsiveContainer>
//         );

//       case 'alerts':
//         return (
//           <ResponsiveContainer width='100%' height={300}>
//             <BarChart data={data}>
//               <CartesianGrid strokeDasharray='3 3' />
//               <XAxis dataKey='date' />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Bar dataKey='temperature' fill='#ff7300' name='Nhiệt độ' />
//               <Bar dataKey='humidity' fill='#00ff88' name='Độ ẩm' />
//               <Bar dataKey='inventory' fill='#8884d8' name='Tồn kho' />
//             </BarChart>
//           </ResponsiveContainer>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <div className={`space-y-6 ${className}`}>
//       {/* Statistics Cards */}
//       <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
//         <Card>
//           <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
//             <CardTitle className='text-sm font-medium'>
//               Nhiệt độ trung bình
//             </CardTitle>
//             {getTrendIndicator(25.2, 24.8)}
//           </CardHeader>
//           <CardContent>
//             <div className='text-2xl font-bold'>25.2°C</div>
//             <p className='text-muted-foreground text-xs'>
//               +0.4°C so với hôm qua
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
//             <CardTitle className='text-sm font-medium'>
//               Độ ẩm trung bình
//             </CardTitle>
//             {getTrendIndicator(62, 65)}
//           </CardHeader>
//           <CardContent>
//             <div className='text-2xl font-bold'>62%</div>
//             <p className='text-muted-foreground text-xs'>-3% so với hôm qua</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
//             <CardTitle className='text-sm font-medium'>Tổng tồn kho</CardTitle>
//             {getTrendIndicator(525, 510)}
//           </CardHeader>
//           <CardContent>
//             <div className='text-2xl font-bold'>525</div>
//             <p className='text-muted-foreground text-xs'>
//               +15 đơn vị so với hôm qua
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
//             <CardTitle className='text-sm font-medium'>Cảnh báo</CardTitle>
//             {getTrendIndicator(1, 2)}
//           </CardHeader>
//           <CardContent>
//             <div className='text-2xl font-bold text-yellow-600'>1</div>
//             <p className='text-muted-foreground text-xs'>-1 so với hôm qua</p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Main Chart */}
//       <Card>
//         <CardHeader>
//           <div className='flex items-center justify-between'>
//             <div>
//               <CardTitle>{getChartTitle()}</CardTitle>
//               <CardDescription>
//                 Dữ liệu thời gian thực cho khu vực {areaId}
//               </CardDescription>
//             </div>
//             <div className='flex gap-2'>
//               <Select value={chartType} onValueChange={setChartType}>
//                 <SelectTrigger className='w-40'>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value='temperature'>Nhiệt độ</SelectItem>
//                   <SelectItem value='humidity'>Độ ẩm</SelectItem>
//                   <SelectItem value='inventory'>Tồn kho</SelectItem>
//                   <SelectItem value='alerts'>Cảnh báo</SelectItem>
//                 </SelectContent>
//               </Select>
//               <Select value={timeRange} onValueChange={setTimeRange}>
//                 <SelectTrigger className='w-32'>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value='24h'>24 giờ</SelectItem>
//                   <SelectItem value='7d'>7 ngày</SelectItem>
//                   <SelectItem value='30d'>30 ngày</SelectItem>
//                   <SelectItem value='90d'>90 ngày</SelectItem>
//                 </SelectContent>
//               </Select>
//               <Button variant='outline' size='sm'>
//                 <IconDownload className='mr-2 h-4 w-4' />
//                 Xuất
//               </Button>
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent>{renderChart()}</CardContent>
//       </Card>

//       {/* Product Distribution */}
//       <div className='grid gap-4 md:grid-cols-2'>
//         <Card>
//           <CardHeader>
//             <CardTitle>Phân bố sản phẩm</CardTitle>
//             <CardDescription>
//               Tỷ lệ các loại sản phẩm trong khu vực
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width='100%' height={250}>
//               <PieChart>
//                 <Pie
//                   data={productDistributionData}
//                   cx='50%'
//                   cy='50%'
//                   labelLine={false}
//                   label={({ name, percent }) =>
//                     `${name} ${(percent * 100).toFixed(0)}%`
//                   }
//                   outerRadius={80}
//                   fill='#8884d8'
//                   dataKey='value'
//                 >
//                   {productDistributionData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//               </PieChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Hiệu suất khu vực</CardTitle>
//             <CardDescription>
//               Các chỉ số hiệu suất trong 7 ngày qua
//             </CardDescription>
//           </CardHeader>
//           <CardContent className='space-y-4'>
//             <div className='flex items-center justify-between'>
//               <span className='text-sm font-medium'>
//                 Tỷ lệ sử dụng dung tích
//               </span>
//               <div className='flex items-center gap-2'>
//                 <Badge variant='outline'>82%</Badge>
//                 <IconTrendingUp className='h-4 w-4 text-green-600' />
//               </div>
//             </div>
//             <div className='flex items-center justify-between'>
//               <span className='text-sm font-medium'>Thời gian hoạt động</span>
//               <div className='flex items-center gap-2'>
//                 <Badge variant='outline'>99.2%</Badge>
//                 <IconTrendingUp className='h-4 w-4 text-green-600' />
//               </div>
//             </div>
//             <div className='flex items-center justify-between'>
//               <span className='text-sm font-medium'>Số lần cảnh báo</span>
//               <div className='flex items-center gap-2'>
//                 <Badge variant='outline'>8</Badge>
//                 <IconTrendingDown className='h-4 w-4 text-red-600' />
//               </div>
//             </div>
//             <div className='flex items-center justify-between'>
//               <span className='text-sm font-medium'>Tốc độ xử lý</span>
//               <div className='flex items-center gap-2'>
//                 <Badge variant='outline'>95%</Badge>
//                 <IconTrendingUp className='h-4 w-4 text-green-600' />
//               </div>
//             </div>
//             <div className='flex items-center justify-between'>
//               <span className='text-sm font-medium'>Độ chính xác cảm biến</span>
//               <div className='flex items-center gap-2'>
//                 <Badge variant='outline'>98.5%</Badge>
//                 <IconMinus className='h-4 w-4 text-gray-600' />
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
