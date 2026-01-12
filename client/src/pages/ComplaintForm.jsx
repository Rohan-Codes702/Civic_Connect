import { useState } from "react";
import api from "../api/axios.js";
import { useNavigate } from "react-router-dom";

const ISSUE_CATEGORIES = [
  { value: "potholes", label: "Potholes & Road Damage" },
  { value: "streetlights", label: "Street Lighting Issues" },
  { value: "garbage", label: "Garbage & Waste Management" },
  { value: "water", label: "Water & Sewage Problems" },
  { value: "parks", label: "Parks & Recreation" },
  { value: "traffic", label: "Traffic & Safety" },
  { value: "other", label: "Other Issues" }
];

export default function ComplaintForm() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "potholes",
    location: "",
    latitude: "",
    longitude: ""
  });

  const [photos, setPhotos] = useState([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setForm((prev) => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        }));
        setIsGettingLocation(false);
      },
      (error) => {
        alert("Error getting location: " + error.message);
        setIsGettingLocation(false);
      }
    );
  };

  const compressImage = (file, maxWidth = 800, quality = 0.8) =>
    new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('File size too large. Max 5MB.'));
        return;
      }
      compressImage(file)
        .then(resolve)
        .catch(reject);
    });

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (photos.length + files.length > 5) {
      alert("You can upload a maximum of 5 photos.");
      return;
    }

    try {
      const dataUrls = await Promise.all(files.map(fileToDataUrl));
      const newPhotos = dataUrls.map((dataUrl) => ({ file: null, preview: dataUrl, dataUrl }));
      setPhotos((prev) => [...prev, ...newPhotos]);
      e.target.value = '';
    } catch (err) {
      alert(`Failed to process image(s): ${err.message}`);
    }
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const complaintData = {
        title: form.title,
        description: form.description,
        category: form.category,
        location: form.location,
        ...(form.latitude &&
          form.longitude && {
            latitude: parseFloat(form.latitude),
            longitude: parseFloat(form.longitude)
          }),
        photos: photos.map((p) => ({ url: p.dataUrl || p.preview }))
      };

      await api.post("/complaints", complaintData);
      navigate("/complaints");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to submit complaint";
      if (err.response?.status === 413) {
        alert("Error: Data too large. Reduce number or size of photos.");
      } else {
        alert(`Error: ${errorMessage}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-gradient-to-b from-white-800 via-white to-purple-50  flex items-center justify-center p-6">
      <div className="backdrop-blur-xl bg-white/40 border border-white/30 rounded-3xl shadow-2xl w-full max-w-3xl p-10">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">
          Report an Issue
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Issue Title</label>
            <input
              type="text"
              placeholder="Brief description"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="w-full p-4 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white/60 transition"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Issue Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full p-4 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white/60 transition"
            >
              {ISSUE_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Detailed Description</label>
            <textarea
              rows="5"
              placeholder="Provide detailed information..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              className="w-full p-4 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white/60 transition resize-none"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Location</label>
            <div className="flex gap-3">
              <input
                placeholder="Address or location description"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
                className="flex-1 p-4 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white/60 transition"
              />
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className={`px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold shadow hover:scale-105 transition-transform ${
                  isGettingLocation ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isGettingLocation ? "Getting..." : "📍 GPS"}
              </button>
            </div>
            {form.latitude && form.longitude && (
              <p className="text-sm text-gray-600 mt-1">
                Coordinates: {form.latitude}, {form.longitude}
              </p>
            )}
          </div>

          {/* Photos */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Photos (Optional) - {photos.length}/5 uploaded
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Upload up to 5 photos. Images will be automatically compressed.
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              disabled={photos.length >= 5}
              className="w-full p-2 rounded-xl border border-gray-300 bg-white/60 disabled:opacity-50 disabled:cursor-not-allowed transition"
            />

            {photos.length > 0 && (
              <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                {photos.map((photo, index) => (
                  <div key={index} className="relative rounded-xl overflow-hidden border border-gray-300 shadow-sm hover:scale-105 transition-transform">
                    <img src={photo.preview} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full px-2 py-1 text-sm shadow hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 text-lg font-bold rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg hover:scale-105 transition-transform duration-300"
          >
            {isSubmitting ? "Submitting..." : "Submit Complaint"}
          </button>
        </form>
      </div>
    </section>
  );
}
