/**
 * Event Model
 * 
 * Stores all events in the system.
 * Events are created by admins and can be assigned to organizers.
 * Uses URL-based images with a fallback placeholder.
 */

const mongoose = require('mongoose');

// Default placeholder image when no image URL is provided
const DEFAULT_EVENT_IMAGE = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters']
    },
    date: {
      type: Date,
      required: [true, 'Event date is required']
    },
    endDate: {
      type: Date,
      default: null
    },
    location: {
      type: String,
      required: [true, 'Event location is required'],
      trim: true,
      maxlength: [300, 'Location cannot exceed 300 characters']
    },
    category: {
      type: String,
      required: [true, 'Event category is required'],
      enum: {
        values: [
          'conference',
          'workshop',
          'seminar',
          'webinar',
          'hackathon',
          'cultural',
          'sports',
          'social',
          'academic',
          'other'
        ],
        message: 'Invalid event category'
      }
    },
    capacity: {
      type: Number,
      required: [true, 'Event capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      max: [100000, 'Capacity cannot exceed 100,000']
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: {
        values: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        message: 'Status must be upcoming, ongoing, completed, or cancelled'
      },
      default: 'upcoming'
    },
    image: {
      type: String,
      trim: true,
      default: DEFAULT_EVENT_IMAGE
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Event creator is required']
    }
  },
  {
    timestamps: true
  }
);

// Indexes for common query patterns
eventSchema.index({ status: 1, date: 1 });       // Browse upcoming events sorted by date
eventSchema.index({ category: 1 });               // Filter by category
eventSchema.index({ organizer: 1 });               // Find events by organizer
eventSchema.index({ createdBy: 1 });               // Find events by creator
eventSchema.index({ title: 'text', description: 'text' }); // Text search on title and description

/**
 * Virtual field: Check if the event is full.
 */
eventSchema.virtual('isFull').get(function () {
  return this.registeredCount >= this.capacity;
});

/**
 * Virtual field: Available spots remaining.
 */
eventSchema.virtual('availableSpots').get(function () {
  return Math.max(0, this.capacity - this.registeredCount);
});

// Ensure virtuals are included when converting to JSON
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

/**
 * Pre-validate: Ensure endDate is after date (if provided).
 */
eventSchema.pre('validate', function () {
  if (this.endDate && this.endDate <= this.date) {
    this.invalidate('endDate', 'End date must be after start date');
  }
});

/**
 * Set default image if image is empty or cleared.
 */
eventSchema.pre('save', function () {
  if (!this.image || this.image.trim() === '') {
    this.image = DEFAULT_EVENT_IMAGE;
  }
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
