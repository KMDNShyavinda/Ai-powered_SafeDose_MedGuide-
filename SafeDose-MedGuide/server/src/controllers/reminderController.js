const MedicationReminder = require('../models/MedicationReminder');
const PrescriptionMedicine = require('../models/PrescriptionMedicine');
const Prescription = require('../models/Prescription');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// Helper: parse frequency string into time slots
const frequencyToTimes = (freq) => {
  const f = (freq || '').toLowerCase();
  if (f.includes('once') || f.includes('1 time') || f.includes('1x')) return ['08:00'];
  if (f.includes('twice') || f.includes('2 time') || f.includes('2x') || f.includes('bid')) return ['08:00', '20:00'];
  if (f.includes('three') || f.includes('3 time') || f.includes('3x') || f.includes('tid')) return ['08:00', '14:00', '20:00'];
  if (f.includes('four') || f.includes('4 time') || f.includes('4x') || f.includes('qid')) return ['06:00', '12:00', '18:00', '22:00'];
  if (f.includes('every 8')) return ['06:00', '14:00', '22:00'];
  if (f.includes('every 12')) return ['08:00', '20:00'];
  if (f.includes('every 6')) return ['06:00', '12:00', '18:00', '00:00'];
  if (f.includes('bedtime') || f.includes('night')) return ['21:00'];
  if (f.includes('morning')) return ['08:00'];
  return ['08:00', '14:00', '20:00'];
};

// Helper: parse duration into days
const durationToDays = (dur) => {
  const d = (dur || '').toLowerCase();
  const match = d.match(/(\d+)/);
  if (!match) return 7;
  const num = parseInt(match[1]);
  if (d.includes('week')) return num * 7;
  if (d.includes('month')) return num * 30;
  return num;
};

// ==================== CREATE REMINDERS FROM PRESCRIPTION ====================
exports.createReminders = async (req, res) => {
  try {
    const { prescriptionId } = req.body;
    if (!prescriptionId) return sendError(res, 'Prescription ID is required.', 400);

    const prescription = await Prescription.findOne({ _id: prescriptionId, user: req.user._id });
    if (!prescription) return sendError(res, 'Prescription not found.', 404);

    const medicines = await PrescriptionMedicine.find({ prescription: prescription._id });
    if (medicines.length === 0) return sendError(res, 'No medicines found in this prescription.', 400);

    const reminders = [];
    for (const med of medicines) {
      // Check if reminder already exists for this medicine
      const existing = await MedicationReminder.findOne({
        user: req.user._id,
        prescriptionMedicine: med._id,
        isActive: true,
      });
      if (existing) continue;

      const times = frequencyToTimes(med.frequency);
      const days = durationToDays(med.duration);
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      const reminder = await MedicationReminder.create({
        user: req.user._id,
        prescriptionMedicine: med._id,
        prescription: prescription._id,
        medicineName: med.medicineName,
        dosage: med.dosage,
        frequency: med.frequency,
        reminderTimes: times,
        startDate,
        endDate,
        isActive: true,
      });
      reminders.push(reminder);
    }

    return sendSuccess(res, `${reminders.length} reminder(s) created.`, { reminders }, 201);
  } catch (error) {
    console.error('Create reminders error:', error);
    return sendError(res, error.message);
  }
};

// ==================== GET ALL MY REMINDERS ====================
exports.getMyReminders = async (req, res) => {
  try {
    const reminders = await MedicationReminder.find({ user: req.user._id })
      .populate('prescriptionMedicine')
      .sort({ isActive: -1, createdAt: -1 });

    return sendSuccess(res, 'Reminders fetched.', { reminders });
  } catch (error) {
    return sendError(res, error.message);
  }
};

// ==================== GET TODAY'S SCHEDULE ====================
exports.getTodaySchedule = async (req, res) => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const reminders = await MedicationReminder.find({
      user: req.user._id,
      isActive: true,
      startDate: { $lte: today },
      $or: [{ endDate: { $gte: today } }, { endDate: null }],
    }).sort({ createdAt: 1 });

    // Build schedule with taken status
    const schedule = [];
    for (const rem of reminders) {
      for (const time of rem.reminderTimes) {
        const takenEntry = rem.takenLog.find(t => t.date === todayStr && t.time === time);
        schedule.push({
          reminderId: rem._id,
          medicineName: rem.medicineName,
          dosage: rem.dosage,
          time,
          taken: takenEntry ? takenEntry.taken : false,
          takenAt: takenEntry ? takenEntry.takenAt : null,
        });
      }
    }

    // Sort by time
    schedule.sort((a, b) => a.time.localeCompare(b.time));

    return sendSuccess(res, "Today's schedule fetched.", { schedule, date: todayStr });
  } catch (error) {
    return sendError(res, error.message);
  }
};

// ==================== UPDATE REMINDER ====================
exports.updateReminder = async (req, res) => {
  try {
    const reminder = await MedicationReminder.findOne({ _id: req.params.id, user: req.user._id });
    if (!reminder) return sendError(res, 'Reminder not found.', 404);

    const { reminderTimes, isActive } = req.body;
    if (reminderTimes) reminder.reminderTimes = reminderTimes;
    if (typeof isActive === 'boolean') reminder.isActive = isActive;

    await reminder.save();
    return sendSuccess(res, 'Reminder updated.', { reminder });
  } catch (error) {
    return sendError(res, error.message);
  }
};

// ==================== MARK AS TAKEN ====================
exports.markTaken = async (req, res) => {
  try {
    const reminder = await MedicationReminder.findOne({ _id: req.params.id, user: req.user._id });
    if (!reminder) return sendError(res, 'Reminder not found.', 404);

    const { date, time, taken } = req.body;
    if (!date || !time) return sendError(res, 'Date and time are required.', 400);

    // Check if log entry exists for this date/time
    const existingIdx = reminder.takenLog.findIndex(t => t.date === date && t.time === time);
    if (existingIdx >= 0) {
      reminder.takenLog[existingIdx].taken = taken !== false;
      reminder.takenLog[existingIdx].takenAt = taken !== false ? new Date() : null;
    } else {
      reminder.takenLog.push({
        date,
        time,
        taken: taken !== false,
        takenAt: taken !== false ? new Date() : null,
      });
    }

    await reminder.save();
    return sendSuccess(res, taken !== false ? 'Marked as taken.' : 'Marked as not taken.', { reminder });
  } catch (error) {
    return sendError(res, error.message);
  }
};

// ==================== DELETE REMINDER ====================
exports.deleteReminder = async (req, res) => {
  try {
    const reminder = await MedicationReminder.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!reminder) return sendError(res, 'Reminder not found.', 404);

    return sendSuccess(res, 'Reminder deleted.');
  } catch (error) {
    return sendError(res, error.message);
  }
};
