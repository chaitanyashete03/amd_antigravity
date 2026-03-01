import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Package, AlertTriangle, TrendingUp, IndianRupee } from 'lucide-react';

// Mock Data
const MOCK_SALES_TREND = [
    { name: '1', sales: 4000, revenue: 24000 },
    { name: '5', sales: 3000, revenue: 13980 },
    { name: '10', sales: 2000, revenue: 9800 },
    { name: '15', sales: 2780, revenue: 39080 },
    { name: '20', sales: 1890, revenue: 4800 },
    { name: '25', sales: 2390, revenue: 3800 },
    { name: '30', sales: 3490, revenue: 4300 },
];

const MOCK_TOP_PRODUCTS = [
    { name: 'Basmati Rice 5kg', sales: 400 },
    { name: 'Toor Dal 1kg', sales: 300 },
    { name: 'Sunflower Oil 1L', sales: 300 },
    { name: 'Aashirvaad Atta 5kg', sales: 200 },
    { name: 'Tata Salt 1kg', sales: 278 },
    { name: 'Maggi 2-Min Noodles', sales: 189 },
];

const MOCK_CATEGORIES = [
    { name: 'Groceries', value: 400 },
    { name: 'Snacks', value: 300 },
    { name: 'Beverages', value: 300 },
    { name: 'Personal Care', value: 200 },
];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const MOCK_ALERTS = [
    { id: 1, name: 'Maggi 2-Min Noodles', sku: 'MG-001', stock: 12 },
    { id: 2, name: 'Tata Salt 1kg', sku: 'TS-001', stock: 4 },
    { id: 3, name: 'Red Label Tea 250g', sku: 'RL-001', stock: 8 },
];

export default function Dashboard() {
    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(true);

    // Formatting utility per locale
    const formatCurrency = (value) => {
        const localeMap = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' };
        const currLocale = localeMap[i18n.language] || 'en-IN';
        return new Intl.NumberFormat(currLocale, {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatNumber = (value) => {
        const localeMap = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' };
        const currLocale = localeMap[i18n.language] || 'en-IN';
        return new Intl.NumberFormat(currLocale).format(value);
    };

    useEffect(() => {
        // Simulate API fetch delay
        const timer = setTimeout(() => {
            setLoading(false);
        }, 600);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('dashboard')}</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                        <Package className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">{t('totalProducts')}</p>
                        <p className="text-2xl font-bold text-gray-900">{formatNumber(1248)}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">{t('lowStockAlerts')}</p>
                        <p className="text-2xl font-bold text-gray-900">{formatNumber(18)}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">{t('topSeller')}</p>
                        <p className="text-lg font-bold text-gray-900 truncate max-w-[120px]">Basmati Rice 5kg</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                        <IndianRupee className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">{t('salesToday')}</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(48500)}</p>
                    </div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Line Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">{t('salesTrendTitle')}</h2>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={MOCK_SALES_TREND} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(value, name) => [name === 'revenue' ? formatCurrency(value) : formatNumber(value), t(name)]}
                                />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="sales" name="sales" stroke="#3B82F6" strokeWidth={3} activeDot={{ r: 8 }} />
                                <Line yAxisId="right" type="monotone" dataKey="revenue" name="revenue" stroke="#10B981" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">{t('categoryDistributionTitle')}</h2>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={MOCK_CATEGORIES}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {MOCK_CATEGORIES.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatNumber(value)} />
                                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Row 3 - Bar Chart & Table */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bar Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">{t('topProductsTitle')}</h2>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={MOCK_TOP_PRODUCTS} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fill: '#4B5563', fontSize: 12 }} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                <Bar dataKey="sales" name={t('sales')} fill="#6366F1" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">{t('lowStockAlertTableTitle')}</h2>
                    <div className="flex-1 overflow-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('productName')}
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('sku')}
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('currentStock')}
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('action')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {MOCK_ALERTS.map((alert) => (
                                    <tr key={alert.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {alert.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {alert.sku}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                                            {alert.stock}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors">
                                                {t('restockBtn')}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
