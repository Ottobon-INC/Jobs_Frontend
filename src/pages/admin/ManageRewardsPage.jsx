import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  adminListRewardItems, 
  adminCreateRewardItem, 
  adminUpdateRewardItem, 
  adminDeleteRewardItem,
  adminGetRewardsStats
} from '../../api/rewardsApi';

/* ─── Icons ─── */
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

const ManageRewardsPage = () => {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    total_users_with_rewards: 0,
    total_redemptions: 0,
    active_reward_items: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Boosts',
    cost: 100,
    expiry_days: 30,
    stock: null,
    is_active: true,
    sort_order: 0,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [itemsRes, statsRes] = await Promise.all([
        adminListRewardItems(false),
        adminGetRewardsStats(),
      ]);
      setItems(itemsRes.items || []);
      setStats(statsRes);
    } catch (err) {
      toast.error('Failed to fetch rewards data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || '',
        category: item.category,
        cost: item.cost,
        expiry_days: item.expiry_days || 30,
        stock: item.stock,
        is_active: item.is_active,
        sort_order: item.sort_order || 0,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        category: 'Boosts',
        cost: 100,
        expiry_days: 30,
        stock: null,
        is_active: true,
        sort_order: 0,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await adminUpdateRewardItem(editingItem.id, formData);
        toast.success('Reward updated successfully');
      } else {
        await adminCreateRewardItem(formData);
        toast.success('Reward created successfully');
      }
      fetchData();
      handleCloseModal();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this reward?')) return;
    try {
      await adminDeleteRewardItem(id);
      toast.success('Reward deactivated');
      fetchData();
    } catch (err) {
      toast.error('Failed to deactivate reward');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#313851]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 bg-[#F6F3ED] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#313851]">Manage Rewards</h1>
          <p className="text-[#313851]/60 font-medium">Create and manage vouchers, boosts, and exclusive perks</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#313851] text-white rounded-xl font-bold hover:bg-[#313851]/90 transition-all shadow-sm"
        >
          <PlusIcon />
          Add New Voucher
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#C2CBD3]/40">
          <p className="text-xs font-bold text-[#313851]/40 uppercase tracking-widest mb-1">Active Items</p>
          <p className="text-3xl font-bold text-[#313851]">{stats.active_reward_items}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#C2CBD3]/40">
          <p className="text-xs font-bold text-[#313851]/40 uppercase tracking-widest mb-1">Total Redemptions</p>
          <p className="text-3xl font-bold text-[#313851]">{stats.total_redemptions}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#C2CBD3]/40">
          <p className="text-xs font-bold text-[#313851]/40 uppercase tracking-widest mb-1">Users Participated</p>
          <p className="text-3xl font-bold text-[#313851]">{stats.total_users_with_rewards}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#C2CBD3]/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F6F3ED]/50 border-b border-[#C2CBD3]/40">
                <th className="px-6 py-4 text-xs font-bold text-[#313851]/40 uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-[#313851]/40 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-[#313851]/40 uppercase tracking-widest">Cost</th>
                <th className="px-6 py-4 text-xs font-bold text-[#313851]/40 uppercase tracking-widest">Stock</th>
                <th className="px-6 py-4 text-xs font-bold text-[#313851]/40 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-[#313851]/40 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C2CBD3]/20">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-[#F6F3ED]/20 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-[#313851]">{item.name}</p>
                    <p className="text-[10px] text-[#313851]/60 font-medium line-clamp-1">{item.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-lg bg-[#313851]/5 text-[#313851] text-[10px] font-bold uppercase tracking-wider">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-[#313851]">{item.cost.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-[#313851]/60">
                    {item.stock === null ? 'Unlimited' : item.stock}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      item.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="p-2 rounded-lg text-[#313851]/60 hover:bg-[#F6F3ED] hover:text-[#313851] transition-all"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-lg text-[#313851]/60 hover:bg-rose-50 hover:text-rose-600 transition-all"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#313851]/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#C2CBD3]/40"
            >
              <div className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-[#313851] mb-6">
                  {editingItem ? 'Edit Reward Item' : 'Add New Reward'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-[#313851]/40 uppercase tracking-widest mb-1.5 ml-1">Reward Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-[#F6F3ED] border border-[#C2CBD3]/20 rounded-xl text-sm font-bold text-[#313851] focus:outline-none focus:border-[#313851]/40"
                        placeholder="e.g. 20% Off Resume Review"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-[#313851]/40 uppercase tracking-widest mb-1.5 ml-1">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 bg-[#F6F3ED] border border-[#C2CBD3]/20 rounded-xl text-sm font-medium text-[#313851] focus:outline-none focus:border-[#313851]/40 min-h-[80px]"
                        placeholder="What does the user get?"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#313851]/40 uppercase tracking-widest mb-1.5 ml-1">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 bg-[#F6F3ED] border border-[#C2CBD3]/20 rounded-xl text-sm font-bold text-[#313851] focus:outline-none focus:border-[#313851]/40"
                      >
                        <option value="Coupons">Coupons</option>
                        <option value="Boosts">Boosts</option>
                        <option value="Digital">Digital</option>
                        <option value="Exclusive">Exclusive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#313851]/40 uppercase tracking-widest mb-1.5 ml-1">Coin Cost</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-[#F6F3ED] border border-[#C2CBD3]/20 rounded-xl text-sm font-bold text-[#313851] focus:outline-none focus:border-[#313851]/40"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#313851]/40 uppercase tracking-widest mb-1.5 ml-1">Expiry (Days)</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.expiry_days}
                        onChange={(e) => setFormData({ ...formData, expiry_days: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-[#F6F3ED] border border-[#C2CBD3]/20 rounded-xl text-sm font-bold text-[#313851] focus:outline-none focus:border-[#313851]/40"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#313851]/40 uppercase tracking-widest mb-1.5 ml-1">Stock (Empty for ∞)</label>
                      <input
                        type="number"
                        value={formData.stock || ''}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value === '' ? null : parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-[#F6F3ED] border border-[#C2CBD3]/20 rounded-xl text-sm font-bold text-[#313851] focus:outline-none focus:border-[#313851]/40"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 rounded border-[#C2CBD3] text-[#313851] focus:ring-[#313851]"
                    />
                    <label htmlFor="is_active" className="text-xs font-bold text-[#313851] uppercase tracking-wider cursor-pointer">Visible in shop</label>
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 py-4 rounded-2xl bg-[#F6F3ED] text-[#313851]/60 font-bold text-sm hover:text-[#313851] transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] py-4 rounded-2xl bg-[#313851] text-white font-bold text-sm hover:bg-[#313851]/90 transition-all shadow-sm"
                    >
                      {editingItem ? 'Save Changes' : 'Create Reward'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageRewardsPage;
