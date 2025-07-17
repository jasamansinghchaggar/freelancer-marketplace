import { Request, Response } from 'express';
import { getAllCategoriesService, findOrCreateCategoryService } from '../services/category.service';

export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await getAllCategoriesService();
        res.json(categories);
    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch categories',
            error,
        });
    }
};
// Create a new category or return existing
export const createCategory = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }
        const category = await findOrCreateCategoryService(name);
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create category', error });
    }
};
