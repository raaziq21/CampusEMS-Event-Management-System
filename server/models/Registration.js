/**
 * Registration Model
 * 
 * Tracks participant registrations for events.
 * A compound unique index on { user, event } prevents duplicate registrations.
 * Automatically updates the event's registeredCount on save and remove.
 */

const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event is required']
    },
    status: {
      type: String,
      enum: {
        values: ['confirmed', 'cancelled'],
        message: 'Registration status must be confirmed or cancelled'
      },
      default: 'confirmed'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index: one registration per user per event
registrationSchema.index({ user: 1, event: 1 }, { unique: true });

// Index for finding all registrations for an event
registrationSchema.index({ event: 1, status: 1 });

// Index for finding all registrations by a user
registrationSchema.index({ user: 1, status: 1 });

/**
 * Static method: Update the registeredCount on the associated Event.
 * Counts only confirmed registrations.
 */
registrationSchema.statics.updateEventCount = async function (eventId) {
  const count = await this.countDocuments({
    event: eventId,
    status: 'confirmed'
  });

  await mongoose.model('Event').findByIdAndUpdate(eventId, {
    registeredCount: count
  });
};

/**
 * Post-save hook: Update event's registeredCount after a new registration
 * or status change.
 */
registrationSchema.post('save', async function () {
  await this.constructor.updateEventCount(this.event);
});

/**
 * Post-findOneAndUpdate hook: Update event's registeredCount after
 * a registration is updated (e.g., status changed to cancelled).
 */
registrationSchema.post('findOneAndUpdate', async function (doc) {
  if (doc) {
    await doc.constructor.updateEventCount(doc.event);
  }
});

/**
 * Post-findOneAndDelete hook: Update event's registeredCount after
 * a registration is deleted.
 */
registrationSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.updateEventCount(doc.event);
  }
});

const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;
