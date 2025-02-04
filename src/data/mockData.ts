export const mockBoard = {
  id: '1',
  title: 'Project Alpha',
  lists: [
    {
      id: 'list1',
      title: 'To Do',
      boardId: '1',
      tasks: [
        {
          id: 'task1',
          title: 'Design System Implementation',
          description: 'Create a comprehensive design system for the project',
          priority: 'high',
          labels: [
            { id: 'l1', name: 'Design', color: '#818cf8' },
            { id: 'l2', name: 'Frontend', color: '#34d399' }
          ],
          assignees: ['user1'],
          listId: 'list1',
          tags: [],
          content: '',
          customFieldValues: [],
          attachments: [],
          checklist: [],
          comments: [] // Initialize empty comments array
        }
      ]
    },
    {
      id: 'list2',
      title: 'In Progress',
      boardId: '1',
      tasks: [
        {
          id: 'task2',
          title: 'API Integration',
          description: 'Integrate backend APIs with frontend components',
          priority: 'medium',
          labels: [
            { id: 'l3', name: 'Backend', color: '#f87171' }
          ],
          assignees: ['user2'],
          listId: 'list2',
          tags: [],
          content: '',
          customFieldValues: [],
          attachments: [],
          checklist: [],
          comments: [] // Initialize empty comments array
        }
      ]
    },
    {
      id: 'list3',
      title: 'Done',
      boardId: '1',
      tasks: []
    }
  ]
};