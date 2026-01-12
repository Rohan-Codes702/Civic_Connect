import { useEffect, useState } from "react";
import api from "../api/axios.js";

export default function MyComplaints() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ q: "", status: "", category: "", sort: "-createdAt", page: 1, limit: 10 });
  const [commentDrafts, setCommentDrafts] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/complaints", { params: filters });
      setData(data);
    } catch (err) {
      alert("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.page, filters.sort]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this complaint?")) return;
    await api.delete(`/complaints/${id}`);
    fetchData();
  };

  const handleStatus = async (id, status) => {
    const { data: updated } = await api.put(`/complaints/${id}`, { status });
    setData((prev) => ({ ...prev, items: prev.items.map((c) => (c._id === id ? updated : c)) }));
  };

  const addComment = async (id) => {
    const text = commentDrafts[id]?.trim();
    if (!text) return;
    await api.post(`/complaints/${id}/comments`, { text });
    setCommentDrafts((d) => ({ ...d, [id]: "" }));
    fetchData();
  };

  if (loading) return <div className="text-center py-20 text-gray-500 text-lg animate-pulse">Loading complaints...</div>;

  return (
    <section className="py-12 bg-gradient-to-b from-white-800 via-white to-white-800  flex flex-col items-center">
      <div className="w-full max-w-6xl px-4">
        <h2 className="text-4xl font-extrabold text-center text-indigo-700 mb-10">My Complaints Dashboard</h2>

        {/* Filters */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 grid md:grid-cols-5 gap-4 mb-10">
          <input
            className="input input-bordered input-sm w-full border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
            placeholder="Search"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value, page: 1 })}
          />
          <select
            className="select select-bordered select-sm w-full border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <input
            className="input input-bordered input-sm w-full border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
            placeholder="Category"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
          />
          <select
            className="select select-bordered select-sm w-full border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
          >
            <option value="-createdAt">Newest</option>
            <option value="createdAt">Oldest</option>
            <option value="title">Title A-Z</option>
            <option value="-title">Title Z-A</option>
          </select>
          <button className="btn btn-primary btn-sm w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:scale-105 transition-transform">Apply</button>
        </div>

        {/* Complaints */}
        <div className="space-y-6">
          {data.items.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 hover:scale-102 hover:shadow-2xl transition-transform duration-300"
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-indigo-700">{c.title}</h3>
                  <p className="text-gray-600 mt-2">{c.description}</p>
                  <p className="mt-2">
                    Status:{" "}
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        c.status === "resolved"
                          ? "bg-green-100 text-green-800"
                          : c.status === "in_progress"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {c.status.replace("_", " ")}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="select select-bordered select-sm"
                    value={c.status}
                    onChange={(e) => handleStatus(c._id, e.target.value)}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <button className="btn btn-error btn-sm hover:scale-105 transition-transform" onClick={() => handleDelete(c._id)}>Delete</button>
                </div>
              </div>

              {/* Comments */}
              <div className="mt-5">
                <div className="text-gray-700 font-semibold mb-2">Comments</div>
                <div className="space-y-1 max-h-32 overflow-y-auto p-2 bg-indigo-50 rounded-lg">
                  {(c.comments || []).slice(-3).map((cm) => (
                    <div key={cm._id} className="text-gray-700 text-sm">• {cm.text}</div>
                  ))}
                  {(c.comments || []).length > 3 && <div className="text-gray-400 text-xs">… older comments hidden</div>}
                </div>
                <div className="flex gap-2 mt-3">
                  <input
                    className="input input-bordered input-sm flex-1"
                    placeholder="Add a comment"
                    value={commentDrafts[c._id] || ""}
                    onChange={(e) => setCommentDrafts((d) => ({ ...d, [c._id]: e.target.value }))}
                  />
                  <button className="btn btn-primary btn-sm bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:scale-105 transition-transform" onClick={() => addComment(c._id)}>Post</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-10">
          <div className="text-gray-500 text-sm">Page {data.page} of {data.pages} • {data.total} complaints</div>
          <div className="join">
            <button className="btn btn-sm join-item" disabled={data.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>Prev</button>
            <button className="btn btn-sm join-item" disabled={data.page >= data.pages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>Next</button>
          </div>
        </div>
      </div>
    </section>
  );
}
