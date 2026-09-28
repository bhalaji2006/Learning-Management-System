import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function CreateCourse() {
  const [form, setForm] = useState({ title: '', description: '', category: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/courses', form);
      navigate(`/courses/${data.course.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create course');
    }
  };

  return (
    <div className="container narrow">
      <h1>Create a New Course</h1>
      <form className="card" onSubmit={handleSubmit}>
        {error && <div className="alert-error">{error}</div>}
        <label>Course Title</label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <label>Category</label>
        <input
          placeholder="e.g. Web Development, Design, Business"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <label>Description</label>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <button className="btn btn-primary btn-block">Create Course</button>
      </form>
    </div>
  );
}
