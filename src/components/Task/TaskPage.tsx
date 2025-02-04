import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { TaskForm } from './TaskForm';
import { useBoardStore } from '../../store/boardStore';
import { useTaskActions } from '../../hooks/useTaskActions';

export const TaskPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const { currentBoard } = useBoardStore();
  const { updateTask } = useTaskActions();

  // Find the task in the current board's lists
  const task = currentBoard?.lists
    .flatMap(list => list.tasks)
    .find(t => t.id === taskId?.replace('id=', ''));

  if (!task) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <div className="text-center text-gray-400">Task not found</div>
      </div>
    );
  }

  const handleUpdateTask = (updatedTaskData: any) => {
    const updatedTask = {
      ...updatedTaskData,
      id: task.id,
      listId: task.listId,
    };

    updateTask(updatedTask);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-5xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="bg-gray-800 rounded-lg p-6">
          {isEditing ? (
            <TaskForm
              task={task}
              customFields={currentBoard?.customFields || []}
              onSubmit={handleUpdateTask}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <h1 className="text-2xl font-bold text-white">{task.title}</h1>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                >
                  Edit Task
                </button>
              </div>

              {task.description && (
                <div className="mt-4">
                  <h2 className="text-lg font-semibold text-white mb-2">Description</h2>
                  <p className="text-gray-300 whitespace-pre-wrap">{task.description}</p>
                </div>
              )}

              {task.content && (
                <div className="mt-4">
                  <h2 className="text-lg font-semibold text-white mb-2">Content</h2>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-300 whitespace-pre-wrap">{task.content}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white mb-2">Priority</h2>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    task.priority === 'high' ? 'bg-red-500' :
                    task.priority === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}>
                    {task.priority}
                  </span>
                </div>

                {task.dueDate && (
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-2">Due Date</h2>
                    <p className="text-gray-300">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {task.labels.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-white mb-2">Labels</h2>
                  <div className="flex flex-wrap gap-2">
                    {task.labels.map(label => (
                      <span
                        key={label.id}
                        className="px-3 py-1 rounded-full text-sm"
                        style={{ backgroundColor: label.color }}
                      >
                        {label.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {task.checklist.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-white mb-2">Checklist</h2>
                  <div className="space-y-2">
                    {task.checklist.map(item => (
                      <div key={item.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          readOnly
                          className="rounded border-gray-600 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-gray-300">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};