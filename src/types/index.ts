export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect';
  options?: string[];
  required: boolean;
  location_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Assignee {
  id: string;
  name: string;
  email: string;
  ghl_id: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface CustomFieldValue {
  fieldId: string;
  value: string | number | string[];
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'link';
  size?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  labels: Label[];
  assignees: Assignee[];
  listId: string;
  tags: string[];
  customFieldValues: CustomFieldValue[];
  attachments: Attachment[];
  checklist: ChecklistItem[];
  dueDate?: string;
  estimatedTime?: number;
  actualTime?: number;
  comments: Comment[];
  position?: number;
  status: 'completed' | 'incompleted';
  ghlTaskId?: string;
  contactId?: string;
}

export interface List {
  id: string;
  boardId: string;
  title: string;
  position: number;
  tasks: Task[];
  is_default?: boolean;
}

export interface Board {
  id: string;
  title: string;
  lists: List[];
  location_id: string;
  created_at: string;
  updated_at: string;
  customFields?: CustomField[];
}