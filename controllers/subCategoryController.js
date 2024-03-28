import Category from "../models/categorySchema.js";
import SubCategory from "../models/subCategorySch.js";

export const createSubCategory = async (req, res) => {
  const { categoryId, subCategoryName } = req.body;

  try {
    const parentCategory = await Category.findById(categoryId);
    if (!parentCategory) {
      return res.status(404).json({
        status: 'fail',
        message: 'Category not found',
      });
    }
    const newSubCategory = new SubCategory({
      name: subCategoryName,
      category: parentCategory._id,
    });
    await newSubCategory.save();
    parentCategory.subcategories.push(newSubCategory._id);
    await parentCategory.save();
    return res.status(201).json({ message: 'Subcategory created successfully' });
  } catch (error) {
    console.error('Error creating subcategory:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
export const getSubCategoryByCategory = async (req, res) => {
  const categoryId = req.params.id;
  try {
    const category = await Category.findById(categoryId).populate('subcategories');
    if (!category) {
      return res.status(404).json({
        status: 'fail',
        message: 'Category not found',
      });
    }
    const subCategories = category.subcategories;
    return res.status(200).json({
      status: 'success',
      data: subCategories
    });
  } catch (error) {
    console.error('Error getting subcategories:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
export const deleteSubCategory = async (req, res) => {
  const { categoryId, subCategoryId } = req.body;
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        status: 'fail',
        message: 'Category not found',
      });
    }
    const subCategory = category.subcategories.id(subCategoryId);
    if (!subCategory) {
      return res.status(404).json({
        status: 'fail',
        message: 'Subcategory not found',
      });
    }
    subCategory.remove();
    await category.save();
    return res.status(200).json({ message: 'Subcategory deleted successfully' });
  } catch (error) {
    console.error('Error deleting subcategory:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
