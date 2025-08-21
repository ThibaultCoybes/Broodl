import mongoose from 'mongoose'
import { CATEGORIES, CategoryType, ChallengeType, MODES, ModeType, TYPES, VISIBILITIES, VisibilityType } from '~/config/challengeType'

// ===== INTERFACES =====
export interface IChallenge {
  _id?: mongoose.Types.ObjectId
  creator_id: number
  title: string
  description: string
  category: CategoryType
  type: ChallengeType
  mode?: ModeType
  visibility: VisibilityType
  target_value: number
  unit: string
  end_date: Date
  status: 'active' | 'completed' | 'cancelled'
  created_at: Date
  updated_at: Date
}

export interface IChallengeParticipant {
  _id?: mongoose.Types.ObjectId
  user_id: number
  challenge_id: mongoose.Types.ObjectId
  personal_target?: number
  personal_unit?: string
  personal_current?: number
  role: 'creator' | 'participant'
  status: 'active' | 'completed' | 'left'
  joined_at?: Date
  created_at?: Date
  updated_at?: Date
}

export interface IProgressLog {
  _id?: mongoose.Types.ObjectId
  challenge_id: mongoose.Types.ObjectId
  user_id: number
  value: number
  note?: string
  timestamp?: Date
}

// ===== SCHÉMAS =====
const challengeSchema = new mongoose.Schema<IChallenge>({
  creator_id: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: Object.values(CATEGORIES) 
  },
  type: { 
    type: String, 
    required: true, 
    enum: Object.values(TYPES) 
  },
  mode: { 
    type: String, 
    enum: Object.values(MODES), 
    required: function() { return this.type === 'group' } 
  },
  visibility: { 
    type: String, 
    required: true, 
    enum: Object.values(VISIBILITIES), 
    default: VISIBILITIES.PRIVATE 
  },
  target_value: { type: Number, required: true },
  unit: { type: String, required: true },
  end_date: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['active', 'completed', 'cancelled'], 
    default: 'active' 
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
})


const challengeParticipantSchema = new mongoose.Schema<IChallengeParticipant>(
  {
    user_id: { type: Number, required: true },
    challenge_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
    personal_target: { type: Number },
    personal_unit: { type: String },
    personal_current: { type: Number, default: 0 },
    role: { type: String, enum: ['creator', 'participant'], default: 'participant', required: true },
    status: { type: String, enum: ['active', 'completed', 'left'], default: 'active', required: true },
    joined_at: { type: Date, default: Date.now }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

const progressLogSchema = new mongoose.Schema<IProgressLog>(
  {
    challenge_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
    user_id: { type: Number, required: true },
    value: { type: Number, required: true },
    note: { type: String },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: false }
)

// ===== INDEX =====
challengeSchema.index({ creator_id: 1, status: 1 })
challengeParticipantSchema.index({ user_id: 1, challenge_id: 1 }, { unique: true })
challengeParticipantSchema.index({ challenge_id: 1 })
progressLogSchema.index({ challenge_id: 1, timestamp: -1 })

// ===== MODÈLES =====
export const Challenge =
  mongoose.models.Challenge as mongoose.Model<IChallenge> ||
  mongoose.model<IChallenge>('Challenge', challengeSchema)

export const ChallengeParticipant =
  mongoose.models.ChallengeParticipant as mongoose.Model<IChallengeParticipant> ||
  mongoose.model<IChallengeParticipant>('ChallengeParticipant', challengeParticipantSchema)

export const ProgressLog =
  mongoose.models.ProgressLog as mongoose.Model<IProgressLog> ||
  mongoose.model<IProgressLog>('ProgressLog', progressLogSchema)
