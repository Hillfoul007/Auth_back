const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      sparse: true, // allows null/optional emails with unique index
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
    },
    full_name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      match: [/^[\+]?[1-9][\d]{1,14}$/, "Please enter a valid phone number"],
    },
    user_type: {
      type: String,
      enum: ["customer", "provider", "rider"],
      default: "customer",
    },
    profile_image: {
      type: String,
      default: "",
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    email_verified: {
      type: Boolean,
      default: false,
    },
    phone_verified: {
      type: Boolean,
      default: false,
    },
    address: {
      type: String,
      default: "",
    },
    preferences: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    last_login: {
      type: Date,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to update updated_at
userSchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

// Pre-save hook to hash password if present
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static methods
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.emailExists = async function (email) {
  const user = await this.findOne({ email: email.toLowerCase() });
  return !!user;
};

userSchema.statics.phoneExists = async function (phone) {
  const user = await this.findOne({ phone });
  return !!user;
};

// Indexes
userSchema.index({ email: 1 }, { sparse: true });
userSchema.index({ phone: 1 });
userSchema.index({ user_type: 1 });
userSchema.index({ created_at: -1 });

module.exports = mongoose.model("User", userSchema);
