const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Prescription = require('../models/Prescription');
const PrescriptionMedicine = require('../models/PrescriptionMedicine');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// Helper: get a fresh Gemini model instance for prescription analysis
const getAnalysisModel = () => {
  if (!process.env.GEMINI_API_KEY) return null;
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' });
};

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

// Helper: parse duration string into number of days
const durationToDays = (dur) => {
  const d = (dur || '').toLowerCase();
  const match = d.match(/(\d+)/);
  if (!match) return 7;
  const num = parseInt(match[1]);
  if (d.includes('week')) return num * 7;
  if (d.includes('month')) return num * 30;
  return num;
};

// ==================== UPLOAD PRESCRIPTION IMAGE ====================
exports.uploadPrescription = async (req, res) => {
  try {
    if (!req.file) return sendError(res, 'No prescription image uploaded.', 400);

    const prescription = await Prescription.create({
      user: req.user._id,
      doctorName: req.body.doctorName || '',
      hospitalName: req.body.hospitalName || '',
      prescriptionDate: req.body.prescriptionDate || new Date(),
      prescriptionImage: `/uploads/prescriptions/${req.file.filename}`,
      entryType: 'IMAGE',
      status: 'pending',
    });

    return sendSuccess(res, 'Prescription image uploaded successfully.', { prescription }, 201);
  } catch (error) {
    console.error('Upload error:', error);
    return sendError(res, error.message);
  }
};

// ==================== MANUAL PRESCRIPTION ENTRY ====================
exports.manualEntry = async (req, res) => {
  try {
    const { doctorName, hospitalName, prescriptionDate, medicines } = req.body;

    if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return sendError(res, 'At least one medicine is required.', 400);
    }

    const prescription = await Prescription.create({
      user: req.user._id,
      doctorName: doctorName || '',
      hospitalName: hospitalName || '',
      prescriptionDate: prescriptionDate || new Date(),
      entryType: 'MANUAL',
      status: 'pending',
    });

    const medicineRecords = await PrescriptionMedicine.insertMany(
      medicines.map(m => ({
        prescription: prescription._id,
        medicineName: m.medicineName,
        dosage: m.dosage || '',
        frequency: m.frequency || '',
        duration: m.duration || '',
        instructions: m.instructions || '',
      }))
    );

    return sendSuccess(res, 'Prescription saved successfully.', {
      prescription,
      medicines: medicineRecords,
    }, 201);
  } catch (error) {
    console.error('Manual entry error:', error);
    return sendError(res, error.message);
  }
};

// ==================== ANALYZE PRESCRIPTION WITH AI ====================
exports.analyzePrescription = async (req, res) => {
  try {
    const model = getAnalysisModel();
    if (!model) return sendError(res, 'AI service not available. Please configure GEMINI_API_KEY.', 503);

    const prescription = await Prescription.findOne({ _id: req.params.id, user: req.user._id });
    if (!prescription) return sendError(res, 'Prescription not found.', 404);

    let medicines = await PrescriptionMedicine.find({ prescription: prescription._id });
    let analysisResult;

    if (prescription.entryType === 'IMAGE' && prescription.prescriptionImage) {
      // Image-based analysis: read image and send to Gemini vision
      const imagePath = path.join(__dirname, '../../..', prescription.prescriptionImage);

      let imageData, mimeType;
      try {
        const buffer = fs.readFileSync(imagePath);
        imageData = buffer.toString('base64');
        const ext = path.extname(imagePath).toLowerCase();
        mimeType = ext === '.png' ? 'image/png' : ext === '.pdf' ? 'application/pdf' : 'image/jpeg';
      } catch (fileErr) {
        // Fallback: if file read fails, do text-based analysis
        prescription.status = 'failed';
        await prescription.save();
        return sendError(res, 'Could not read prescription image file.', 400);
      }

      const prompt = `You are a medical prescription analyzer. Analyze this prescription image and extract all medicines listed.

For EACH medicine found, provide the following information in a JSON array:

[
  {
    "medicineName": "exact medicine name from prescription",
    "dosage": "dosage written (e.g., 500mg)",
    "frequency": "how often to take (e.g., 3 times per day)",
    "duration": "for how long (e.g., 5 days)",
    "instructions": "any special instructions from doctor",
    "purpose": "what this medicine is commonly used for, explained simply for a patient",
    "usage": "clear instructions on how to take this medicine properly",
    "sideEffects": ["list", "of", "common", "side", "effects"],
    "warnings": ["list", "of", "important", "warnings", "and", "precautions"]
  }
]

Also extract doctor information if visible:
{
  "doctorName": "doctor name if visible",
  "hospitalName": "hospital/clinic name if visible"
}

Return ONLY valid JSON in this exact format:
{
  "doctorInfo": { "doctorName": "", "hospitalName": "" },
  "medicines": [ ... ]
}

IMPORTANT: Respond with ONLY the JSON object, no markdown, no code fences, no explanation.`;

      try {
        const result = await model.generateContent([
          prompt,
          { inlineData: { mimeType, data: imageData } },
        ]);
        const responseText = result.response.text().trim();
        // Strip markdown code fences if present
        const cleanJson = responseText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
        analysisResult = JSON.parse(cleanJson);
      } catch (aiErr) {
        console.error('AI image analysis error:', aiErr);
        // Fallback to text-only prompt if vision fails
        try {
          const fallbackPrompt = `A prescription image was uploaded but could not be processed visually. 
Please provide general guidance: return an empty medicines array and doctor info.
Return ONLY valid JSON: {"doctorInfo":{"doctorName":"","hospitalName":""},"medicines":[]}`;
          const fallbackResult = await model.generateContent(fallbackPrompt);
          const fallbackText = fallbackResult.response.text().trim().replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
          analysisResult = JSON.parse(fallbackText);
        } catch (fallbackErr) {
          analysisResult = { doctorInfo: {}, medicines: [] };
        }
      }

      // Update doctor info if extracted
      if (analysisResult.doctorInfo) {
        if (analysisResult.doctorInfo.doctorName && !prescription.doctorName) {
          prescription.doctorName = analysisResult.doctorInfo.doctorName;
        }
        if (analysisResult.doctorInfo.hospitalName && !prescription.hospitalName) {
          prescription.hospitalName = analysisResult.doctorInfo.hospitalName;
        }
      }

      // Create PrescriptionMedicine records from AI extraction
      if (analysisResult.medicines && analysisResult.medicines.length > 0) {
        // Remove old medicine records if any
        await PrescriptionMedicine.deleteMany({ prescription: prescription._id });
        medicines = await PrescriptionMedicine.insertMany(
          analysisResult.medicines.map(m => ({
            prescription: prescription._id,
            medicineName: m.medicineName || 'Unknown Medicine',
            dosage: m.dosage || '',
            frequency: m.frequency || '',
            duration: m.duration || '',
            instructions: m.instructions || '',
            purpose: m.purpose || '',
            usage: m.usage || '',
            sideEffects: m.sideEffects || [],
            warnings: m.warnings || [],
          }))
        );
      }

    } else {
      // Manual entry: enrich existing medicine records with AI information
      if (medicines.length === 0) {
        return sendError(res, 'No medicines found in this prescription to analyze.', 400);
      }

      const medicineList = medicines.map(m => ({
        medicineName: m.medicineName,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration,
        instructions: m.instructions,
      }));

      const prompt = `You are a patient-friendly medical information provider. For each medicine listed below, provide detailed but easy-to-understand information.

Medicines from prescription:
${JSON.stringify(medicineList, null, 2)}

For EACH medicine, provide:
[
  {
    "medicineName": "the medicine name",
    "purpose": "why this medicine is commonly prescribed, in simple patient-friendly language",
    "usage": "clear step-by-step instructions on how to take this medicine properly",
    "sideEffects": ["common side effect 1", "common side effect 2", "..."],
    "warnings": ["important warning 1", "important warning 2", "..."]
  }
]

Return ONLY a valid JSON array with the above structure. No markdown, no code fences, no explanation.`;

      try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();
        const cleanJson = responseText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
        const enrichedMedicines = JSON.parse(cleanJson);

        analysisResult = { medicines: enrichedMedicines };

        // Update each PrescriptionMedicine record with AI data
        for (const enriched of enrichedMedicines) {
          const match = medicines.find(m =>
            m.medicineName.toLowerCase().includes(enriched.medicineName?.toLowerCase()) ||
            enriched.medicineName?.toLowerCase().includes(m.medicineName.toLowerCase())
          );
          if (match) {
            match.purpose = enriched.purpose || '';
            match.usage = enriched.usage || '';
            match.sideEffects = enriched.sideEffects || [];
            match.warnings = enriched.warnings || [];
            await match.save();
          }
        }

        // Reload updated medicines
        medicines = await PrescriptionMedicine.find({ prescription: prescription._id });
      } catch (aiErr) {
        console.error('AI text analysis error:', aiErr);
        analysisResult = { medicines: [], error: 'AI analysis failed. Please try again.' };
      }
    }

    prescription.analysisResult = analysisResult;
    prescription.status = (analysisResult.medicines && analysisResult.medicines.length > 0) ? 'analyzed' : 'failed';
    await prescription.save();

    return sendSuccess(res, 'Prescription analyzed successfully.', {
      prescription,
      medicines,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return sendError(res, error.message);
  }
};

// ==================== GET PRESCRIPTION HISTORY ====================
exports.getHistory = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Attach medicine count to each prescription
    const ids = prescriptions.map(p => p._id);
    const medicineCounts = await PrescriptionMedicine.aggregate([
      { $match: { prescription: { $in: ids } } },
      { $group: { _id: '$prescription', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    medicineCounts.forEach(mc => { countMap[mc._id.toString()] = mc.count; });
    prescriptions.forEach(p => { p.medicineCount = countMap[p._id.toString()] || 0; });

    return sendSuccess(res, 'Prescription history fetched.', { prescriptions });
  } catch (error) {
    return sendError(res, error.message);
  }
};

// ==================== GET SINGLE PRESCRIPTION ====================
exports.getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({ _id: req.params.id, user: req.user._id }).lean();
    if (!prescription) return sendError(res, 'Prescription not found.', 404);

    const medicines = await PrescriptionMedicine.find({ prescription: prescription._id });
    prescription.medicines = medicines;

    return sendSuccess(res, 'Prescription fetched.', { prescription });
  } catch (error) {
    return sendError(res, error.message);
  }
};

// ==================== DELETE PRESCRIPTION ====================
exports.deletePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!prescription) return sendError(res, 'Prescription not found.', 404);

    await PrescriptionMedicine.deleteMany({ prescription: prescription._id });

    // Delete image file if it exists
    if (prescription.prescriptionImage) {
      const imagePath = path.join(__dirname, '../../..', prescription.prescriptionImage);
      fs.unlink(imagePath, () => {});
    }

    return sendSuccess(res, 'Prescription deleted.');
  } catch (error) {
    return sendError(res, error.message);
  }
};

// ==================== CHAT ABOUT PRESCRIPTION ====================
exports.chatAboutPrescription = async (req, res) => {
  try {
    const model = getAnalysisModel();
    if (!model) return sendError(res, 'AI service not available.', 503);

    const { message } = req.body;
    if (!message || !message.trim()) return sendError(res, 'Message is required.', 400);

    const prescription = await Prescription.findOne({ _id: req.params.id, user: req.user._id });
    if (!prescription) return sendError(res, 'Prescription not found.', 404);

    const medicines = await PrescriptionMedicine.find({ prescription: prescription._id });

    const medicineContext = medicines.map(m => ({
      name: m.medicineName,
      dosage: m.dosage,
      frequency: m.frequency,
      duration: m.duration,
      purpose: m.purpose,
      instructions: m.instructions,
    }));

    const prompt = `You are SafeDose MedGuide AI Assistant. A patient is asking about their prescription medicines.

Here are the medicines in their current prescription:
${JSON.stringify(medicineContext, null, 2)}

IMPORTANT RULES:
1. You provide GENERAL medical information only. You are NOT a doctor.
2. ALWAYS recommend consulting their healthcare professional for personal medical advice.
3. NEVER diagnose conditions or change prescribed dosages.
4. Be empathetic, clear, and use simple patient-friendly language.
5. Answer based on the prescription context provided above.
6. If you don't know something, say so clearly.

Patient's question: ${message}

Provide a helpful, clear answer:`;

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();

    return sendSuccess(res, 'AI response generated.', { response: aiResponse });
  } catch (error) {
    console.error('Prescription chat error:', error);
    return sendError(res, 'Failed to generate response. Please try again.', 500);
  }
};
