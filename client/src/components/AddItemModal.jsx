import { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";

const AddItemModal = ({ isOpen, onClose, category, onSuccess }) => {
  const [formData, setFormData] = useState({});
  const [imagePreview, setImagePreview] = useState("");
  const [rooms, setRooms] = useState([]);
  const [artists, setArtists] = useState([]);
  const [mediums, setMediums] = useState([]);
  const [collections, setCollections] = useState([]);
  const [exhibitions, setExhibitions] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch rooms
        const roomsResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/room`
        );
        setRooms(roomsResponse.data);

        // Fetch category-specific data
        if (category === "art") {
          const [
            artistsResponse,
            mediumsResponse,
            collectionsResponse,
            exhibitionsResponse,
          ] = await Promise.all([
            axios.get(`${import.meta.env.VITE_BACKEND_URL}/artist`),
            axios.get(`${import.meta.env.VITE_BACKEND_URL}/art/mediums`),
            axios.get(`${import.meta.env.VITE_BACKEND_URL}/collection`),
            axios.get(`${import.meta.env.VITE_BACKEND_URL}/exhibition`),
          ]);

          setArtists(artistsResponse.data);
          setCollections(collectionsResponse.data);
          setExhibitions(exhibitionsResponse.data);

          // Filter out empty string and set mediums directly
          const filteredMediums = mediumsResponse.data.filter(
            (medium) => medium !== ""
          );
          setMediums(filteredMediums);
        }

        if (category === "product") {
          const categoriesResponse = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/product_category`
          );
          setProductCategories(categoriesResponse.data);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching options:", error);
        setError("Failed to load form options. Please try again.");
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen, category]);

  useEffect(() => {
    if (!isOpen) {
      setImagePreview(""); // Reset image preview
      setFormData({}); // Reset form data
      setError(null); // Reset any errors
      setSuccess(false); // Reset success state
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let endpoint = `${import.meta.env.VITE_BACKEND_URL}/${category}`;
      let processedData = { ...formData };

      // Process data based on category
      switch (category) {
        case "art":
          processedData = {
            art_id: parseInt(formData.art_id),
            artist_id: parseInt(formData.artist_id),
            collection_id:
              formData.location_type === "collection"
                ? parseInt(formData.collection_id)
                : null,
            exhibit_id:
              formData.location_type === "exhibition"
                ? parseInt(formData.exhibit_id)
                : null,
            art_title: formData.art_title,
            art_desc: formData.art_desc,
            art_image_path: formData.image_url,
            art_medium: formData.art_medium,
            date_created: formData.date_created,
            date_received: formData.date_received,
          };
          break;

        case "exhibition":
          processedData = {
            name: formData.name,
            description: formData.description,
            room_id: rooms.find((room) => room.room_name === formData.room_name)
              ?.room_id,
            start_date: formData.start_date,
            end_date: formData.end_date,
            image_path: formData.image_url,
            is_active: true,
            admission_price: parseFloat(formData.admission_price || 0).toFixed(
              2
            ),
          };
          break;

        case "collection":
          processedData = {
            title: formData.title,
            description: formData.description,
            room_id: rooms.find((room) => room.room_name === formData.room_name)
              ?.room_id,
            image_path: formData.image_url,
            is_active: true,
          };
          break;

        case "product":
          processedData = {
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            quantity: parseInt(formData.quantity),
            product_category_id: productCategories.find(
              (cat) => cat.name === formData.category_name
            )?.product_category_id,
            image_path: formData.image_url,
          };
          break;

        case "ticket":
          processedData = {
            type: formData.type,
            price: parseFloat(formData.price),
            quantity: parseInt(formData.quantity),
            requirement: formData.requirement,
          };
          break;
      }

      // Log the data being sent
      console.log("Sending to endpoint:", endpoint);
      console.log("Processed data:", processedData);

      const response = await axios.post(endpoint, processedData);
      console.log("Response:", response);

      if (response.status === 201) {
        setSuccess(true);
        onSuccess?.(); // Call the onSuccess callback
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error("Error details:", error.response?.data || error.message);
      setError(
        error.response?.data?.message ||
          "Failed to save data. Please try again."
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "image_url") {
      setImagePreview(value);
    }
  };

  const renderImagePreview = () => {
    return (
      imagePreview && (
        <div className="mt-2">
          <img
            src={imagePreview}
            alt="Preview"
            className="max-h-40 object-contain"
            onError={() => setImagePreview("")}
          />
        </div>
      )
    );
  };

  const renderFields = () => {
    switch (category) {
      case "exhibition":
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room
              </label>
              <select
                name="room_name"
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select a room</option>
                {rooms.map((room) => (
                  <option key={`room-${room.room_id}`} value={room.room_name}>
                    {room.room_name} (Floor {room.floor_number})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  name="end_date"
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admission Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2">$</span>
                <input
                  type="number"
                  name="admission_price"
                  value={formData.admission_price || ""}
                  onChange={handleChange}
                  min="0"
                  max="99.99"
                  step="0.01"
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md"
                  required
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                name="image_url"
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              {renderImagePreview()}
            </div>
          </>
        );

      case "collection":
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="title"
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room
              </label>
              <select
                name="room_name"
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select a room</option>
                {rooms.map((room) => (
                  <option key={room.room_id} value={room.room_name}>
                    {room.room_name} (Floor {room.floor_number})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                name="image_url"
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              {renderImagePreview()}
            </div>
          </>
        );

      case "art":
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                name="art_title"
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="art_desc"
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Artist
              </label>
              <select
                name="artist_id"
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select an artist</option>
                {artists.map((artist) => (
                  <option
                    key={`artist-${artist.artist_id}`}
                    value={artist.artist_id}
                  >
                    {artist.first_name} {artist.middle_initial}{" "}
                    {artist.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medium
              </label>
              <select
                name="art_medium"
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select a medium</option>
                {mediums.map((medium) => (
                  <option key={medium} value={medium}>
                    {medium}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location Type
              </label>
              <select
                name="location_type"
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select a location type</option>
                <option value="collection">Collection</option>
                <option value="exhibition">Exhibition</option>
              </select>
            </div>

            {formData.location_type === "collection" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Collection
                </label>
                <select
                  name="collection_id"
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select a collection</option>
                  {collections.map((collection) => (
                    <option
                      key={collection.collection_id}
                      value={collection.collection_id}
                    >
                      {collection.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.location_type === "exhibition" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exhibition
                </label>
                <select
                  name="exhibit_id"
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select an exhibition</option>
                  {exhibitions.map((exhibition) => (
                    <option
                      key={exhibition.exhibit_id}
                      value={exhibition.exhibit_id}
                    >
                      {exhibition.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Created
                </label>
                <input
                  type="date"
                  name="date_created"
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Received
                </label>
                <input
                  type="date"
                  name="date_received"
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                name="image_url"
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              {renderImagePreview()}
            </div>
          </>
        );

      case "artist":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Middle Initial
                </label>
                <input
                  type="text"
                  name="middle_initial"
                  maxLength="1"
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </>
        );
      case "product":
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  max="999"
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category_name"
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select a category</option>
                {productCategories.map((category) => (
                  <option key={`category-${category.id}`} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                name="image_url"
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              {renderImagePreview()}
            </div>
          </>
        );

      case "ticket":
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <input
                type="text"
                name="type"
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requirement
              </label>
              <input
                type="text"
                name="requirement"
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </>
        );

      default:
        return <p>No form fields defined for this category</p>;
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Add New {category.charAt(0).toUpperCase() + category.slice(1)}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            Successfully added new {category}!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {renderFields()}

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add {category}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
AddItemModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  category: PropTypes.string.isRequired,
  onSuccess: PropTypes.func, // Add this prop type
};

export default AddItemModal;
