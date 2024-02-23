import Category from "../models/categorySchema.js";

export const createCategory = async (req, res) => {
  const categoryData = req.body;
  const categoryName = req.body.name;

  try {
    const oldCategory = await Category.find({ name: categoryName });
    if (oldCategory.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Category already exists',
      });
    }
    const category = new Category(categoryData);
    await category.save();
    res.status(201).json({
      status: 'success',
      data: category,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'fail',
      message: error.message || 'Internal Server Error',
    });
  }
};

export const getAllCategory = async (req,res) => {
  try {
    const category = await Category.find().sort(req.query.category);
    if(category){
      res.status(200).json({
        status:"success",
        data: category
      })
    }else{
      throw new Error("Couldn't find category");
    }
  } catch (error) {
    res.status(500).json({
      status:'fail',
      message: error.message
    }); 
  }
}