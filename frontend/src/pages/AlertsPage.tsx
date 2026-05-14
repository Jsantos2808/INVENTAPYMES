import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";

interface Alert {
  id: string;
  currentStock: number;
  minStock: number;
  sent: boolean;
  resolved: boolean;
  createdAt: string;
  product: {
    name: string;
    sku: string;
    stock: number;
    minStock: number;
  };
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const endpoint = showAll ? "/alerts" : "/alerts/active";
    api
      .get(endpoint)
      .then((res) => setAlerts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [showAll]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Alertas de Stock
        </h2>
        <button
          onClick={() => {
            setLoading(true);
            setShowAll(!showAll);
          }}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
        >
          {showAll ? "Solo activas" : "Ver todas"}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-2">✅</p>
          <p>No hay alertas {showAll ? "" : "activas"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-xl border p-4 ${
                alert.resolved
                  ? "bg-gray-50 border-gray-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">
                      {alert.resolved ? "✅" : "⚠️"}
                    </span>
                    <Link
                      to={`/products/${alert.id}`}
                      className="font-semibold text-gray-800 hover:text-primary-600"
                    >
                      {alert.product.name}
                    </Link>
                    <span className="text-xs text-gray-400 font-mono">
                      {alert.product.sku}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Stock al momento de alerta:{" "}
                    <span className="font-semibold text-red-600">
                      {alert.currentStock}
                    </span>{" "}
                    | Mínimo configurado:{" "}
                    <span className="font-semibold">{alert.minStock}</span>
                  </p>
                  {!alert.resolved && (
                    <p className="text-sm text-gray-600 mt-1">
                      Stock actual:{" "}
                      <span className="font-semibold text-red-600">
                        {alert.product.stock}
                      </span>
                    </p>
                  )}
                </div>
                <div className="text-right text-xs text-gray-400">
                  <p>
                    {new Date(alert.createdAt).toLocaleString("es-MX")}
                  </p>
                  {alert.resolved && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-700 mt-1">
                      Resuelta
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
