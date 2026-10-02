import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task reference is required'],
      index: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: [
        'Task created',
        'Task status changed',
        'Task priority changed',
        'Task assigned',
        'Task description updated',
        'Task title updated',
        'Task due date updated',
        'Task updated',
        'Task deleted',
        'Task restored',
        'Comment added',
      ],
    },
    description: {
      type: String,
      required: [true, 'Activity description is required'],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

activitySchema.index({ task: 1, createdAt: 1 });
activitySchema.index({ project: 1, createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
