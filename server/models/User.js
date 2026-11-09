/**
 * User Model
 * 
 * Stores all user accounts: admins, organizers, and participants.
 * Passwords are hashed before saving (hashing will be added in Stage 4).
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Exclude password from queries by default
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'organizer', 'participant'],
        message: 'Role must be admin, organizer, or participant'
      },
      default: 'participant'
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt automatically
  }
);

// Index for role-based queries (e.g., "find all organizers")
// Note: email index is already created by the 'unique: true' option above
userSchema.index({ role: 1 });

/**
 * Transform the document when converting to JSON.
 * Removes password and __v from API responses.
 */
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
