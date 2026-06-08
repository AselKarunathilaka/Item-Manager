import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from './app.js';

function createItemModel(overrides = {}) {
  return {
    find: vi.fn(() => ({ sort: vi.fn().mockResolvedValue([]) })),
    findById: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
    ...overrides
  };
}

const validItem = {
  name: 'Mechanical Keyboard',
  category: 'Electronics',
  price: 89.99,
  description: 'Compact wireless keyboard with tactile switches.',
  imageUrl: 'https://example.com/keyboard.jpg',
  warrantyTerms: '1 year manufacturer warranty'
};

describe('item API', () => {
  it('reports that the API is healthy', async () => {
    const response = await request(createApp(createItemModel())).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('returns items in the model result', async () => {
    const items = [{ _id: '1', ...validItem }];
    const model = createItemModel({
      find: vi.fn(() => ({ sort: vi.fn().mockResolvedValue(items) }))
    });

    const response = await request(createApp(model)).get('/api/items');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(items);
  });

  it('returns one item by ID', async () => {
    const item = { _id: '1', ...validItem };
    const model = createItemModel({ findById: vi.fn().mockResolvedValue(item) });

    const response = await request(createApp(model)).get('/api/items/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(item);
  });

  it('rejects incomplete item data', async () => {
    const model = createItemModel();
    const response = await request(createApp(model))
      .post('/api/items')
      .send({ name: 'Keyboard', price: -1 });

    expect(response.status).toBe(400);
    expect(response.body.errors).toMatchObject({
      category: expect.any(String),
      price: expect.any(String),
      description: expect.any(String)
    });
    expect(model.create).not.toHaveBeenCalled();
  });

  it('rejects a blank price instead of treating it as zero', async () => {
    const model = createItemModel();
    const response = await request(createApp(model))
      .post('/api/items')
      .send({ ...validItem, price: '' });

    expect(response.status).toBe(400);
    expect(response.body.errors.price).toBeTruthy();
    expect(model.create).not.toHaveBeenCalled();
  });

  it('creates a normalized item', async () => {
    const created = { _id: '2', ...validItem };
    const model = createItemModel({ create: vi.fn().mockResolvedValue(created) });

    const response = await request(createApp(model))
      .post('/api/items')
      .send({ ...validItem, name: '  Mechanical Keyboard  ' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(created);
    expect(model.create).toHaveBeenCalledWith({
      ...validItem,
      name: 'Mechanical Keyboard'
    });
  });

  it('updates an existing item', async () => {
    const updated = { _id: '2', ...validItem, price: 79.99 };
    const model = createItemModel({
      findByIdAndUpdate: vi.fn().mockResolvedValue(updated)
    });

    const response = await request(createApp(model))
      .put('/api/items/2')
      .send({ ...validItem, price: 79.99 });

    expect(response.status).toBe(200);
    expect(response.body.price).toBe(79.99);
    expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
      '2',
      { ...validItem, price: 79.99 },
      { new: true, runValidators: true }
    );
  });

  it('returns 404 when deleting a missing item', async () => {
    const model = createItemModel({
      findByIdAndDelete: vi.fn().mockResolvedValue(null)
    });

    const response = await request(createApp(model)).delete('/api/items/missing');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Item not found' });
  });
});
