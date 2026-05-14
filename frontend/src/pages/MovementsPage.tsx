import { useState, useEffect, FormEvent } from "react";
import api from "../api";

interface Product {
  id: string;
  sku: string;
  name: string;
}

interface Movement {
  id: string;
  type: string;
  quantity: number;
  reason: string;
  supplier: string;
  createdAt: string;
  product: { name: string; sku: string };
  user: { name: string };
  newStock?: number;
  message?: string;
}

export default function MovementsPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    productId: "",
    type: "entrada" as "entrada" | "salida",
    quantity: 1,
    reason: "",
    supplier: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchMovements = () => {
    api
      .get("/movements")
      .then((res) => setMovements(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMovements();
    api
      .get("/products")
      .then((res) => setProducts(res.data))
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await api.post("/movements", form);
      setSuccess(
        `${res.data.message}. Stock actual: ${res.data.newStock}`
      );
      setForm({ productId: "", type: "entrada", quantity: 1, reason: "", supplier: "" });
      setShowForm(false);
      fetchMovements();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Error al registrar movimiento";
      setError(msg);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Movimientos</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setSuccess("");
          }}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          + Nuevo Movimiento
        </button>
      </div>

      {success && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
          ✅ {success}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border p-5 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">
            Registrar Movimiento
          </h3>
          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-2 rounded mb-3 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de movimiento
                </label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type: e.target.value as "entrada" | "salida",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="entrada">📥 Entrada (recepción)</option>
                  <option value="salida">📤 Salida (venta/merma)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Producto
                </label>
                <select
                  value={form.productId}
                  onChange={(e) =>
                    setForm({ ...form, productId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                >
                  <option value="">Seleccionar producto...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku} - {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad
                </label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      quantity: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  min="1"
                  required
                />
              </div>
              {form.type === "entrada" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proveedor (opcional)
                  </label>
                  <input
                    type="text"
                    value={form.supplier}
                    onChange={(e) =>
                      setForm({ ...form, supplier: e.target.value })
                    }
                    placeholder="Ej: Distribuidora XYZ"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo
                  </label>
                  <select
                    value={form.reason}
                    onChange={(e) =>
                      setForm({ ...form, reason: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="venta">Venta</option>
                    <option value="merma">Merma</option>
                    <option value="consumo">Consumo interno</option>
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : movements.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-2">🔄</p>
          <p>No hay movimientos registrados</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b bg-gray-50">
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Cantidad</th>
                <th className="px-4 py-3">Detalle</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => (
                <tr
                  key={m.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
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
                  <td className="px-4 py-3">
                    <span className="font-medium">{m.product.name}</span>
                    <br />
                    <span className="text-xs text-gray-400 font-mono">
                      {m.product.sku}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{m.quantity}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {m.type === "entrada"
                      ? m.supplier || "Sin proveedor"
                      : m.reason || "Sin motivo"}
                  </td>
                  <td className="px-4 py-3">{m.user.name}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(m.createdAt).toLocaleString("es-MX")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
