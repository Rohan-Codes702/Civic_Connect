import { useEffect, useState } from "react";
import api from "../api/axios.js";

export default function AdminComplaints() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    q: "",
    status: "",
    category: "",
    sort: "-createdAt",
    page: 1,
    limit: 10,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: list }, { data: summary }] = await Promise.all([
        api.get("/complaints", { params: filters }),
        api.get("/complaints/stats/summary"),
      ]);
      setData(list);
      setStats(summary);
    } catch (err) {
      alert("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.page, filters.sort]);

  const updateStatus = async (id, status) => {
    try {
      const { data: updated } = await api.patch(`/complaints/${id}/status`, { status });
      setData((prev) => ({
        ...prev,
        items: prev.items.map((c) => (c._id === id ? updated : c)),
      }));
      fetchData();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (loading)
    return <div className="text-center py-10 text-lg text-gray-600">Loading...</div>;

  const statusColors = {
    open: "bg-yellow-200 text-yellow-800 border-yellow-400",
    in_progress: "bg-blue-200 text-blue-800 border-blue-400",
    resolved: "bg-green-200 text-green-800 border-green-400",
  };

  return (
    <section className="py-8 space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="p-5 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl shadow text-center">
            <div className="text-gray-500">Total</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="p-5 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-xl shadow text-center">
            <div className="text-yellow-700">Open</div>
            <div className="text-2xl font-bold">{stats.open}</div>
          </div>
          <div className="p-5 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl shadow text-center">
            <div className="text-blue-700">In Progress</div>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </div>
          <div className="p-5 bg-gradient-to-r from-green-100 to-green-200 rounded-xl shadow text-center">
            <div className="text-green-700">Resolved</div>
            <div className="text-2xl font-bold">{stats.resolved}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="sticky top-0 z-10 bg-white border rounded-lg p-4 grid md:grid-cols-5 gap-2 shadow mb-6">
        <input
          className="input input-bordered input-sm"
          placeholder="Search"
          value={filters.q}
          onChange={(e) => setFilters({ ...filters, q: e.target.value, page: 1 })}
        />
        <select
          className="select select-bordered select-sm"
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value, page: 1 })
          }
        >
          <option value="">All status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
        <input
          className="input input-bordered input-sm"
          placeholder="Category"
          value={filters.category}
          onChange={(e) =>
            setFilters({ ...filters, category: e.target.value, page: 1 })
          }
        />
        <select
          className="select select-bordered select-sm"
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
        >
          <option value="-createdAt">Newest</option>
          <option value="createdAt">Oldest</option>
          <option value="title">Title A-Z</option>
          <option value="-title">Title Z-A</option>
        </select>
        <button
          className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white"
          onClick={fetchData}
        >
          Apply
        </button>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {data.items.map((c) => (
          <div
            key={c._id}
            className={`relative border-l-4 rounded-xl p-5 shadow-lg transition-transform transform hover:scale-105 hover:shadow-2xl bg-gradient-to-r ${
              statusColors[c.status]
            }`}
          >
            <div className="flex flex-col md:flex-row justify-between gap-4">
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-xl text-gray-800">{c.title}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[c.status]}`}
                  >
                    {c.status.replace("_", " ")}
                  </span>
                  {c.category && (
                    <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs">
                      {c.category}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mt-2">{c.description}</p>
                <p className="text-gray-400 text-sm mt-1">
                  User: {c.user?.name} ({c.user?.email})
                </p>

                {/* Location */}
                {(c.latitude && c.longitude) || c.location ? (
                  <a
                    className="inline-flex items-center gap-2 mt-3 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg font-medium shadow transition"
                    href={
                      c.latitude && c.longitude
                        ? `https://www.google.com/maps?q=${c.latitude},${c.longitude}`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            c.location
                          )}`
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    📍 View on Maps
                  </a>
                ) : null}
              </div>

              {/* Status Selector */}
              <div className="flex items-start mt-3 md:mt-0">
                <select
                  className="select select-bordered select-sm"
                  value={c.status}
                  onChange={(e) => updateStatus(c._id, e.target.value)}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* Photos */}
            {Array.isArray(c.photos) && c.photos.length > 0 && (
              <div className="mt-4">
                <div className="text-gray-700 font-medium mb-2">📷 Photos</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {c.photos.map((p, idx) => (
                    <a key={idx} href={p.url || p.path} target="_blank" rel="noreferrer">
                      <img
                        src={p.url || p.path}
                        alt={`photo-${idx + 1}`}
                        className="w-full h-28 object-cover rounded-lg border"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-gray-500 text-sm">
          Page {data.page} of {data.pages} • {data.total} total
        </div>
        <div className="join">
          <button
            className="btn btn-sm join-item"
            disabled={data.page <= 1}
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
          >
            Prev
          </button>
          <button
            className="btn btn-sm join-item"
            disabled={data.page >= data.pages}
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
