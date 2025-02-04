import React from 'react';
import { Calendar, Tag, Pencil, Users, CheckSquare, Clock, FileText } from 'lucide-react';
import type { Task } from '../../types';
import { TaskPriority } from './TaskPriority';
import { TaskLabels } from './TaskLabels';
import { TimeTrackingSection } from './TimeTrackingSection';
import { AttachmentSection } from './AttachmentSection';
import { CommentsSection } from '../Comments/CommentsSection';
import { useTeamStore } from '../../store/teamStore';

// Rest of the file remains the same...