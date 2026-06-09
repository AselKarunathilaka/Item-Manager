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

const buttonBase =
  'inline-flex min-h-11 items-center justify-center rounded-md border px-4 py-2.5 text-sm font-extrabold transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#246b68]/20 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]';
const primaryButton = `${buttonBase} border-[#8f3e2a] bg-[#8f3e2a] text-white shadow-sm hover:-translate-y-0.5 hover:border-[#6f2c1d] hover:bg-[#6f2c1d] hover:shadow-md`;
const secondaryButton = `${buttonBase} border-[#cabba9] bg-white text-[#241b18] hover:-translate-y-0.5 hover:border-[#246b68] hover:text-[#246b68]`;
const dangerButton = `${buttonBase} border-[#e2bcbc] bg-white text-[#a63737] hover:-translate-y-0.5 hover:border-[#a63737] hover:bg-[#a63737] hover:text-white`;
const fieldClass =
  'h-12 w-full min-w-0 rounded-md border border-[#cdbb9f] bg-[#fffdf8] px-3.5 text-sm text-[#241b18] outline-none transition duration-200 placeholder:text-[#8d817b] hover:border-[#a99070] focus:border-[#246b68] focus:ring-4 focus:ring-[#246b68]/15 aria-[invalid=true]:border-[#a63737] aria-[invalid=true]:focus:ring-[#a63737]/15';
const labelClass = 'block min-w-0 text-xs font-extrabold text-[#51433d]';
const eyebrowClass = 'mb-2.5 text-[0.7rem] font-extrabold uppercase text-[#246b68]';

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
  const navClass = (active) =>
    `relative min-w-20 border-0 bg-transparent px-4 text-sm font-extrabold transition duration-200 after:absolute after:inset-x-4 after:bottom-[18px] after:h-0.5 after:origin-left after:bg-[#e2a13a] after:transition-transform after:duration-200 ${
      active
        ? 'text-[#ffd473] after:scale-x-100'
        : 'text-white after:scale-x-0 hover:text-[#ffd473] hover:after:scale-x-100'
    }`;

  return (
    <header className="animate-fade-in flex min-h-[82px] items-stretch justify-between gap-6 border-b-4 border-[#e2a13a] bg-[#843724] px-4 text-[#fffaf0] shadow-[0_8px_20px_rgba(59,25,17,0.18)] sm:px-6 xl:px-[max(24px,calc((100vw-1360px)/2))]">
      <button
        className="group flex items-center gap-3 border-0 bg-transparent p-0 text-left text-inherit"
        type="button"
        onClick={() => navigate('/')}
      >
        <span className="h-10 w-10 flex-none overflow-hidden rounded-md border border-white/45 transition duration-300 group-hover:-rotate-3 group-hover:scale-105 sm:h-[42px] sm:w-[42px]">
          <img className="block h-full w-full" src="/item-manager.svg" alt="" />
        </span>
        <span>
          <strong className="block text-sm font-extrabold sm:text-base">Item Manager</strong>
          <small className="mt-0.5 hidden text-[0.72rem] font-medium text-[#f1d8c9] sm:block">
            Inventory workspace
          </small>
        </span>
      </button>

      <nav className="flex items-stretch" aria-label="Main navigation">
        <button className={navClass(path === '/')} type="button" onClick={() => navigate('/')}>
          Home
        </button>
        <button
          className={navClass(path === '/add-item')}
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
  const sizeClass = large ? 'mb-6 rounded-md border border-[#d7c3a5]' : '';

  useEffect(() => {
    setFailed(false);
  }, [item.imageUrl]);

  if (!item.imageUrl || failed) {
    return (
      <div
        className={`grid aspect-[16/10] w-full place-content-center gap-2 bg-[linear-gradient(135deg,rgba(36,107,104,0.16),rgba(226,161,58,0.25))] text-center text-[#6a5d56] ${sizeClass}`}
        aria-label="No item image available"
      >
        <span className="font-display text-4xl font-extrabold">
          {item.name?.slice(0, 2).toUpperCase() || 'IM'}
        </span>
        <small className="text-[0.68rem] font-extrabold uppercase">No image available</small>
      </div>
    );
  }

  return (
    <img
      className={`block aspect-[16/10] w-full bg-[#e8dfd1] object-cover transition duration-500 ease-out group-hover:scale-[1.025] ${sizeClass}`}
      src={item.imageUrl}
      alt={item.name}
      onError={() => setFailed(true)}
    />
  );
}

function Warranty({ terms }) {
  return (
    <div className="grid gap-1 border-l-[3px] border-[#e2a13a] bg-[#f5ecdd] px-3.5 py-3">
      <span className="text-[0.65rem] font-extrabold uppercase text-[#6f625d]">Warranty</span>
      <strong className="text-xs font-bold leading-5 text-[#241b18]">
        {terms || 'No warranty information'}
      </strong>
    </div>
  );
}

function ItemCard({ item, index, onEdit, onDelete, deleting }) {
  return (
    <article
      className="stagger-card group min-w-0 overflow-hidden rounded-lg border border-[#e8cfaa] bg-[#fffaf0] shadow-[0_12px_30px_rgba(70,47,31,0.09)] transition duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_20px_42px_rgba(70,47,31,0.16)]"
      style={{ '--delay': `${Math.min(index, 8) * 65}ms` }}
    >
      <div className="overflow-hidden">
        <ItemImage item={item} />
      </div>
      <div className="p-5 sm:p-[22px]">
        <div className="flex items-start justify-between gap-4 max-[460px]:flex-col">
          <div className="min-w-0">
            <span className="inline-block max-w-full text-[0.68rem] font-extrabold uppercase text-[#246b68] [overflow-wrap:anywhere]">
              {item.category}
            </span>
            <h3 className="mt-2 font-display text-[1.35rem] font-bold leading-tight text-[#241b18] [overflow-wrap:anywhere]">
              {item.name}
            </h3>
          </div>
          <strong className="whitespace-nowrap font-extrabold text-[#8f3e2a]">
            ${Number(item.price).toFixed(2)}
          </strong>
        </div>

        <p className="my-[18px] line-clamp-3 min-h-[66px] text-sm leading-6 text-[#6f625d]">
          {item.description}
        </p>

        <Warranty terms={item.warrantyTerms} />

        <div className="mt-5 flex gap-2.5">
          <button className={`${secondaryButton} flex-1`} type="button" onClick={() => onEdit(item._id)}>
            Edit
          </button>
          <button
            className={`${dangerButton} flex-1`}
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

function Stat({ label, value, delay }) {
  return (
    <div
      className="stagger-card flex min-h-24 items-center justify-between gap-4 border-b-[3px] border-[#246b68] bg-white/80 px-6 py-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
      style={{ '--delay': delay }}
    >
      <span className="text-sm font-bold text-[#6f625d]">{label}</span>
      <strong className="font-display text-[1.8rem] font-bold text-[#241b18]">{value}</strong>
    </div>
  );
}

function StatePanel({ children, className = '' }) {
  return (
    <div
      className={`animate-soft-in grid min-h-[290px] place-items-center content-center border border-dashed border-[#cdbb9f] bg-[#fffaf0]/70 p-10 text-center ${className}`}
    >
      {children}
    </div>
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
    <main className="mx-auto w-[min(calc(100%-20px),1360px)] sm:w-[min(calc(100%-32px),1360px)]">
      <section className="animate-rise mt-6 flex min-h-0 flex-col items-start justify-between gap-8 rounded-lg border border-[#e8cfaa] border-l-[6px] border-l-[#8f3e2a] bg-[#fffaf0] p-6 shadow-[0_18px_45px_rgba(85,55,35,0.12)] sm:mt-12 sm:p-10 lg:min-h-[230px] lg:flex-row lg:items-center lg:p-16">
        <div>
          <p className={eyebrowClass}>Inventory overview</p>
          <h1 className="mb-3.5 font-display text-5xl font-bold leading-[0.95] text-[#241b18] sm:text-6xl lg:text-[4.5rem]">
            Item Details
          </h1>
          <p className="max-w-[720px] text-base leading-7 text-[#6f625d] sm:text-[1.08rem]">
            View, organize, edit, and remove items from one focused workspace.
          </p>
        </div>
        <button className={`${primaryButton} w-full lg:w-auto lg:min-w-[150px]`} type="button" onClick={() => navigate('/add-item')}>
          Add new item
        </button>
      </section>

      <section className="my-5 grid grid-cols-1 gap-4 sm:mb-12 lg:grid-cols-3" aria-label="Inventory summary">
        <Stat label="Total items" value={items.length} delay="100ms" />
        <Stat label="Categories" value={categories.length} delay="165ms" />
        <Stat label="Combined value" value={`$${totalValue.toFixed(2)}`} delay="230ms" />
      </section>

      <section className="mb-[72px]" aria-labelledby="inventory-title">
        <div className="mb-[18px] flex items-end justify-between gap-6">
          <div>
            <p className={eyebrowClass}>Your collection</p>
            <h2 id="inventory-title" className="font-display text-4xl font-bold text-[#241b18]">
              Inventory
            </h2>
          </div>
          <span className="text-xs font-bold text-[#6f625d] sm:text-sm">{visibleItems.length} shown</span>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3.5 border border-[#e4d6c5] bg-white/75 p-[18px] shadow-sm lg:grid-cols-[minmax(240px,1fr)_220px_220px]">
          <label className={labelClass}>
            <span className="mb-2 block">Search items</span>
            <input
              className={fieldClass}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, category, or description"
            />
          </label>
          <label className={labelClass}>
            <span className="mb-2 block">Category</span>
            <select className={fieldClass} value={category} onChange={(event) => setCategory(event.target.value)}>
              <option>All categories</option>
              {categories.map((entry) => (
                <option key={entry}>{entry}</option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            <span className="mb-2 block">Sort by</span>
            <select className={fieldClass} value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="newest">Newest first</option>
              <option value="name">Name A-Z</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </select>
          </label>
        </div>

        {error && (
          <div className="animate-soft-in mb-5 flex items-center justify-between gap-4 rounded-md border border-[#e1b1b1] bg-[#fff1f1] px-4 py-3 text-sm font-bold text-[#7f2424]" role="alert">
            <span>{error}</span>
            <button className="font-extrabold underline" type="button" onClick={loadItems}>
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <StatePanel>
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#dbc9ae] border-t-[#8f3e2a]" />
            <h3 className="mt-[18px] mb-2 font-display text-xl font-bold">Loading your inventory</h3>
            <p className="max-w-lg text-sm text-[#6f625d]">Fetching the latest items from the database.</p>
          </StatePanel>
        ) : visibleItems.length === 0 ? (
          <StatePanel>
            <span className="grid h-[42px] w-[42px] place-items-center rounded-md bg-[#246b68] font-extrabold text-white">IM</span>
            <h3 className="mt-[18px] mb-2 font-display text-xl font-bold">
              {items.length === 0 ? 'Your inventory is empty' : 'No matching items'}
            </h3>
            <p className="mb-5 max-w-lg text-sm leading-6 text-[#6f625d]">
              {items.length === 0
                ? 'Add your first item to start building the collection.'
                : 'Try changing the search text or category filter.'}
            </p>
            {items.length === 0 && (
              <button className={primaryButton} type="button" onClick={() => navigate('/add-item')}>
                Add first item
              </button>
            )}
          </StatePanel>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleItems.map((item, index) => (
              <ItemCard
                key={item._id}
                item={item}
                index={index}
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

function FieldError({ children }) {
  return children ? <small className="mt-1.5 block text-xs font-bold text-[#a63737]">{children}</small> : null;
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
      <main className="mx-auto flex-1 w-[min(calc(100%-20px),1360px)] sm:w-[min(calc(100%-32px),1360px)]">
        <StatePanel className="my-12">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#dbc9ae] border-t-[#8f3e2a]" />
          <h2 className="mt-[18px] font-display text-2xl font-bold">Loading item</h2>
        </StatePanel>
      </main>
    );
  }

  return (
    <main className="mx-auto flex-1 w-[min(calc(100%-20px),1360px)] sm:w-[min(calc(100%-32px),1360px)]">
      <section className="animate-rise my-6 overflow-hidden rounded-lg border border-[#e8cfaa] bg-[#fffaf0] shadow-[0_18px_45px_rgba(85,55,35,0.12)] sm:my-12 sm:mb-[72px]">
        <div className="border-b border-[#ead8bd] p-6 sm:p-10 lg:p-[52px]">
          <button
            className="mb-6 border-0 bg-transparent p-0 text-sm font-extrabold text-[#8f3e2a] transition hover:-translate-x-1 hover:text-[#6f2c1d] hover:underline"
            type="button"
            onClick={() => navigate('/')}
          >
            Back to inventory
          </button>
          <p className={eyebrowClass}>{editing ? 'Update inventory' : 'New inventory record'}</p>
          <h1 className="mb-3 font-display text-4xl font-bold leading-none text-[#241b18] sm:text-5xl lg:text-[3.5rem]">
            {editing ? 'Edit Item' : 'Add Item'}
          </h1>
          <p className="max-w-[720px] text-base leading-7 text-[#6f625d]">
            {editing
              ? 'Update the details below and save your changes.'
              : 'Add clear details so this item is easy to identify and manage.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px]">
          <form className="p-6 sm:p-10 lg:p-[52px]" onSubmit={submit} noValidate>
            {error && (
              <div className="animate-soft-in mb-5 rounded-md border border-[#e1b1b1] bg-[#fff1f1] px-4 py-3 text-sm font-bold text-[#7f2424]" role="alert">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-x-[18px] gap-y-[22px] sm:grid-cols-2">
              <label className={`${labelClass} sm:col-span-2`}>
                <span className="mb-2 block">Item name</span>
                <input
                  className={fieldClass}
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  maxLength="120"
                  placeholder="e.g. Wireless headphones"
                  aria-invalid={Boolean(fieldErrors.name)}
                />
                <FieldError>{fieldErrors.name}</FieldError>
              </label>

              <label className={labelClass}>
                <span className="mb-2 block">Category</span>
                <input
                  className={fieldClass}
                  name="category"
                  value={form.category}
                  onChange={updateField}
                  maxLength="80"
                  placeholder="e.g. Electronics"
                  aria-invalid={Boolean(fieldErrors.category)}
                />
                <FieldError>{fieldErrors.category}</FieldError>
              </label>

              <label className={labelClass}>
                <span className="mb-2 block">Price (USD)</span>
                <input
                  className={fieldClass}
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={updateField}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  aria-invalid={Boolean(fieldErrors.price)}
                />
                <FieldError>{fieldErrors.price}</FieldError>
              </label>

              <label className={`${labelClass} sm:col-span-2`}>
                <span className="mb-2 block">Description</span>
                <textarea
                  className={`${fieldClass} h-auto min-h-36 resize-y py-3 leading-6`}
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  maxLength="1000"
                  rows="6"
                  placeholder="Describe the item, its condition, and important features"
                  aria-invalid={Boolean(fieldErrors.description)}
                />
                <small className="mt-1.5 block text-right text-xs font-medium text-[#6f625d]">
                  {form.description.length}/1000 characters
                </small>
                <FieldError>{fieldErrors.description}</FieldError>
              </label>

              <label className={`${labelClass} sm:col-span-2`}>
                <span className="mb-2 block">Image URL</span>
                <input
                  className={fieldClass}
                  name="imageUrl"
                  type="url"
                  value={form.imageUrl}
                  onChange={updateField}
                  placeholder="https://example.com/item-image.jpg"
                  aria-invalid={Boolean(fieldErrors.imageUrl)}
                />
                <FieldError>{fieldErrors.imageUrl}</FieldError>
              </label>

              <label className={`${labelClass} sm:col-span-2`}>
                <span className="mb-2 block">Warranty terms</span>
                <input
                  className={fieldClass}
                  name="warrantyTerms"
                  value={form.warrantyTerms}
                  onChange={updateField}
                  maxLength="300"
                  placeholder="e.g. 1 year manufacturer warranty"
                  aria-invalid={Boolean(fieldErrors.warrantyTerms)}
                />
                <FieldError>{fieldErrors.warrantyTerms}</FieldError>
              </label>
            </div>

            <div className="mt-[30px] flex flex-col-reverse justify-end gap-3 border-t border-[#ead8bd] pt-6 sm:flex-row">
              <button className={secondaryButton} type="button" onClick={() => navigate('/')}>
                Cancel
              </button>
              <button className={primaryButton} type="submit" disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Save changes' : 'Add item'}
              </button>
            </div>
          </form>

          <aside className="group min-w-0 border-t border-[#ead8bd] bg-[#f2e8d7] p-7 lg:border-t-0 lg:border-l">
            <p className={eyebrowClass}>Live preview</p>
            <div className="overflow-hidden rounded-md">
              <ItemImage item={form} large />
            </div>
            <span className="inline-block max-w-full text-[0.68rem] font-extrabold uppercase text-[#246b68] [overflow-wrap:anywhere]">
              {form.category || 'Category'}
            </span>
            <h2 className="mt-2 mb-1.5 font-display text-2xl font-bold [overflow-wrap:anywhere]">
              {form.name || 'Your item name'}
            </h2>
            <strong className="mb-5 block text-xl font-extrabold text-[#8f3e2a]">
              {form.price === '' ? '$0.00' : `$${Number(form.price || 0).toFixed(2)}`}
            </strong>
            <p className="mb-5 text-sm leading-6 text-[#6f625d] [overflow-wrap:anywhere]">
              {form.description || 'Your item description will appear here.'}
            </p>
            <Warranty terms={form.warrantyTerms} />
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
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,rgba(226,161,58,0.10),transparent_330px)] text-[#241b18]">
      <Header path={path} navigate={navigate} />
      {page}
      <footer className="mt-auto flex min-h-[76px] flex-col items-start justify-center gap-1 bg-[#2b211e] px-5 py-5 text-xs text-[#d8cac1] sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 xl:px-[max(24px,calc((100vw-1360px)/2))]">
        <span className="font-extrabold text-white">Item Manager</span>
        <span>Simple inventory, clearly organized.</span>
      </footer>
    </div>
  );
}
