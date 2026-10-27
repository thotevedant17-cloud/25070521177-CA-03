import mongoose from 'mongoose';

const routineStepSchema = new mongoose.Schema({
  order: { type: Number, required: true },
  stepName: { type: String, required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  notes: { type: String, default: '' }
}, { _id: false });

const skincareRoutineSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    default: 'My Routine'
  },
  morningRoutine: [routineStepSchema],
  eveningRoutine: [routineStepSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

skincareRoutineSchema.index({ user: 1 });

const SkincareRoutine = mongoose.model('SkincareRoutine', skincareRoutineSchema);
export default SkincareRoutine;
