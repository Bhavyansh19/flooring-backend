import Product from "../models/Product.js";

// GET ALL PRODUCTS
export const getProducts = async (req, res) => {
  try {
    const {
      category,
      subCategory,
      brand,
      search,
      minPrice,
      maxPrice,
      colour,
      waterproof,
      herringbone,
      petFriendly,
      outdoorRated,
      diyFriendly,
      onSale,
      sort = "-createdAt",
      page = 1,
      limit = 12,
    } = req.query;

    const q = {}; // ✅ removed isActive filter

    if (category) {
      q.categorySlug = category.toLowerCase();
    }
    if (subCategory) q.subCategory = subCategory;
    if (brand) q.brand = brand;
    if (onSale === "true") q.onSale = true;

    if (waterproof === "true") q["attributes.waterproof"] = true;
    if (herringbone === "true") q["attributes.herringbone"] = true;
    if (petFriendly === "true") q["attributes.petFriendly"] = true;
    if (outdoorRated === "true") q["attributes.outdoorRated"] = true;
    if (diyFriendly === "true") q["attributes.diyFriendly"] = true;

    if (colour) {
      q["attributes.colour"] = { $regex: colour, $options: "i" };
    }

    if (minPrice || maxPrice) {
      q.price = {};
      if (minPrice) q.price.$gte = +minPrice;
      if (maxPrice) q.price.$lte = +maxPrice;
    }

    if (search) {
      q.name = { $regex: search, $options: "i" }; // ✅ simple search instead of $text
    }

    const total = await Product.countDocuments(q);
    console.log("TOTAL FROM DB:", total);

    const products = await Product.find(q)
      .sort(sort)
      .skip((+page - 1) * +limit)
      .limit(+limit);

    res.json({
      success: true,
      products,
      total,
      page: +page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET SINGLE PRODUCT BY SLUG
export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// FEATURED PRODUCTS (TEMP LOGIC)
export const getFeatured = async (req, res) => {
  try {
    const products = await Product.find().limit(8);

    res.json({
      success: true,
      products,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// NEW PRODUCTS (LATEST)
export const getNew = async (req, res) => {
  try {
    const products = await Product.find().sort("-createdAt").limit(8);

    res.json({
      success: true,
      products,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// CREATE REVIEW
export const createReview = async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);

    if (!p) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (p.reviews.find((r) => r.user.toString() === req.user._id.toString())) {
      return res.status(400).json({
        success: false,
        message: "Already reviewed",
      });
    }

    p.reviews.push({
      user: req.user._id,
      name: `${req.user.firstName} ${req.user.lastName}`,
      rating: +req.body.rating,
      comment: req.body.comment,
    });

    p.numReviews = p.reviews.length;
    p.rating = p.reviews.reduce((a, r) => a + r.rating, 0) / p.reviews.length;

    await p.save();

    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    const p = await Product.create(req.body);

    res.status(201).json({
      success: true,
      product: p,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {
    const p = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!p) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    res.json({
      success: true,
      product: p,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE PRODUCT (SOFT DELETE REMOVED)
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Product removed",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
