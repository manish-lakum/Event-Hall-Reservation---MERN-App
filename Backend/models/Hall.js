const mongoose = require('mongoose');

// Allowed Enum Constants
const ALLOWED_HALL_TYPES = [
  'ASSEMBLY',
  'AUDITORIUM',
  'SPORTS',
  'SEMINAR',
  'CONFERENCE',
  'MULTIPURPOSE'
];

const ALLOWED_FACILITIES = [
  'PROJECTOR',
  'MICROPHONE',
  'SOUND_SYSTEM',
  'WIFI',
  'AIR_CONDITIONING',
  'STAGE',
  'SMART_BOARD',
  'SEATING',
  'EXTRA_CHAIRS',
  'SPORTS_EQUIPMENT'
];

const hallSchema = new mongoose.Schema(
  {
    hallName: {
      type: String,
      required: [true, 'Hall name is required'],
      trim: true,
      unique: true
    },
    hallType: {
      type: String,
      required: [true, 'Hall type is required'],
      enum: {
        values: ALLOWED_HALL_TYPES,
        message: 'Invalid hall type. Allowed: ASSEMBLY, AUDITORIUM, SPORTS, SEMINAR, CONFERENCE, MULTIPURPOSE'
      },
      uppercase: true
    },
    description: {
      type: String,
      required: [true, 'Hall description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be greater than 0']
    },
    openingTime: {
      type: String,
      required: [true, 'Opening time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Opening time must be in HH:MM format (e.g. 08:00)']
    },
    closingTime: {
      type: String,
      required: [true, 'Closing time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Closing time must be in HH:MM format (e.g. 18:00)']
    },
    facilities: {
      type: [String],
      validate: {
        validator: function (arr) {
          if (!Array.isArray(arr)) return false;
          return arr.every(item => ALLOWED_FACILITIES.includes(item.toUpperCase()));
        },
        message: 'One or more facilities are invalid. Allowed facilities: PROJECTOR, MICROPHONE, SOUND_SYSTEM, WIFI, AIR_CONDITIONING, STAGE, SMART_BOARD, SEATING, EXTRA_CHAIRS, SPORTS_EQUIPMENT'
      }
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&q=80',
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creating admin user reference is required']
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook: Validate closingTime > openingTime and deduplicate facilities
hallSchema.pre('save', function (next) {
  if (this.openingTime && this.closingTime) {
    if (this.closingTime <= this.openingTime) {
      return next(new Error('Closing time must be later than opening time'));
    }
  }

  if (Array.isArray(this.facilities)) {
    // UpperCase and Deduplicate facilities
    this.facilities = [...new Set(this.facilities.map(f => f.toUpperCase()))];
  }

  next();
});

// Pre-update hook for findOneAndUpdate / findByIdAndUpdate validation
hallSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();

  const openingTime = update.openingTime || update.$set?.openingTime;
  const closingTime = update.closingTime || update.$set?.closingTime;

  if (openingTime && closingTime && closingTime <= openingTime) {
    return next(new Error('Closing time must be later than opening time'));
  }

  if (update.facilities || update.$set?.facilities) {
    const facs = update.facilities || update.$set?.facilities;
    if (Array.isArray(facs)) {
      const formatted = [...new Set(facs.map(f => f.toUpperCase()))];
      if (update.facilities) update.facilities = formatted;
      if (update.$set?.facilities) update.$set.facilities = formatted;
    }
  }

  next();
});

const Hall = mongoose.model('Hall', hallSchema);

module.exports = {
  Hall,
  ALLOWED_HALL_TYPES,
  ALLOWED_FACILITIES
};
