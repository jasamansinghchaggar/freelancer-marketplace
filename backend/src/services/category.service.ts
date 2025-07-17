import Category from '../models/category.model';

export const findOrCreateCategoryService = async (name: string) => {
    const trimmed = name.trim();
    let category = await Category.findOne({ name: { $regex: new RegExp(`^${trimmed}$`, 'i') } });
    if (!category) {
        category = await Category.create({ name: trimmed });
    }
    return category;
};

export const getAllCategoriesService = async () => {
    return await Category.find().sort('name');
};
