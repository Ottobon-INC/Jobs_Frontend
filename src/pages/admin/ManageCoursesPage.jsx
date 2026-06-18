import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  getCourses, 
  createCourse, 
  updateCourse, 
  deleteCourse 
} from '../../api/coursesApi';

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

const ExternalLinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const ManageCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    redirect_url: '',
  });

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCourses();
      setCourses(data || []);
    } catch (err) {
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleOpenModal = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        name: course.name,
        description: course.description,
        redirect_url: course.redirect_url,
      });
    } else {
      setEditingCourse(null);
      setFormData({
        name: '',
        description: '',
        redirect_url: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCourse(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.redirect_url) {
      toast.error('All fields are required');
      return;
    }

    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, formData);
        toast.success('Course updated successfully');
      } else {
        await createCourse(formData);
        toast.success('Course created successfully');
      }
      fetchCourses();
      handleCloseModal();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await deleteCourse(id);
      toast.success('Course deleted successfully');
      fetchCourses();
    } catch (err) {
      toast.error('Failed to delete course');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D45B34]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 bg-[#F4F1EA] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#1C1A17]">Manage Courses</h1>
          <p className="text-[#1C1A17]/60 font-medium">Add and update learning pathways reflected on the seeker portal</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#D45B34] text-white rounded-xl font-bold hover:bg-[#D45B34]/90 transition-all shadow-sm"
        >
          <PlusIcon />
          Add New Course
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#1C1A17]/15">
          <p className="text-xs font-bold text-[#1C1A17]/40 uppercase tracking-widest mb-1">Total Pathways</p>
          <p className="text-3xl font-bold text-[#1C1A17]">{courses.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#1C1A17]/15">
          <p className="text-xs font-bold text-[#1C1A17]/40 uppercase tracking-widest mb-1">Last Updated</p>
          <p className="text-sm font-bold text-[#1C1A17]">
            {courses.length > 0 && courses[0].created_at 
              ? new Date(courses[0].created_at).toLocaleDateString(undefined, {
                  dateStyle: 'medium'
                })
              : 'N/A'}
          </p>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#1C1A17]/15 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F4F1EA]/50 border-b border-[#1C1A17]/15">
                <th className="px-6 py-4 text-xs font-bold text-[#1C1A17]/40 uppercase tracking-widest">Course Title / Description</th>
                <th className="px-6 py-4 text-xs font-bold text-[#1C1A17]/40 uppercase tracking-widest">Redirect URL</th>
                <th className="px-6 py-4 text-xs font-bold text-[#1C1A17]/40 uppercase tracking-widest">Date Added</th>
                <th className="px-6 py-4 text-xs font-bold text-[#1C1A17]/40 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1A17]/10">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-[#F4F1EA]/20 transition-colors">
                  <td className="px-6 py-4 max-w-md">
                    <p className="text-sm font-bold text-[#1C1A17]">{course.name}</p>
                    <p className="text-[11px] text-[#1C1A17]/60 font-medium mt-1 leading-relaxed line-clamp-2">{course.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={course.redirect_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#1C1A17] hover:underline"
                    >
                      Visit Link
                      <ExternalLinkIcon />
                    </a>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-[#1C1A17]/60">
                    {course.created_at ? new Date(course.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(course)}
                        className="p-2 rounded-lg text-[#1C1A17]/60 hover:bg-[#F4F1EA] hover:text-[#1C1A17] transition-all"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="p-2 rounded-lg text-[#1C1A17]/60 hover:bg-rose-50 hover:text-rose-600 transition-all"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-sm font-medium text-[#1C1A17]/40">
                    No courses found. Add a course to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#D45B34]/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#1C1A17]/15"
            >
              <div className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-[#1C1A17] mb-6">
                  {editingCourse ? 'Edit Learning Pathway' : 'Add New Course'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#1C1A17]/40 uppercase tracking-widest mb-1.5 ml-1">Course Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-[#F4F1EA] border border-[#1C1A17]/10 rounded-xl text-sm font-bold text-[#1C1A17] focus:outline-none focus:border-[#D45B34]/40"
                      placeholder="e.g. Next.js Foundations"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#1C1A17]/40 uppercase tracking-widest mb-1.5 ml-1">Small Description</label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 bg-[#F4F1EA] border border-[#1C1A17]/10 rounded-xl text-sm font-medium text-[#1C1A17] focus:outline-none focus:border-[#D45B34]/40 min-h-[100px]"
                      placeholder="e.g. Master routing, rendering, data fetching, and layouts in App Router."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#1C1A17]/40 uppercase tracking-widest mb-1.5 ml-1">Redirect Link (URL)</label>
                    <input
                      type="url"
                      required
                      value={formData.redirect_url}
                      onChange={(e) => setFormData({ ...formData, redirect_url: e.target.value })}
                      className="w-full px-4 py-3 bg-[#F4F1EA] border border-[#1C1A17]/10 rounded-xl text-sm font-bold text-[#1C1A17] focus:outline-none focus:border-[#D45B34]/40"
                      placeholder="e.g. https://nextjs.org/learn"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 py-4 rounded-2xl bg-[#F4F1EA] text-[#1C1A17]/60 font-bold text-sm hover:text-[#1C1A17] transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] py-4 rounded-2xl bg-[#D45B34] text-white font-bold text-sm hover:bg-[#D45B34]/90 transition-all shadow-sm"
                    >
                      {editingCourse ? 'Save Changes' : 'Create Course'}
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

export default ManageCoursesPage;
