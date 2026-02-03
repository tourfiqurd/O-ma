import React, { useState, useEffect, useMemo } from 'react';
import { fetchSubjects, fetchSubjectGroups, saveSubjectGroup, deleteSubjectGroup, Subject, SubjectGroup } from '../lib/subject-grouping';

interface SubjectGroupManagerProps {
  schoolId: string;
  classId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SubjectGroupManager: React.FC<SubjectGroupManagerProps> = ({ schoolId, classId, isOpen, onClose }) => {
  const [groups, setGroups] = useState<SubjectGroup[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state for creating/editing a group
  const [editingGroup, setEditingGroup] = useState<Partial<SubjectGroup>>({
    name: '',
    subjectIds: [],
    totalFullMarks: 0,
  });

  const groupedSubjectIds = useMemo(() => {
    const ids = new Set<string>();
    groups.forEach(g => {
      if (g.id !== editingGroup.id) {
        g.subjectIds.forEach(id => ids.add(id));
      }
    });
    return ids;
  }, [groups, editingGroup.id]);

  useEffect(() => {
    if (isOpen && schoolId && classId) {
      loadData();
    }
  }, [isOpen, schoolId, classId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedSubjects, fetchedGroups] = await Promise.all([
        fetchSubjects(schoolId, classId),
        fetchSubjectGroups(schoolId, classId)
      ]);
      setSubjects(fetchedSubjects);
      setGroups(fetchedGroups);
    } catch (error) {
      console.error("Failed to load subject and group data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectToggle = (subject: Subject) => {
    const currentIds = editingGroup.subjectIds || [];
    const isSelected = currentIds.includes(subject.id);
    
    const newIds = isSelected
      ? currentIds.filter(id => id !== subject.id)
      : [...currentIds, subject.id];

    const totalMarks = (editingGroup.totalFullMarks || 0) + (isSelected ? -subject.fullMarks : subject.fullMarks);

    setEditingGroup({
      ...editingGroup,
      subjectIds: newIds,
      totalFullMarks: totalMarks,
    });
  };

  const handleSave = async () => {
    if (!editingGroup.name?.trim() || !editingGroup.subjectIds || editingGroup.subjectIds.length < 2) {
      alert("Validation Error: Please provide a group name and select at least 2 subjects.");
      return;
    }

    setLoading(true);
    try {
      await saveSubjectGroup({
        name: editingGroup.name!,
        subjectIds: editingGroup.subjectIds!,
        totalFullMarks: editingGroup.totalFullMarks!,
        schoolId,
        classId,
        ...(editingGroup.passMark !== undefined ? { passMark: editingGroup.passMark } : {}),
      }, editingGroup.id);
      
      resetForm();
      await loadData();
    } catch (error) {
      console.error("Failed to save group", error);
      alert("An error occurred while saving the group.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (groupId: string) => {
    if (window.confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
      setLoading(true);
      try {
        await deleteSubjectGroup(schoolId, classId, groupId);
        await loadData();
      } catch (error) {
        console.error("Failed to delete group", error);
        alert("An error occurred while deleting the group.");
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setEditingGroup({ name: '', subjectIds: [], totalFullMarks: 0 });
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-card text-card-foreground rounded-lg shadow-lg p-6 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Merge Subject</h2>
              <button onClick={() => { onClose(); resetForm(); }} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              {/* Create/Edit Form */}
              <div className="p-4 border rounded-lg bg-muted/50">
                <h3 className="font-medium mb-4">{editingGroup.id ? 'Edit Group' : 'Create New Group'}</h3>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Group Name</label>
                    <input 
                      type="text" 
                      value={editingGroup.name || ''}
                      onChange={e => setEditingGroup({...editingGroup, name: e.target.value})}
                      className="w-full p-2 border rounded-md bg-background"
                      placeholder="e.g., Bangla Combined"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Subjects (Min. 2)</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md bg-background">
                      {subjects.length > 0 ? subjects.map(subject => {
                        const isUsed = groupedSubjectIds.has(subject.id);
                        return (
                          <label key={subject.id} className={`flex items-center gap-2 p-1.5 rounded ${isUsed ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted'}`}>
                            <input 
                              type="checkbox"
                              checked={editingGroup.subjectIds?.includes(subject.id)}
                              onChange={() => handleSubjectToggle(subject)}
                              disabled={isUsed}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm">{subject.name} ({subject.fullMarks})</span>
                          </label>
                        );
                      }) : <p className="text-sm text-muted-foreground col-span-full">No subjects found for this class.</p>}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <div className="text-sm">
                      Total Marks: <span className="font-bold text-primary">{editingGroup.totalFullMarks}</span>
                    </div>
                    <div className="flex gap-2">
                      {editingGroup.id && (
                        <button onClick={resetForm} className="px-4 py-2 text-sm border rounded-md hover:bg-muted">
                          Cancel
                        </button>
                      )}
                      <button onClick={handleSave} disabled={loading} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50">
                        {loading ? 'Saving...' : (editingGroup.id ? 'Update Group' : 'Create Group')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Existing Groups List */}
              <div>
                <h3 className="font-medium mb-3">Existing Groups</h3>
                {loading && groups.length === 0 ? <p className="text-sm text-muted-foreground">Loading groups...</p> : null}
                {!loading && groups.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No groups created yet.</p>
                ) : (
                  <div className="space-y-3">
                    {groups.map(group => (
                      <div key={group.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-primary/50 transition-colors">
                        <div>
                          <p className="font-medium">{group.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {group.subjectIds.length} subjects • Total Marks: {group.totalFullMarks}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => setEditingGroup(group)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-md text-sm">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(group.id)} disabled={loading} className="p-2 text-red-600 hover:bg-red-50 rounded-md text-sm disabled:opacity-50">
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};