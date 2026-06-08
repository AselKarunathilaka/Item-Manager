import { useCallback, useEffect, useMemo, useState } from 'react';
import { itemApi } from './api';

const emptyItem = {
  name: '',
  category: '',
  price: '',
  description: '',
  imageUrl: '',
  warrantyTerms: ''
};

function useRoute() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((nextPath) => {
    window.history.pushState({}, '', nextPath);
    setPath(nextPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return { path, navigate };
}

function Header({ path, navigate }) {
  return (
    <header className="site-header">
      <button className="brand" type="button" onClick={() => navigate('/')}>
        <span className="brand-mark">
          <img src="/item-manager.svg" alt="" />
        </span>
        <span>
          <strong>Item Manager</strong>
          <small>Inventory workspace</small>
        </span>
      </button>

      <nav aria-label="Main navigation">
        <button
          className={path === '/' ? 'nav-link active' : 'nav-link'}
          type="button"
          onClick={() => navigate('/')}
        >
          Home
        </button>
        <button
          className={path === '/add-item' ? 'nav-link active' : 'nav-link'}
          type="button"
          onClick={() => navigate('/add-item')}
        >
          Add Item
        </button>
      </nav>
    </header>
  );
}

function ItemImage({ item, large = false }) {
  const [failed, setFailed] = useState(false);
  const className = large ? 'item-image item-image-large' : 'item-image';

  useEffect(() => {
    setFailed(false);
  }, [item.imageUrl]);

  if (!item.imageUrl || failed) {
    return (
      <div className={`${className} image-placeholder`} aria-label="No item image available">
        <span>{item.name?.slice(0, 2).toUpperCase() || 'IM'}</span>
        <small>No image available</small>
      </div>
    );
  }

  return (
    <img
      className={className}
      src={item.imageUrl}
      alt={item.name}
      onError={() => setFailed(true)}
    />
  );
}

function ItemCard({ item, onEdit, onDelete, deleting }) {
  return (
    <article className="item-card">
      <ItemImage item={item} />
      <div className="item-card-body">
        <div className="card-heading">
          <div>
            <span className="category-tag">{item.category}</span>
            <h3>{item.name}</h3>
          </div>
          <strong className="price">${Number(item.price).toFixed(2)}</strong>
        </div>

        <p className="description">{item.description}</p>

        <div className="warranty">
          <span>Warranty</span>
          <strong>{item.warrantyTerms || 'No warranty information'}</strong>
        </div>

        <div className="card-actions">
          <button className="button secondary" type="button" onClick={() => onEdit(item._id)}>
            Edit
          </button>
          <button
            className="button danger"
            type="button"
            disabled={deleting}
            onClick={() => onDelete(item)}
          >
            {deleting ? 'Removing...' : 'Delete'}
          </button>
        </div>
      </div>
    </article>
  );
}

function HomePage({ navigate }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All categories');
  const [sort, setSort] = useState('newest');
  const [deletingId, setDeletingId] = useState('');

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await itemApi.list());
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const categories = useMemo(
    () => [...new Set(items.map((item) => item.category))].sort(),
    [items]
  );

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = items.filter((item) => {
      const matchesCategory = category === 'All categories' || item.category === category;
      const matchesQuery =
        !normalizedQuery ||
        [item.name, item.category, item.description].some((value) =>
          value.toLowerCase().includes(normalizedQuery)
        );
      return matchesCategory && matchesQuery;
    });

    return filtered.sort((first, second) => {
      if (sort === 'price-low') return first.price - second.price;
      if (sort === 'price-high') return second.price - first.price;
      if (sort === 'name') return first.name.localeCompare(second.name);
      return new Date(second.createdAt || 0) - new Date(first.createdAt || 0);
    });
  }, [category, items, query, sort]);

  const totalValue = items.reduce((sum, item) => sum + Number(item.price), 0);

  async function deleteItem(item) {
    const shouldDelete = window.confirm(`Delete "${item.name}"? This cannot be undone.`);
    if (!shouldDelete) return;

    setDeletingId(item._id);
    try {
      await itemApi.remove(item._id);
      setItems((current) => current.filter((entry) => entry._id !== item._id));
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDeletingId('');
    }
  }

  return (
    <main>
      <section className="hero-section">
        <div>
          <p className="eyebrow">Inventory overview</p>
          <h1>Item Details</h1>
          <p>View, organize, edit, and remove items from one focused workspace.</p>
        </div>
        <button className="button primary hero-button" type="button" onClick={() => navigate('/add-item')}>
          Add new item
        </button>
      </section>

      <section className="stats-grid" aria-label="Inventory summary">
        <div className="stat">
          <span>Total items</span>
          <strong>{items.length}</strong>
        </div>
        <div className="stat">
          <span>Categories</span>
          <strong>{categories.length}</strong>
        </div>
        <div className="stat">
          <span>Combined value</span>
          <strong>${totalValue.toFixed(2)}</strong>
        </div>
      </section>

      <section className="inventory-section" aria-labelledby="inventory-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Your collection</p>
            <h2 id="inventory-title">Inventory</h2>
          </div>
          <span>{visibleItems.length} shown</span>
        </div>

        <div className="toolbar">
          <label className="search-field">
            <span>Search items</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, category, or description"
            />
          </label>
          <label>
            <span>Category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option>All categories</option>
              {categories.map((entry) => (
                <option key={entry}>{entry}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Sort by</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="newest">Newest first</option>
              <option value="name">Name A-Z</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </select>
          </label>
        </div>

        {error && (
          <div className="alert error-alert" role="alert">
            <span>{error}</span>
            <button type="button" onClick={loadItems}>Try again</button>
          </div>
        )}

        {loading ? (
          <div className="state-panel">
            <div className="loader" />
            <h3>Loading your inventory</h3>
            <p>Fetching the latest items from the database.</p>
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="state-panel">
            <span className="empty-mark">IM</span>
            <h3>{items.length === 0 ? 'Your inventory is empty' : 'No matching items'}</h3>
            <p>
              {items.length === 0
                ? 'Add your first item to start building the collection.'
                : 'Try changing the search text or category filter.'}
            </p>
            {items.length === 0 && (
              <button className="button primary" type="button" onClick={() => navigate('/add-item')}>
                Add first item
              </button>
            )}
          </div>
        ) : (
          <div className="item-grid">
            {visibleItems.map((item) => (
              <ItemCard
                key={item._id}
                item={item}
                deleting={deletingId === item._id}
                onEdit={(id) => navigate(`/edit-item/${id}`)}
                onDelete={deleteItem}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function ItemFormPage({ itemId, navigate }) {
  const editing = Boolean(itemId);
  const [form, setForm] = useState(emptyItem);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) return;

    itemApi
      .get(itemId)
      .then((item) => {
        setForm({
          name: item.name,
          category: item.category,
          price: String(item.price),
          description: item.description,
          imageUrl: item.imageUrl || '',
          warrantyTerms: item.warrantyTerms || ''
        });
        setError('');
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [editing, itemId]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: '' }));
  }

  function validate() {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Enter an item name';
    if (!form.category.trim()) errors.category = 'Enter a category';
    if (form.price === '' || Number(form.price) < 0) errors.price = 'Enter a valid price';
    if (!form.description.trim()) errors.description = 'Enter a description';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function submit(event) {
    event.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setError('');

    try {
      const payload = { ...form, price: Number(form.price) };
      if (editing) {
        await itemApi.update(itemId, payload);
      } else {
        await itemApi.create(payload);
      }
      navigate('/');
    } catch (requestError) {
      setError(requestError.message);
      setFieldErrors(requestError.fieldErrors || {});
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="form-main">
        <div className="state-panel form-state">
          <div className="loader" />
          <h2>Loading item</h2>
        </div>
      </main>
    );
  }

  return (
    <main className="form-main">
      <section className="form-shell">
        <div className="form-heading">
          <button className="back-button" type="button" onClick={() => navigate('/')}>
            Back to inventory
          </button>
          <p className="eyebrow">{editing ? 'Update inventory' : 'New inventory record'}</p>
          <h1>{editing ? 'Edit Item' : 'Add Item'}</h1>
          <p>
            {editing
              ? 'Update the details below and save your changes.'
              : 'Add clear details so this item is easy to identify and manage.'}
          </p>
        </div>

        <div className="form-layout">
          <form className="item-form" onSubmit={submit} noValidate>
            {error && <div className="alert error-alert" role="alert">{error}</div>}

            <div className="field-grid">
              <label className="full-field">
                <span>Item name</span>
                <input
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  maxLength="120"
                  placeholder="e.g. Wireless headphones"
                  aria-invalid={Boolean(fieldErrors.name)}
                />
                {fieldErrors.name && <small className="field-error">{fieldErrors.name}</small>}
              </label>

              <label>
                <span>Category</span>
                <input
                  name="category"
                  value={form.category}
                  onChange={updateField}
                  maxLength="80"
                  placeholder="e.g. Electronics"
                  aria-invalid={Boolean(fieldErrors.category)}
                />
                {fieldErrors.category && <small className="field-error">{fieldErrors.category}</small>}
              </label>

              <label>
                <span>Price (USD)</span>
                <input
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={updateField}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  aria-invalid={Boolean(fieldErrors.price)}
                />
                {fieldErrors.price && <small className="field-error">{fieldErrors.price}</small>}
              </label>

              <label className="full-field">
                <span>Description</span>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  maxLength="1000"
                  rows="6"
                  placeholder="Describe the item, its condition, and important features"
                  aria-invalid={Boolean(fieldErrors.description)}
                />
                <small className="field-hint">{form.description.length}/1000 characters</small>
                {fieldErrors.description && (
                  <small className="field-error">{fieldErrors.description}</small>
                )}
              </label>

              <label className="full-field">
                <span>Image URL</span>
                <input
                  name="imageUrl"
                  type="url"
                  value={form.imageUrl}
                  onChange={updateField}
                  placeholder="https://example.com/item-image.jpg"
                  aria-invalid={Boolean(fieldErrors.imageUrl)}
                />
                {fieldErrors.imageUrl && <small className="field-error">{fieldErrors.imageUrl}</small>}
              </label>

              <label className="full-field">
                <span>Warranty terms</span>
                <input
                  name="warrantyTerms"
                  value={form.warrantyTerms}
                  onChange={updateField}
                  maxLength="300"
                  placeholder="e.g. 1 year manufacturer warranty"
                  aria-invalid={Boolean(fieldErrors.warrantyTerms)}
                />
                {fieldErrors.warrantyTerms && (
                  <small className="field-error">{fieldErrors.warrantyTerms}</small>
                )}
              </label>
            </div>

            <div className="form-actions">
              <button className="button secondary" type="button" onClick={() => navigate('/')}>
                Cancel
              </button>
              <button className="button primary" type="submit" disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Save changes' : 'Add item'}
              </button>
            </div>
          </form>

          <aside className="preview-panel">
            <p className="eyebrow">Live preview</p>
            <ItemImage item={form} large />
            <span className="category-tag">{form.category || 'Category'}</span>
            <h2>{form.name || 'Your item name'}</h2>
            <strong className="preview-price">
              {form.price === '' ? '$0.00' : `$${Number(form.price || 0).toFixed(2)}`}
            </strong>
            <p>{form.description || 'Your item description will appear here.'}</p>
            <div className="warranty">
              <span>Warranty</span>
              <strong>{form.warrantyTerms || 'No warranty information'}</strong>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const { path, navigate } = useRoute();
  const editMatch = path.match(/^\/edit-item\/([^/]+)$/);

  let page;
  if (path === '/add-item') {
    page = <ItemFormPage navigate={navigate} />;
  } else if (editMatch) {
    page = <ItemFormPage itemId={editMatch[1]} navigate={navigate} />;
  } else {
    page = <HomePage navigate={navigate} />;
  }

  return (
    <div className="app-shell">
      <Header path={path} navigate={navigate} />
      {page}
      <footer>
        <span>Item Manager</span>
        <span>Simple inventory, clearly organized.</span>
      </footer>
    </div>
  );
}
