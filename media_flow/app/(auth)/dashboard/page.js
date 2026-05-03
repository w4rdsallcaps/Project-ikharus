"use client";
import { useState } from 'react';
import { CldUploadWidget } from 'next-cloudinary';

export default function Dashboard() {
  const [view, setView] = useState("dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Starting with an empty array as requested
  const [projects, setProjects] = useState([]);

  // Form State for the Modal
  const [formData, setFormData] = useState({
    name: "",
    client: "",
    maxRevisions: 3
  });

  const handleCreateProject = (e) => {
    e.preventDefault();
    const newProj = {
      id: Date.now(),
      ...formData,
      progress: 0,
      version: "v1",
      status: "Awaiting Upload",
      videoUrl: null
    };
    setProjects([...projects, newProj]);
    setIsModalOpen(false);
    setFormData({ name: "", client: "", maxRevisions: 3 }); // Reset form
  };

  if (view === "editor") {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <button onClick={() => setView("dashboard")} className="text-blue-600 font-bold hover:underline">← Back to Projects</button>
          <h1 className="text-xl font-bold text-gray-800">{selectedProject.name}</h1>
          <div className="flex items-center gap-4">
             <span className="text-sm text-gray-500 uppercase font-bold tracking-widest">Revisions: 0 / {selectedProject.maxRevisions}</span>
          </div>
        </div>

        <div className="flex gap-6 h-[75vh]">
          <div className="flex-1 bg-white rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden">
            {!selectedProject.videoUrl ? (
              <CldUploadWidget 
                uploadPreset="mediaflow_unsigned" 
                onSuccess={(res) => setSelectedProject({...selectedProject, videoUrl: res.info.secure_url})}
              >
                {({ open }) => (
                  <button onClick={() => open()} className="flex flex-col items-center gap-4 group">
                    <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    </div>
                    <span className="text-gray-500 font-medium">Upload Project Video</span>
                  </button>
                )}
              </CldUploadWidget>
            ) : (
              <video src={selectedProject.videoUrl} controls className="w-full h-full object-contain bg-black" />
            )}
          </div>
          <div className="w-80 bg-white rounded-3xl border border-gray-100 p-4 shadow-sm">
            <h3 className="font-bold text-gray-400 text-xs tracking-widest uppercase border-b pb-2 mb-4">Annotations</h3>
            <p className="text-gray-300 text-center mt-10 italic text-sm">No feedback yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-black text-blue-900 italic tracking-tighter">MediaFlow</h1>
        <p className="text-gray-600">Hello, <span className="font-bold text-blue-600">Editor!</span></p>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 p-8 min-h-[60vh] relative shadow-sm">
        <h2 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-8">Active Projects</h2>
        
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-gray-300">
            <p className="text-lg">No projects found. Click the + to begin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {projects.map((proj) => (
              <div key={proj.id} onClick={() => { setSelectedProject(proj); setView("editor"); }} className="group bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden">
                <p className="text-gray-300 font-bold text-[10px] uppercase tracking-widest">ID: {proj.id.toString().slice(-4)}</p>
                <div className="w-full h-32 bg-gray-50 rounded-2xl my-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-200" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z"/></svg>
                </div>
                <h3 className="font-bold text-xl text-gray-800 mb-1">{proj.name}</h3>
                <p className="text-gray-400 text-xs mb-4">Client: {proj.client}</p>
                <div className="flex justify-between items-end">
                   <span className="px-3 py-1 bg-blue-50 text-blue-500 rounded-full text-[10px] font-bold uppercase tracking-tighter italic">{proj.version}</span>
                   <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-300 uppercase">Progress</p>
                      <p className="font-black text-blue-500 text-xl">{proj.progress}%</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Floating Action Button */}
        <button onClick={() => setIsModalOpen(true)} className="absolute bottom-10 right-10 w-16 h-16 bg-blue-600 rounded-full shadow-2xl flex items-center justify-center text-white text-3xl hover:rotate-90 transition-all active:scale-90">
          +
        </button>
      </div>

      {/* CREATE PROJECT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-black text-gray-800 mb-6 italic tracking-tight">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Project Name</label>
                <input required type="text" className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-blue-400 outline-none" 
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Wedding AVP" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Client Name</label>
                <input required type="text" className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-blue-400 outline-none" 
                  value={formData.client} onChange={(e) => setFormData({...formData, client: e.target.value})} placeholder="e.g. John Doe" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Max Revisions</label>
                <input required type="number" className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-blue-400 outline-none" 
                  value={formData.maxRevisions} onChange={(e) => setFormData({...formData, maxRevisions: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-gray-400 hover:text-gray-600">Cancel</button>
                <button type="submit" className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}