import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiFilter } from "react-icons/fi";
import ResourceCard from "../components/ResourceCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { resourceAPI } from "../services/api";
import toast from "react-hot-toast";

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchResources();
  }, [filter]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== "all") params.type = filter;

      const response = await resourceAPI.getAll(params);
      setResources(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch resources");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (resource) => {
    navigate("/booking", { state: { selectedResource: resource } });
  };

  const filteredResources = useMemo(() => {
    return resources.filter(
      (resource) =>
        resource.name.toLowerCase().includes(search.toLowerCase()) ||
        resource.description.toLowerCase().includes(search.toLowerCase()),
    );
  }, [resources, search]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Resource Explorer
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Browse and book available campus resources
        </p>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-2">
            <FiFilter className="text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Types</option>
              <option value="classroom">Classrooms</option>
              <option value="lab">Labs</option>
              <option value="sports">Sports</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource._id}
              resource={resource}
              onBook={handleBook}
            />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No resources found matching your criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default Resources;
