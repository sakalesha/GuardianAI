// It is used to generate unique IDs for the reports.
// It is a simple counter that is incremented every time a new report is created.

import mongoose, { Schema } from "mongoose";

const CounterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export const Counter = mongoose.model("Counter", CounterSchema);
