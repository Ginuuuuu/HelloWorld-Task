import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [150, 'Project name cannot exceed 150 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project owner is required'],
      index: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index to quickly search projects by member or owner
projectSchema.index({ members: 1 });

// Helper method to check if a user has access to this project
projectSchema.methods.hasMember = function (userId) {
  if (!userId) return false;
  const uid = userId.toString();
  if (this.owner.toString() === uid) return true;
  return this.members.some((m) => (m._id ? m._id.toString() : m.toString()) === uid);
};

// Helper method to check if user is the owner
projectSchema.methods.isOwner = function (userId) {
  if (!userId) return false;
  return this.owner.toString() === userId.toString();
};

const Project = mongoose.model('Project', projectSchema);
export default Project;
