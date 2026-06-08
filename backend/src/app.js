import cors from 'cors';
import express from 'express';
import { Item } from './models/Item.js';

const textFields = ['name', 'category', 'description', 'imageUrl', 'warrantyTerms'];

function normalizeItem(body) {
  const item = {};

  for (const field of textFields) {
    item[field] = typeof body[field] === 'string' ? body[field].trim() : '';
  }

  item.price =
    body.price === '' || body.price === null || body.price === undefined
      ? Number.NaN
      : Number(body.price);
  return item;
}

function validateItem(item) {
  const errors = {};

  if (!item.name) errors.name = 'Item name is required';
  if (item.name.length > 120) errors.name = 'Item name must be 120 characters or fewer';

  if (!item.category) errors.category = 'Category is required';
  if (item.category.length > 80) errors.category = 'Category must be 80 characters or fewer';

  if (!Number.isFinite(item.price) || item.price < 0) {
    errors.price = 'Price must be a number greater than or equal to 0';
  }

  if (!item.description) errors.description = 'Description is required';
  if (item.description.length > 1000) {
    errors.description = 'Description must be 1000 characters or fewer';
  }

  if (item.imageUrl) {
    try {
      const url = new URL(item.imageUrl);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    } catch {
      errors.imageUrl = 'Image URL must be a valid http or https address';
    }
  }

  if (item.warrantyTerms.length > 300) {
    errors.warrantyTerms = 'Warranty terms must be 300 characters or fewer';
  }

  return errors;
}

export function createApp(ItemModel = Item) {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  app.get('/api/items', async (_request, response, next) => {
    try {
      const items = await ItemModel.find().sort({ createdAt: -1 });
      response.json(items);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/items/:id', async (request, response, next) => {
    try {
      const item = await ItemModel.findById(request.params.id);
      if (!item) return response.status(404).json({ message: 'Item not found' });
      return response.json(item);
    } catch (error) {
      return next(error);
    }
  });

  app.post('/api/items', async (request, response, next) => {
    try {
      const itemData = normalizeItem(request.body);
      const errors = validateItem(itemData);

      if (Object.keys(errors).length > 0) {
        return response.status(400).json({ message: 'Please correct the highlighted fields', errors });
      }

      const item = await ItemModel.create(itemData);
      return response.status(201).json(item);
    } catch (error) {
      return next(error);
    }
  });

  app.put('/api/items/:id', async (request, response, next) => {
    try {
      const itemData = normalizeItem(request.body);
      const errors = validateItem(itemData);

      if (Object.keys(errors).length > 0) {
        return response.status(400).json({ message: 'Please correct the highlighted fields', errors });
      }

      const item = await ItemModel.findByIdAndUpdate(request.params.id, itemData, {
        new: true,
        runValidators: true
      });

      if (!item) return response.status(404).json({ message: 'Item not found' });
      return response.json(item);
    } catch (error) {
      return next(error);
    }
  });

  app.delete('/api/items/:id', async (request, response, next) => {
    try {
      const item = await ItemModel.findByIdAndDelete(request.params.id);
      if (!item) return response.status(404).json({ message: 'Item not found' });
      return response.status(204).send();
    } catch (error) {
      return next(error);
    }
  });

  app.use((error, _request, response, next) => {
    void next;

    if (error.name === 'CastError') {
      return response.status(400).json({ message: 'Invalid item ID' });
    }

    console.error(error);
    return response.status(500).json({ message: 'Internal server error' });
  });

  return app;
}
