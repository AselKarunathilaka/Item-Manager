import { useCallback, useEffect, useMemo, useState } from 'react';
import { itemApi } from './api';
import { currencyOptions, DEFAULT_CURRENCY, formatMoney, normalizeCurrency } from './currencies';

const emptyItem = {
  name: '',
  category: '',
  price: '',
  currency: DEFAULT_CURRENCY,
  description: '',
  imageUrl: '',
  warrantyTerms: ''
};

const buttonBase =
  'inline-flex min-h-11 items-center justify-center rounded-xl border px-5 py-2.5 text-sm font-bold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b] disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]';
const primaryButton = `${buttonBase} border-transparent bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-[0_0_25px_rgba(79,70,229,0.6)]`;
const secondaryButton = `${buttonBase} border-white/10 bg-white/5 text-slate-200 backdrop-blur-md hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10 hover:text-white`;
const dangerButton = `${buttonBase} border-transparent bg-rose-500/10 text-rose-400 hover:-translate-y-0.5 hover:bg-rose-500/20 hover:text-rose-300`;
const fieldClass =
  'h-12 w-full min-w-0 rounded-xl border border-white/10 bg-black/40 px-4 text-sm text-slate-100 outline-none backdrop-blur-md transition-all duration-300 placeholder:text-slate-500 hover:border-white/20 hover:bg-black/60 focus:border-indigo-500 focus:bg-black/60 focus:ring-4 focus:ring-indigo-500/20 aria-[invalid=true]:border-rose-500 aria-[invalid=true]:focus:ring-rose-500/20';
const labelClass = 'block min-w-0 text-xs font-semibold uppercase tracking-wider text-slate-400';
const eyebrowClass = 'mb-3 text-[0.75rem] font-bold uppercase tracking-widest text-indigo-400';

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
    `relative min-w-20 border-0 bg-transparent px-4 text-sm font-bold transition duration-300 after:absolute after:inset-x-4 after:-bottom-[23px] after:h-[3px] after:origin-left after:rounded-t-md after:bg-indigo-400 after:transition-transform after:duration-300 ${
      active
        ? 'text-indigo-400 after:scale-x-100'
        : 'text-slate-300 after:scale-x-0 hover:text-indigo-300 hover:after:scale-x-100'
    }`;

  return (
    <header className="animate-fade-in sticky top-0 z-50 flex min-h-[72px] items-stretch justify-between gap-6 border-b border-white/10 bg-[#09090b]/80 backdrop-blur-lg px-4 shadow-sm sm:px-6 xl:px-[max(24px,calc((100vw-1360px)/2))]">
      <button
        className="group flex items-center gap-3 border-0 bg-transparent p-0 text-left text-inherit"
        type="button"
        onClick={() => navigate('/')}
      >
        <span className="flex h-10 w-10 flex-none items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg transition duration-500 group-hover:rotate-12 group-hover:scale-110 sm:h-[42px] sm:w-[42px]">
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </span>
        <span>
          <strong className="block font-display text-lg font-bold text-slate-100 sm:text-xl">Inventory</strong>
          <small className="hidden text-[0.75rem] font-medium text-slate-400 sm:block">
            Management System
          </small>
        </span>
      </button>

      <nav className="flex items-stretch pt-2" aria-label="Main navigation">
        <button className={navClass(path === '/')} type="button" onClick={() => navigate('/')}>
          Dashboard
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
  const sizeClass = large ? 'mb-6 rounded-xl border border-white/10 shadow-lg' : '';

  useEffect(() => {
    setFailed(false);
  }, [item.imageUrl]);

  if (!item.imageUrl || failed) {
    return (
      <div
        className={`grid aspect-[16/10] w-full place-content-center gap-2 bg-gradient-to-br from-slate-800 to-slate-900 text-center text-slate-500 ${sizeClass}`}
        aria-label="No item image available"
      >
        <span className="font-display text-4xl font-bold">
          {item.name?.slice(0, 2).toUpperCase() || 'IM'}
        </span>
        <small className="text-[0.7rem] font-bold uppercase tracking-wider">No image</small>
      </div>
    );
  }

  return (
    <img
      className={`block aspect-[16/10] w-full bg-slate-900 object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${sizeClass}`}
      src={item.imageUrl}
      alt={item.name}
      onError={() => setFailed(true)}
    />
  );
}

function Warranty({ terms }) {
  return (
    <div className="grid gap-1 rounded-r-lg border-l-4 border-indigo-500 bg-indigo-500/10 px-4 py-3">
      <span className="text-[0.65rem] font-bold uppercase tracking-wider text-indigo-300">Warranty</span>
      <strong className="text-xs font-medium leading-5 text-slate-300">
        {terms || 'No warranty information provided'}
      </strong>
    </div>
  );
}

function ItemCard({ item, index, onEdit, onDelete, deleting }) {
  return (
    <article
      className="stagger-card group min-w-0 overflow-hidden rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md shadow-xl transition-all duration-500 ease-out hover:-translate-y-2 hover:border-indigo-500/30 hover:bg-white/[0.07] hover:shadow-[0_20px_40px_-15px_rgba(79,70,229,0.3)]"
      style={{ '--delay': `${Math.min(index, 8) * 65}ms` }}
    >
      <div className="overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <ItemImage item={item} />
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 max-[460px]:flex-col">
          <div className="min-w-0">
            <span className="inline-block max-w-full rounded-full bg-indigo-500/20 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-wider text-indigo-300 [overflow-wrap:anywhere]">
              {item.category}
            </span>
            <h3 className="mt-3 font-display text-[1.4rem] font-bold leading-tight text-slate-100 [overflow-wrap:anywhere]">
              {item.name}
            </h3>
          </div>
          <strong className="whitespace-nowrap rounded-lg bg-emerald-500/10 px-3 py-1.5 font-mono text-lg font-bold text-emerald-400">
            {formatMoney(item.price, item.currency)}
          </strong>
        </div>

        <p className="my-[20px] line-clamp-3 min-h-[66px] text-sm leading-relaxed text-slate-400">
          {item.description}
        </p>

        <Warranty terms={item.warrantyTerms} />

        <div className="mt-6 flex gap-3">
          <button className={`${secondaryButton} flex-1`} type="button" onClick={() => onEdit(item._id)}>
            Edit Details
          </button>
          <button
            className={`${dangerButton} flex-1`}
            type="button"
            disabled={deleting}
            onClick={() => onDelete(item)}
          >
            {deleting ? 'Removing...' : 'Remove'}
          </button>
        </div>
      </div>
    </article>
  );
}

function Stat({ label, value, delay }) {
  return (
    <div
      className="stagger-card relative overflow-hidden flex min-h-[110px] items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/5 px-7 py-6 backdrop-blur-md shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:bg-white/10"
      style={{ '--delay': delay }}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-indigo-500/10 blur-2xl" />
      <span className="text-sm font-semibold tracking-wide text-slate-400">{label}</span>
      <strong className="font-display text-[2rem] font-bold text-slate-100">{value}</strong>
    </div>
  );
}

function StatePanel({ children, className = '' }) {
  return (
    <div
      className={`animate-soft-in grid min-h-[300px] place-items-center content-center rounded-3xl border border-dashed border-white/20 bg-black/20 p-10 text-center backdrop-blur-sm ${className}`}
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
  const [currencyFilter, setCurrencyFilter] = useState('All currencies');
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
      const itemCurrency = normalizeCurrency(item.currency);
      const matchesCurrency = currencyFilter === 'All currencies' || itemCurrency === currencyFilter;
      const matchesQuery =
        !normalizedQuery ||
        [item.name, item.category, item.description].some((value) =>
          value.toLowerCase().includes(normalizedQuery)
        );
      return matchesCategory && matchesCurrency && matchesQuery;
    });

    return filtered.sort((first, second) => {
      if (sort === 'price-low' || sort === 'price-high') {
        const currencyOrder = normalizeCurrency(first.currency).localeCompare(normalizeCurrency(second.currency));
        if (currencyOrder !== 0) return currencyOrder;
        return sort === 'price-low' ? first.price - second.price : second.price - first.price;
      }
      if (sort === 'name') return first.name.localeCompare(second.name);
      return new Date(second.createdAt || 0) - new Date(first.createdAt || 0);
    });
  }, [category, currencyFilter, items, query, sort]);

  const availableCurrencies = useMemo(
    () => [...new Set(items.map((item) => normalizeCurrency(item.currency)))].sort(),
    [items]
  );

  const lkrValue = items
    .filter((item) => normalizeCurrency(item.currency) === DEFAULT_CURRENCY)
    .reduce((sum, item) => sum + Number(item.price), 0);

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
      <section className="animate-rise relative mt-6 flex min-h-0 flex-col items-start justify-between gap-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl sm:mt-12 sm:p-12 lg:min-h-[250px] lg:flex-row lg:items-center lg:p-16">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-indigo-600/20 blur-[80px]" />
        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-purple-600/20 blur-[100px]" />
        
        <div className="relative z-10">
          <p className={eyebrowClass}>Dashboard Overview</p>
          <h1 className="mb-4 font-display text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-white to-slate-400 sm:text-6xl lg:text-[4.5rem]">
            Inventory Space
          </h1>
          <p className="max-w-[720px] text-base leading-relaxed text-slate-400 sm:text-lg">
            Manage your items with a beautiful, fast, and modern interface. View, organize, and edit your collection effortlessly.
          </p>
        </div>
        <button className={`${primaryButton} relative z-10 w-full lg:w-auto lg:min-w-[160px]`} type="button" onClick={() => navigate('/add-item')}>
          Add new item
        </button>
      </section>

      <section className="my-8 grid grid-cols-1 gap-5 sm:mb-14 lg:grid-cols-3" aria-label="Inventory summary">
        <Stat label="Total items" value={items.length} delay="100ms" />
        <Stat label="Categories" value={categories.length} delay="165ms" />
        <Stat label="LKR inventory value" value={formatMoney(lkrValue)} delay="230ms" />
      </section>

      <section className="mb-[72px]" aria-labelledby="inventory-title">
        <div className="mb-[20px] flex items-end justify-between gap-6">
          <div>
            <p className={eyebrowClass}>Your collection</p>
            <h2 id="inventory-title" className="font-display text-4xl font-bold tracking-tight text-slate-100">
              Inventory
            </h2>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-300 sm:text-sm">{visibleItems.length} shown</span>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-md lg:grid-cols-[minmax(240px,1fr)_190px_190px_190px]">
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
            <span className="mb-2 block">Currency</span>
            <select className={fieldClass} value={currencyFilter} onChange={(event) => setCurrencyFilter(event.target.value)}>
              <option>All currencies</option>
              {availableCurrencies.map((entry) => (
                <option key={entry} value={entry}>{entry}</option>
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
          <div className="animate-soft-in mb-6 flex items-center justify-between gap-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm font-bold text-rose-400" role="alert">
            <span>{error}</span>
            <button className="font-extrabold underline hover:text-rose-300" type="button" onClick={loadItems}>
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <StatePanel>
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
            <h3 className="mt-[20px] mb-2 font-display text-xl font-bold text-slate-200">Loading your inventory</h3>
            <p className="max-w-lg text-sm text-slate-400">Fetching the latest items from the database.</p>
          </StatePanel>
        ) : visibleItems.length === 0 ? (
          <StatePanel>
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-indigo-500/20 font-extrabold text-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </span>
            <h3 className="mt-[20px] mb-2 font-display text-xl font-bold text-slate-200">
              {items.length === 0 ? 'Your inventory is empty' : 'No matching items'}
            </h3>
            <p className="mb-6 max-w-lg text-sm leading-6 text-slate-400">
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
  return children ? <small className="mt-1.5 block text-xs font-bold text-rose-400">{children}</small> : null;
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
          currency: normalizeCurrency(item.currency),
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
    if (!form.currency) errors.currency = 'Select a currency';
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
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
          <h2 className="mt-[20px] font-display text-2xl font-bold text-slate-200">Loading item</h2>
        </StatePanel>
      </main>
    );
  }

  return (
    <main className="mx-auto flex-1 w-[min(calc(100%-20px),1360px)] sm:w-[min(calc(100%-32px),1360px)]">
      <section className="animate-rise my-6 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl sm:my-12 sm:mb-[72px]">
        <div className="border-b border-white/10 p-8 sm:p-12 lg:p-[60px]">
          <button
            className="mb-8 inline-flex items-center gap-2 border-0 bg-transparent p-0 text-sm font-bold text-indigo-400 transition-all hover:-translate-x-2 hover:text-indigo-300"
            type="button"
            onClick={() => navigate('/')}
          >
            &larr; Back to dashboard
          </button>
          <p className={eyebrowClass}>{editing ? 'Update Record' : 'New Record'}</p>
          <h1 className="mb-4 font-display text-4xl font-extrabold tracking-tight text-slate-100 sm:text-5xl lg:text-[3.5rem]">
            {editing ? 'Edit Item' : 'Create Item'}
          </h1>
          <p className="max-w-[720px] text-base leading-relaxed text-slate-400">
            {editing
              ? 'Update the item details below and save your changes.'
              : 'Add comprehensive details to accurately catalog your new item.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px]">
          <form className="p-8 sm:p-12 lg:p-[60px]" onSubmit={submit} noValidate>
            {error && (
              <div className="animate-soft-in mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm font-bold text-rose-400" role="alert">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-x-[20px] gap-y-[24px] sm:grid-cols-2">
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

              <label className={`${labelClass} sm:col-span-2`}>
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
                <span className="mb-2 block">Price</span>
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
              <label className={labelClass}>
                <span className="mb-2 block">Currency</span>
                <select
                  className={fieldClass}
                  name="currency"
                  value={form.currency}
                  onChange={updateField}
                  aria-invalid={Boolean(fieldErrors.currency)}
                >
                  {currencyOptions.map(({ code, name }) => (
                    <option key={code} value={code}>
                      {code} - {name}
                    </option>
                  ))}
                </select>
                <FieldError>{fieldErrors.currency}</FieldError>
              </label>

              <label className={`${labelClass} sm:col-span-2`}>
                <span className="mb-2 block">Description</span>
                <textarea
                  className={`${fieldClass} h-auto min-h-[160px] resize-y py-4 leading-relaxed`}
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  maxLength="1000"
                  rows="6"
                  placeholder="Describe the item, its condition, and important features"
                  aria-invalid={Boolean(fieldErrors.description)}
                />
                <small className="mt-2 block text-right text-xs font-medium text-slate-500">
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

            <div className="mt-[36px] flex flex-col-reverse justify-end gap-4 border-t border-white/10 pt-8 sm:flex-row">
              <button className={secondaryButton} type="button" onClick={() => navigate('/')}>
                Cancel
              </button>
              <button className={primaryButton} type="submit" disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Save changes' : 'Add item'}
              </button>
            </div>
          </form>

          <aside className="group min-w-0 border-t border-white/10 bg-black/20 p-8 backdrop-blur-md lg:border-t-0 lg:border-l">
            <p className={eyebrowClass}>Live Preview</p>
            <div className="overflow-hidden rounded-xl">
              <ItemImage item={form} large />
            </div>
            <span className="inline-block max-w-full rounded-full bg-indigo-500/20 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-wider text-indigo-300 [overflow-wrap:anywhere] mt-4">
              {form.category || 'Category'}
            </span>
            <h2 className="mt-3 mb-2 font-display text-2xl font-bold text-slate-100 [overflow-wrap:anywhere]">
              {form.name || 'Your item name'}
            </h2>
            <strong className="mb-6 block text-xl font-mono font-bold text-emerald-400">
              {formatMoney(form.price, form.currency)}
            </strong>
            <p className="mb-6 text-sm leading-relaxed text-slate-400 [overflow-wrap:anywhere]">
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
    <div className="flex min-h-screen flex-col bg-[#09090b] text-slate-300 antialiased selection:bg-indigo-500/30 selection:text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-indigo-900/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[600px] w-[600px] rounded-full bg-purple-900/10 blur-[150px]" />
      </div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header path={path} navigate={navigate} />
        {page}
        <footer className="mt-auto flex min-h-[80px] flex-col items-center justify-center gap-2 border-t border-white/10 bg-[#09090b]/80 backdrop-blur-md px-5 py-6 text-sm text-slate-500 sm:flex-row sm:justify-between sm:px-6 xl:px-[max(24px,calc((100vw-1360px)/2))]">
          <span className="font-bold text-slate-300 tracking-wide">Item Manager &copy; {new Date().getFullYear()}</span>
          <span>Engineered for excellence.</span>
        </footer>
      </div>
    </div>
  );
}
