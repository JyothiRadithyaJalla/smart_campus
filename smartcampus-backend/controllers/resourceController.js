const Resource = require("../models/Resource");

exports.getResources = async (req, res) => {
  try {
    const { type, search, sort } = req.query;

    let query = {};

    if (type && type !== "all") {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    let resources = Resource.find(query).select("-__v").lean();

    if (sort) {
      const sortBy =
        sort === "name"
          ? "name"
          : sort === "capacity"
            ? "-capacity"
            : "-createdAt";
      resources = resources.sort(sortBy);
    }

    const result = await resources;

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching resources",
    });
  }
};

exports.getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    res.status(200).json({
      success: true,
      data: resource,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching resource",
    });
  }
};

exports.createResource = async (req, res) => {
  try {
    const resource = await Resource.create(req.body);

    res.status(201).json({
      success: true,
      message: "Resource created successfully",
      data: resource,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Error creating resource",
    });
  }
};

exports.updateResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Resource updated successfully",
      data: resource,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Error updating resource",
    });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Resource deleted successfully",
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting resource",
    });
  }
};
