import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";

interface Movement {
  id: string;
  type: string;
  quantity: number;
  reason: string;
  supplier: string;
  createdAt: string;
  user: { name: string };
}

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  costPrice: number;
  stock: number;
  minStock: number;
  alertActive: boolean;
  movements: Movement[];
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!product) return <p>Producto no encontrado</p>;

  return (
    <div>
      <Link
        to="/products"
        className="text-primary-600 hover:underline text-sm mb-4 inline-block"
      >
        ← Volver a productos
      </Link>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
            <p className="text-gray-500 font-mono text-sm">{product.sku}</p>
          </div>
          {product.alertActive && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
              ⚠️ Stock Crítico
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Stock Actual</p>
            <p
              className={`text-2xl font-bold ${product.alertActive ? "text-red-600" : "text-gray-800"}`}
            >
              {product.stock}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Stock Mínimo</p>
            <p className="text-2xl font-bold text-gray-800">
              {product.minStock}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Precio Costo</p>
            <p className="text-2xl font-bold text-gray-800">
              ${product.costPrice.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Valor en Stock</p>
            <p className="text-2xl font-bold text-green-700">
              $
              {(product.stock * product.costPrice).toLocaleString("es-MX", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-2 text-sm">
          <span className="px-2 py-1 bg-gray-100 rounded">{product.category}</span>
          <span className="px-2 py-1 bg-gray-100 rounded">{product.unit}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Últimos Movimientos
        </h3>
        {product.movements.length === 0 ? (
          <p className="text-gray-500 text-sm">Sin movimientos registrados</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2 pr-4">Tipo</th>
                  <th className="pb-2 pr-4">Cantidad</th>
                  <th className="pb-2 pr-4">Motivo / Proveedor</th>
                  <th className="pb-2 pr-4">Usuario</th>
                  <th className="pb-2">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {product.movements.map((m) => (
                  <tr key={m.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          m.type === "entrada"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {m.type === "entrada" ? "📥 Entrada" : "📤 Salida"}
                      </span>
                    </td>
                    <td className="py-2 pr-4 font-semibold">{m.quantity}</td>
                    <td className="py-2 pr-4 text-gray-500">
                      {m.type === "entrada"
                        ? m.supplier || "Sin proveedor"
                        : m.reason || "Sin motivo"}
                    </td>
                    <td className="py-2 pr-4">{m.user.name}</td>
                    <td className="py-2 text-gray-500">
                      {new Date(m.createdAt).toLocaleString("es-MX")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
