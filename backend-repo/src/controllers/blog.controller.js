import Blog from "../models/Blog.js";

export const getBlogs = async (req, res) => {
  try {
    const { category, featured, page = 1, limit = 9 } = req.query;
    const q = { isPublished: true };
    if (category && category !== "all") q.category = category;
    if (featured === "true") q.featured = true;
    const total = await Blog.countDocuments(q);
    const blogs = await Blog.find(q)
      .sort("-publishedAt")
      .skip((+page - 1) * +limit)
      .limit(+limit);
    res.json({ success: true, blogs, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug, isPublished: true },
      { $inc: { views: 1 } },
      { new: true },
    );
    if (!blog)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, blog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createBlog = async (req, res) => {
  try {
    if (req.body.isPublished) req.body.publishedAt = new Date();
    const blog = await Blog.create(req.body);
    res.status(201).json({ success: true, blog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!blog)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, blog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Blog deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
