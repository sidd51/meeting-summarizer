import mongoose from "mongoose"

const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: function () {
        return `Meeting — ${new Date().toLocaleDateString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric'
        })}`
      }
    },
    originalFileName: {
      type: String,
      required: true
    },
    fileSize: {
      type: String
    },
    transcript: {
      type: String,
      required: true
    },
    analysis: {
      summary: { type: String },
      actionItems: [{ type: String }],
      decisions: [{ type: String }],
      sentiment: {
        type: String,
        enum: ['positive', 'neutral', 'negative'],
        default: 'neutral'
      },
      keyTopics: [{ type: String }],
      duration: { type: String }
    },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing'
    }
  },
  {
    timestamps: true   // auto-adds createdAt and updatedAt
  }
)

export default mongoose.model('Meeting', meetingSchema);