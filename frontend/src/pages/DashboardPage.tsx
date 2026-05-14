import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";

interface DashboardData {
  totalProducts: number;
  criticalProducts: number;
  todayMovements: number;
  inventoryValue: number;
  criticalProductsList: {
    id: string;
    name: string;
    sku: string;
    stock: number;
    minStock: number;
  }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard")
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!data) return <p>Error al cargar dashboard</p>;

  const kpis = [
    {
      label: "Total Productos",
      value: data.totalProducts,
      icon: "📦",
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Valor del Inventario",
      value: `$${data.inventoryValue.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
      icon: "💰",
      color: "bg-green-50 text-green-700",
    },
    {
      label: "Productos Críticos",
      value: data.criticalProducts,
      icon: "🔴",
      color:
        data.criticalProducts > 0
          ? "bg-red-50 text-red-700"
          : "bg-gray-50 text-gray-700",
    },
    {
      label: "Movimientos Hoy",
      value: data.todayMovements,
      icon: "🔄",
      color: "bg-purple-50 text-purple-700",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={`rounded-xl p-5 ${kpi.color} shadow-sm`}
          >
            <div className="text-2xl mb-1">{kpi.icon}</div>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <div className="text-sm opacity-75">{kpi.label}</div>
          </div>
        ))}
      </div>

      {data.criticalProductsList.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-5">
          <h3 className="text-lg font-semibold text-red-700 mb-3">
            ⚠️ Productos en Nivel Crítico
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2 pr-4">SKU</th>
                  <th className="pb-2 pr-4">Producto</th>
                  <th className="pb-2 pr-4">Stock Actual</th>
                  <th className="pb-2">Stock Mínimo</th>
                </tr>
              </thead>
              <tbody>
                {data.criticalProductsList.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-mono text-xs">{p.sku}</td>
                    <td className="py-2 pr-4">
                      <Link
                        to={`/products/${p.id}`}
                        className="text-primary-600 hover:underline"
                      >
                        {p.name}
                      </Link>
                    </td>
                    <td className="py-2 pr-4 text-red-600 font-semibold">
                      {p.stock}
                    </td>
                    <td className="py-2">{p.minStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
