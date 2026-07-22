const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const Role = require('../models/Role');
const User = require('../models/User');
const Category = require('../models/Category');
const Manufacturer = require('../models/Manufacturer');
const Medicine = require('../models/Medicine');
const DosageGuide = require('../models/DosageGuide');
const SideEffect = require('../models/SideEffect');
const DrugInteraction = require('../models/DrugInteraction');

const getMedicineImage = (name, dosageForm) => {
  const medicineImages = {
    'Paracetamol': 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Acetaminophen_500_mg_tablets.JPG',
    'Ibuprofen': 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Ibuprofen-400.jpg',
    'Aspirin': 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Aspirin-pills.jpg',
    'Amoxicillin': 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Amoxicillin_capsules.JPG',
    'Salbutamol': 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Albuterol.jpg',
    'Metformin': 'https://upload.wikimedia.org/wikipedia/commons/d/de/Metformin-500mg-tablets.jpg',
    'Insulin Glargine': 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Lantus_SoloStar_insulin_glargine.jpg',
    'Vitamin C': 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Vitamin-c-capsules.jpg',
    'Atorvastatin': 'https://upload.wikimedia.org/wikipedia/commons/9/91/Lipitor_10mg_tablets.jpg',
    'Diazepam': 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Valium_5_mg_tablets.jpg'
  };

  if (medicineImages[name]) {
    return medicineImages[name];
  }

  const fallbackImages = {
    'tablet': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop',
    'capsule': 'https://images.unsplash.com/photo-1607619056574-7b8d304b3b8f?q=80&w=600&auto=format&fit=crop',
    'syrup': 'https://images.unsplash.com/photo-1550572017-edd951b55104?q=80&w=600&auto=format&fit=crop',
    'solution': 'https://images.unsplash.com/photo-1550572017-edd951b55104?q=80&w=600&auto=format&fit=crop',
    'suspension': 'https://images.unsplash.com/photo-1550572017-edd951b55104?q=80&w=600&auto=format&fit=crop',
    'drops': 'https://images.unsplash.com/photo-1550572017-edd951b55104?q=80&w=600&auto=format&fit=crop',
    'inhaler': 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?q=80&w=600&auto=format&fit=crop',
    'cream': 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop',
    'ointment': 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop',
    'gel': 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop',
    'patch': 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop',
    'injection': 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?q=80&w=600&auto=format&fit=crop',
    'other': 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=600&auto=format&fit=crop',
    'powder': 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=600&auto=format&fit=crop'
  };

  return fallbackImages[dosageForm] || fallbackImages['tablet'];
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding...');

    // Clear existing data
    await Promise.all([
      Role.deleteMany({}),
      User.deleteMany({}),
      Category.deleteMany({}),
      Manufacturer.deleteMany({}),
      Medicine.deleteMany({}),
      DosageGuide.deleteMany({}),
      SideEffect.deleteMany({}),
      DrugInteraction.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // ============ SEED ROLES ============
    const roles = await Role.insertMany([
      {
        name: 'admin',
        description: 'System Administrator with full access',
        permissions: ['manage_users', 'manage_medicines', 'manage_categories', 'manage_manufacturers', 'view_reports', 'manage_system'],
      },
      {
        name: 'pharmacist',
        description: 'Healthcare Professional with medicine management access',
        permissions: ['manage_medicines', 'view_reports'],
      },
      {
        name: 'user',
        description: 'Regular user / Patient',
        permissions: ['view_medicines', 'use_ai_chat', 'manage_favorites'],
      },
    ]);
    console.log('✅ Roles seeded');

    const adminRole = roles.find(r => r.name === 'admin');
    const pharmacistRole = roles.find(r => r.name === 'pharmacist');
    const userRole = roles.find(r => r.name === 'user');

    // ============ SEED USERS ============
    await User.create([
      {
        firstName: 'Admin',
        lastName: 'SafeDose',
        email: 'admin@safedose.com',
        password: 'Admin@123',
        role: adminRole._id,
        phone: '+94771234567',
        isActive: true,
      },
      {
        firstName: 'Dr. Sarah',
        lastName: 'Pharmacist',
        email: 'pharmacist@safedose.com',
        password: 'Pharma@123',
        role: pharmacistRole._id,
        phone: '+94772345678',
        isActive: true,
      },
      {
        firstName: 'John',
        lastName: 'Patient',
        email: 'user@safedose.com',
        password: 'User@123',
        role: userRole._id,
        phone: '+94773456789',
        isActive: true,
      },
    ]);
    console.log('✅ Users seeded (admin@safedose.com / Admin@123)');

    // ============ SEED CATEGORIES ============
    const categories = await Category.create([
      { name: 'Pain Relief', description: 'Analgesics and anti-inflammatory medications', icon: '💊', medicineCount: 0 },
      { name: 'Antibiotics', description: 'Anti-bacterial medications', icon: '🦠', medicineCount: 0 },
      { name: 'Cardiovascular', description: 'Heart and blood pressure medications', icon: '❤️', medicineCount: 0 },
      { name: 'Diabetes', description: 'Blood sugar management medications', icon: '🩸', medicineCount: 0 },
      { name: 'Respiratory', description: 'Asthma, cough, and breathing medications', icon: '🫁', medicineCount: 0 },
      { name: 'Gastrointestinal', description: 'Stomach and digestive system medications', icon: '🏥', medicineCount: 0 },
      { name: 'Mental Health', description: 'Antidepressants, anti-anxiety, and psychiatric medications', icon: '🧠', medicineCount: 0 },
      { name: 'Allergy', description: 'Antihistamines and allergy relief medications', icon: '🤧', medicineCount: 0 },
      { name: 'Vitamins & Supplements', description: 'Nutritional supplements and vitamins', icon: '🍊', medicineCount: 0 },
      { name: 'Skin Care', description: 'Dermatological medications and creams', icon: '🧴', medicineCount: 0 },
      { name: 'Hormonal', description: 'Thyroid, hormonal therapies and contraceptives', icon: '⚗️', medicineCount: 0 },
      { name: 'Anti-viral', description: 'Antiviral and immune system medications', icon: '🛡️', medicineCount: 0 },
    ]);
    console.log('✅ Categories seeded');

    const catMap = {};
    categories.forEach(c => { catMap[c.name] = c._id; });

    // ============ SEED MANUFACTURERS ============
    const manufacturers = await Manufacturer.insertMany([
      { name: 'Pfizer Inc.', country: 'United States', website: 'https://www.pfizer.com', contactEmail: 'info@pfizer.com', isVerified: true },
      { name: 'Johnson & Johnson', country: 'United States', website: 'https://www.jnj.com', contactEmail: 'info@jnj.com', isVerified: true },
      { name: 'Novartis AG', country: 'Switzerland', website: 'https://www.novartis.com', contactEmail: 'info@novartis.com', isVerified: true },
      { name: 'GlaxoSmithKline', country: 'United Kingdom', website: 'https://www.gsk.com', contactEmail: 'info@gsk.com', isVerified: true },
      { name: 'AstraZeneca', country: 'United Kingdom', website: 'https://www.astrazeneca.com', contactEmail: 'info@astrazeneca.com', isVerified: true },
      { name: 'Roche Holding AG', country: 'Switzerland', website: 'https://www.roche.com', contactEmail: 'info@roche.com', isVerified: true },
      { name: 'Merck & Co.', country: 'United States', website: 'https://www.merck.com', contactEmail: 'info@merck.com', isVerified: true },
      { name: 'Sanofi SA', country: 'France', website: 'https://www.sanofi.com', contactEmail: 'info@sanofi.com', isVerified: true },
      { name: 'Abbott Laboratories', country: 'United States', website: 'https://www.abbott.com', contactEmail: 'info@abbott.com', isVerified: true },
      { name: 'Bayer AG', country: 'Germany', website: 'https://www.bayer.com', contactEmail: 'info@bayer.com', isVerified: true },
    ]);
    console.log('✅ Manufacturers seeded');

    const mfgMap = {};
    manufacturers.forEach(m => { mfgMap[m.name] = m._id; });

    // ============ SEED MEDICINES ============
    const medicinesData = [
      // Pain Relief
      { name: 'Paracetamol', genericName: 'Acetaminophen', brandName: 'Tylenol', category: catMap['Pain Relief'], manufacturer: mfgMap['Johnson & Johnson'], dosageForm: 'tablet', strength: '500mg', activeIngredients: ['Acetaminophen'], usage: 'Used for relief of mild to moderate pain and fever reduction.', warnings: ['Do not exceed 4000mg per day', 'Avoid alcohol while taking this medication', 'May cause liver damage in overdose'], contraindications: ['Severe liver disease', 'Known hypersensitivity to acetaminophen'], prescriptionRequired: false, price: 5.99, storageConditions: 'Store below 25°C in a dry place.', pregnancyWarning: 'Generally considered safe during pregnancy when used as directed. Consult your doctor.', breastfeedingWarning: 'Small amounts pass into breast milk. Generally considered safe.' },
      { name: 'Ibuprofen', genericName: 'Ibuprofen', brandName: 'Advil', category: catMap['Pain Relief'], manufacturer: mfgMap['Pfizer Inc.'], dosageForm: 'tablet', strength: '400mg', activeIngredients: ['Ibuprofen'], usage: 'Used for pain relief, inflammation reduction, and fever reduction.', warnings: ['May cause stomach bleeding', 'Take with food or milk', 'Do not use if you have had a stomach ulcer'], contraindications: ['Active stomach ulcer', 'Severe heart failure', 'Late pregnancy'], prescriptionRequired: false, price: 7.99 },
      { name: 'Aspirin', genericName: 'Acetylsalicylic Acid', brandName: 'Bayer Aspirin', category: catMap['Pain Relief'], manufacturer: mfgMap['Bayer AG'], dosageForm: 'tablet', strength: '325mg', activeIngredients: ['Acetylsalicylic Acid'], usage: 'Used for pain relief, anti-inflammatory, fever reduction, and blood thinning.', warnings: ['May cause stomach bleeding', 'Not for children under 16 (Reye syndrome risk)', 'Do not take before surgery'], contraindications: ['Active bleeding disorders', 'Children under 16', 'Stomach ulcers'], prescriptionRequired: false, price: 6.49 },
      { name: 'Naproxen', genericName: 'Naproxen Sodium', brandName: 'Aleve', category: catMap['Pain Relief'], manufacturer: mfgMap['Bayer AG'], dosageForm: 'tablet', strength: '250mg', activeIngredients: ['Naproxen Sodium'], usage: 'Used for relief of pain, inflammation, and stiffness in arthritis and muscle injuries.', warnings: ['Take with food', 'May increase risk of cardiovascular events'], contraindications: ['Active GI bleeding', 'Severe heart failure'], prescriptionRequired: false, price: 8.99 },
      { name: 'Diclofenac', genericName: 'Diclofenac Sodium', brandName: 'Voltaren', category: catMap['Pain Relief'], manufacturer: mfgMap['Novartis AG'], dosageForm: 'tablet', strength: '50mg', activeIngredients: ['Diclofenac Sodium'], usage: 'Used for pain and inflammation in arthritis, sprains, and muscle pain.', warnings: ['Take with food', 'May cause gastrointestinal side effects'], contraindications: ['Active peptic ulcer', 'Severe liver or kidney disease'], prescriptionRequired: true, price: 12.99 },
      // Antibiotics
      { name: 'Amoxicillin', genericName: 'Amoxicillin', brandName: 'Amoxil', category: catMap['Antibiotics'], manufacturer: mfgMap['GlaxoSmithKline'], dosageForm: 'capsule', strength: '500mg', activeIngredients: ['Amoxicillin trihydrate'], usage: 'Used to treat bacterial infections including respiratory, urinary, ear, and skin infections.', warnings: ['Complete the full course of treatment', 'May cause allergic reactions', 'May reduce effectiveness of oral contraceptives'], contraindications: ['Penicillin allergy', 'History of amoxicillin-associated liver disease'], prescriptionRequired: true, price: 15.99 },
      { name: 'Azithromycin', genericName: 'Azithromycin', brandName: 'Zithromax', category: catMap['Antibiotics'], manufacturer: mfgMap['Pfizer Inc.'], dosageForm: 'tablet', strength: '250mg', activeIngredients: ['Azithromycin dihydrate'], usage: 'Used to treat bacterial infections including respiratory infections, skin infections, and STIs.', warnings: ['May cause irregular heartbeat', 'Take on empty stomach or 2 hours after meal'], contraindications: ['History of cholestatic jaundice from azithromycin', 'Known macrolide allergy'], prescriptionRequired: true, price: 22.99 },
      { name: 'Ciprofloxacin', genericName: 'Ciprofloxacin HCl', brandName: 'Cipro', category: catMap['Antibiotics'], manufacturer: mfgMap['Bayer AG'], dosageForm: 'tablet', strength: '500mg', activeIngredients: ['Ciprofloxacin hydrochloride'], usage: 'Used to treat various bacterial infections including UTIs, respiratory, and GI infections.', warnings: ['May cause tendon damage', 'Avoid sun exposure', 'Take 2 hours before or 6 hours after antacids'], contraindications: ['Fluoroquinolone allergy', 'Children under 18 (except specific conditions)'], prescriptionRequired: true, price: 18.99 },
      { name: 'Metronidazole', genericName: 'Metronidazole', brandName: 'Flagyl', category: catMap['Antibiotics'], manufacturer: mfgMap['Pfizer Inc.'], dosageForm: 'tablet', strength: '400mg', activeIngredients: ['Metronidazole'], usage: 'Used to treat bacterial and parasitic infections.', warnings: ['Do NOT consume alcohol during treatment', 'May cause metallic taste'], contraindications: ['First trimester of pregnancy'], prescriptionRequired: true, price: 11.99 },
      { name: 'Cephalexin', genericName: 'Cephalexin', brandName: 'Keflex', category: catMap['Antibiotics'], manufacturer: mfgMap['Abbott Laboratories'], dosageForm: 'capsule', strength: '500mg', activeIngredients: ['Cephalexin monohydrate'], usage: 'Used for skin, respiratory, bone, and urinary tract infections.', warnings: ['Complete the full course', 'May cause diarrhea'], contraindications: ['Cephalosporin allergy'], prescriptionRequired: true, price: 14.99 },
      // Cardiovascular
      { name: 'Lisinopril', genericName: 'Lisinopril', brandName: 'Zestril', category: catMap['Cardiovascular'], manufacturer: mfgMap['AstraZeneca'], dosageForm: 'tablet', strength: '10mg', activeIngredients: ['Lisinopril'], usage: 'Used to treat high blood pressure and heart failure.', warnings: ['May cause dizziness', 'Monitor potassium levels', 'Do not use in pregnancy'], contraindications: ['Pregnancy', 'History of angioedema from ACE inhibitors'], prescriptionRequired: true, price: 16.99 },
      { name: 'Amlodipine', genericName: 'Amlodipine Besylate', brandName: 'Norvasc', category: catMap['Cardiovascular'], manufacturer: mfgMap['Pfizer Inc.'], dosageForm: 'tablet', strength: '5mg', activeIngredients: ['Amlodipine besylate'], usage: 'Used to treat high blood pressure and chest pain (angina).', warnings: ['May cause ankle swelling', 'Do not stop suddenly'], contraindications: ['Severe aortic stenosis', 'Unstable angina'], prescriptionRequired: true, price: 14.99 },
      { name: 'Atorvastatin', genericName: 'Atorvastatin Calcium', brandName: 'Lipitor', category: catMap['Cardiovascular'], manufacturer: mfgMap['Pfizer Inc.'], dosageForm: 'tablet', strength: '20mg', activeIngredients: ['Atorvastatin calcium trihydrate'], usage: 'Used to lower cholesterol and reduce risk of heart disease.', warnings: ['Report unexplained muscle pain', 'Avoid grapefruit juice', 'Regular liver function tests needed'], contraindications: ['Active liver disease', 'Pregnancy', 'Breastfeeding'], prescriptionRequired: true, price: 25.99 },
      { name: 'Losartan', genericName: 'Losartan Potassium', brandName: 'Cozaar', category: catMap['Cardiovascular'], manufacturer: mfgMap['Merck & Co.'], dosageForm: 'tablet', strength: '50mg', activeIngredients: ['Losartan potassium'], usage: 'Used to treat high blood pressure and protect kidneys in diabetic patients.', warnings: ['Do not use during pregnancy', 'May cause dizziness'], contraindications: ['Pregnancy', 'Severe liver impairment'], prescriptionRequired: true, price: 19.99 },
      { name: 'Metoprolol', genericName: 'Metoprolol Tartrate', brandName: 'Lopressor', category: catMap['Cardiovascular'], manufacturer: mfgMap['Novartis AG'], dosageForm: 'tablet', strength: '50mg', activeIngredients: ['Metoprolol tartrate'], usage: 'Used to treat high blood pressure, angina, and heart failure.', warnings: ['Do not stop suddenly', 'May mask hypoglycemia symptoms'], contraindications: ['Severe bradycardia', 'Cardiogenic shock', 'Decompensated heart failure'], prescriptionRequired: true, price: 13.99 },
      // Diabetes
      { name: 'Metformin', genericName: 'Metformin HCl', brandName: 'Glucophage', category: catMap['Diabetes'], manufacturer: mfgMap['Merck & Co.'], dosageForm: 'tablet', strength: '500mg', activeIngredients: ['Metformin hydrochloride'], usage: 'Used to control blood sugar levels in type 2 diabetes.', warnings: ['Take with meals', 'May cause GI upset initially', 'Rare risk of lactic acidosis'], contraindications: ['Severe kidney disease', 'Metabolic acidosis'], prescriptionRequired: true, price: 9.99 },
      { name: 'Glibenclamide', genericName: 'Glyburide', brandName: 'Diabeta', category: catMap['Diabetes'], manufacturer: mfgMap['Sanofi SA'], dosageForm: 'tablet', strength: '5mg', activeIngredients: ['Glibenclamide'], usage: 'Used to lower blood sugar in type 2 diabetes by stimulating insulin release.', warnings: ['Risk of hypoglycemia', 'Take with breakfast'], contraindications: ['Type 1 diabetes', 'Diabetic ketoacidosis'], prescriptionRequired: true, price: 8.99 },
      { name: 'Insulin Glargine', genericName: 'Insulin Glargine', brandName: 'Lantus', category: catMap['Diabetes'], manufacturer: mfgMap['Sanofi SA'], dosageForm: 'injection', strength: '100 units/mL', activeIngredients: ['Insulin glargine'], usage: 'Long-acting insulin used to control blood sugar in diabetes.', warnings: ['Monitor blood sugar regularly', 'Do not mix with other insulins', 'Rotate injection sites'], contraindications: ['Hypoglycemia', 'Known allergy to insulin glargine'], prescriptionRequired: true, price: 89.99 },
      // Respiratory
      { name: 'Salbutamol', genericName: 'Albuterol', brandName: 'Ventolin', category: catMap['Respiratory'], manufacturer: mfgMap['GlaxoSmithKline'], dosageForm: 'inhaler', strength: '100mcg/puff', activeIngredients: ['Salbutamol sulfate'], usage: 'Used for relief and prevention of bronchospasm in asthma and COPD.', warnings: ['Do not exceed recommended dose', 'May cause tremor and palpitations'], contraindications: ['Known hypersensitivity'], prescriptionRequired: true, price: 24.99 },
      { name: 'Montelukast', genericName: 'Montelukast Sodium', brandName: 'Singulair', category: catMap['Respiratory'], manufacturer: mfgMap['Merck & Co.'], dosageForm: 'tablet', strength: '10mg', activeIngredients: ['Montelukast sodium'], usage: 'Used for long-term management of asthma and allergic rhinitis.', warnings: ['May cause mood changes', 'Take in the evening'], contraindications: ['Known hypersensitivity to montelukast'], prescriptionRequired: true, price: 29.99 },
      { name: 'Fluticasone', genericName: 'Fluticasone Propionate', brandName: 'Flonase', category: catMap['Respiratory'], manufacturer: mfgMap['GlaxoSmithKline'], dosageForm: 'inhaler', strength: '50mcg/spray', activeIngredients: ['Fluticasone propionate'], usage: 'Used for prevention of asthma symptoms and treatment of allergic rhinitis.', warnings: ['Rinse mouth after use', 'Not for acute asthma attacks'], contraindications: ['Active untreated infections'], prescriptionRequired: true, price: 27.99 },
      // Gastrointestinal
      { name: 'Omeprazole', genericName: 'Omeprazole', brandName: 'Prilosec', category: catMap['Gastrointestinal'], manufacturer: mfgMap['AstraZeneca'], dosageForm: 'capsule', strength: '20mg', activeIngredients: ['Omeprazole magnesium'], usage: 'Used to reduce stomach acid, treat GERD, and heal stomach ulcers.', warnings: ['Long-term use may reduce magnesium levels', 'Take before meals'], contraindications: ['Known hypersensitivity to proton pump inhibitors'], prescriptionRequired: false, price: 12.99 },
      { name: 'Pantoprazole', genericName: 'Pantoprazole Sodium', brandName: 'Protonix', category: catMap['Gastrointestinal'], manufacturer: mfgMap['Pfizer Inc.'], dosageForm: 'tablet', strength: '40mg', activeIngredients: ['Pantoprazole sodium sesquihydrate'], usage: 'Used for treatment of GERD and Zollinger-Ellison syndrome.', warnings: ['Long-term use may increase fracture risk', 'Take before breakfast'], contraindications: ['Hypersensitivity to substituted benzimidazoles'], prescriptionRequired: true, price: 15.99 },
      { name: 'Domperidone', genericName: 'Domperidone', brandName: 'Motilium', category: catMap['Gastrointestinal'], manufacturer: mfgMap['Johnson & Johnson'], dosageForm: 'tablet', strength: '10mg', activeIngredients: ['Domperidone maleate'], usage: 'Used to relieve nausea, vomiting, and feelings of bloating.', warnings: ['May cause dry mouth', 'Take before meals'], contraindications: ['Prolactin-releasing pituitary tumor', 'GI hemorrhage'], prescriptionRequired: true, price: 9.99 },
      { name: 'Loperamide', genericName: 'Loperamide HCl', brandName: 'Imodium', category: catMap['Gastrointestinal'], manufacturer: mfgMap['Johnson & Johnson'], dosageForm: 'capsule', strength: '2mg', activeIngredients: ['Loperamide hydrochloride'], usage: 'Used to treat acute and chronic diarrhea.', warnings: ['Do not use if you have bloody diarrhea or high fever', 'Stay hydrated'], contraindications: ['Bacterial enterocolitis', 'Pseudomembranous colitis'], prescriptionRequired: false, price: 7.49 },
      // Mental Health
      { name: 'Sertraline', genericName: 'Sertraline HCl', brandName: 'Zoloft', category: catMap['Mental Health'], manufacturer: mfgMap['Pfizer Inc.'], dosageForm: 'tablet', strength: '50mg', activeIngredients: ['Sertraline hydrochloride'], usage: 'Used to treat depression, anxiety, OCD, PTSD, and panic disorder.', warnings: ['May increase suicidal thoughts in young adults initially', 'Do not stop suddenly', 'Avoid alcohol'], contraindications: ['Use with MAOIs', 'Use with pimozide'], prescriptionRequired: true, price: 19.99 },
      { name: 'Fluoxetine', genericName: 'Fluoxetine HCl', brandName: 'Prozac', category: catMap['Mental Health'], manufacturer: mfgMap['Roche Holding AG'], dosageForm: 'capsule', strength: '20mg', activeIngredients: ['Fluoxetine hydrochloride'], usage: 'Used to treat major depression, OCD, panic disorder, and bulimia nervosa.', warnings: ['May take 4-6 weeks for full effect', 'Monitor for mood changes', 'Do not stop abruptly'], contraindications: ['Use with MAOIs', 'Use with thioridazine'], prescriptionRequired: true, price: 17.99 },
      { name: 'Diazepam', genericName: 'Diazepam', brandName: 'Valium', category: catMap['Mental Health'], manufacturer: mfgMap['Roche Holding AG'], dosageForm: 'tablet', strength: '5mg', activeIngredients: ['Diazepam'], usage: 'Used for anxiety relief, muscle spasm, seizures, and alcohol withdrawal.', warnings: ['Risk of dependence with long-term use', 'Do not drive or operate machinery', 'Avoid alcohol'], contraindications: ['Severe respiratory insufficiency', 'Myasthenia gravis', 'Sleep apnea syndrome'], prescriptionRequired: true, price: 11.99 },
      // Allergy
      { name: 'Cetirizine', genericName: 'Cetirizine HCl', brandName: 'Zyrtec', category: catMap['Allergy'], manufacturer: mfgMap['Johnson & Johnson'], dosageForm: 'tablet', strength: '10mg', activeIngredients: ['Cetirizine hydrochloride'], usage: 'Used to relieve allergy symptoms such as sneezing, runny nose, and itchy eyes.', warnings: ['May cause drowsiness', 'Avoid alcohol'], contraindications: ['Severe kidney disease', 'Known hypersensitivity'], prescriptionRequired: false, price: 9.99 },
      { name: 'Loratadine', genericName: 'Loratadine', brandName: 'Claritin', category: catMap['Allergy'], manufacturer: mfgMap['Bayer AG'], dosageForm: 'tablet', strength: '10mg', activeIngredients: ['Loratadine'], usage: 'Used for relief of seasonal and perennial allergy symptoms.', warnings: ['Usually non-drowsy', 'Take once daily'], contraindications: ['Known hypersensitivity'], prescriptionRequired: false, price: 11.49 },
      { name: 'Fexofenadine', genericName: 'Fexofenadine HCl', brandName: 'Allegra', category: catMap['Allergy'], manufacturer: mfgMap['Sanofi SA'], dosageForm: 'tablet', strength: '180mg', activeIngredients: ['Fexofenadine hydrochloride'], usage: 'Used for relief of symptoms of seasonal allergic rhinitis and chronic hives.', warnings: ['Non-drowsy', 'Avoid fruit juices around dosing time'], contraindications: ['Known hypersensitivity'], prescriptionRequired: false, price: 13.99 },
      // Vitamins & Supplements
      { name: 'Vitamin D3', genericName: 'Cholecalciferol', brandName: 'Nature Made D3', category: catMap['Vitamins & Supplements'], manufacturer: mfgMap['Abbott Laboratories'], dosageForm: 'tablet', strength: '1000 IU', activeIngredients: ['Cholecalciferol'], usage: 'Used to prevent and treat vitamin D deficiency, supports bone health.', warnings: ['High doses may cause hypercalcemia', 'Take with meals for better absorption'], contraindications: ['Hypercalcemia', 'Hypervitaminosis D'], prescriptionRequired: false, price: 8.99 },
      { name: 'Vitamin C', genericName: 'Ascorbic Acid', brandName: 'Celin', category: catMap['Vitamins & Supplements'], manufacturer: mfgMap['Abbott Laboratories'], dosageForm: 'tablet', strength: '500mg', activeIngredients: ['Ascorbic acid'], usage: 'Used to prevent and treat vitamin C deficiency, boosts immune system.', warnings: ['High doses may cause GI upset', 'May affect some lab tests'], contraindications: ['Known sensitivity to ascorbic acid'], prescriptionRequired: false, price: 6.49 },
      { name: 'Iron Supplement', genericName: 'Ferrous Sulfate', brandName: 'Feosol', category: catMap['Vitamins & Supplements'], manufacturer: mfgMap['Sanofi SA'], dosageForm: 'tablet', strength: '325mg', activeIngredients: ['Ferrous sulfate'], usage: 'Used to treat and prevent iron deficiency anemia.', warnings: ['May cause constipation and dark stools', 'Take on empty stomach with vitamin C', 'Keep away from children'], contraindications: ['Hemochromatosis', 'Hemolytic anemias'], prescriptionRequired: false, price: 7.99 },
      { name: 'Calcium + Vitamin D', genericName: 'Calcium Carbonate + Cholecalciferol', brandName: 'Caltrate', category: catMap['Vitamins & Supplements'], manufacturer: mfgMap['Pfizer Inc.'], dosageForm: 'tablet', strength: '600mg + 400IU', activeIngredients: ['Calcium carbonate', 'Cholecalciferol'], usage: 'Used to prevent calcium and vitamin D deficiency, supports bone health.', warnings: ['Take with meals', 'May interact with certain antibiotics'], contraindications: ['Hypercalcemia', 'Kidney stones'], prescriptionRequired: false, price: 10.99 },
      // Skin Care
      { name: 'Hydrocortisone Cream', genericName: 'Hydrocortisone', brandName: 'Cortaid', category: catMap['Skin Care'], manufacturer: mfgMap['Johnson & Johnson'], dosageForm: 'cream', strength: '1%', activeIngredients: ['Hydrocortisone'], usage: 'Used to treat skin inflammation, eczema, insect bites, and rashes.', warnings: ['Do not use on infected skin', 'Avoid prolonged use on face', 'For external use only'], contraindications: ['Skin infections', 'Rosacea', 'Perioral dermatitis'], prescriptionRequired: false, price: 8.49 },
      { name: 'Clotrimazole Cream', genericName: 'Clotrimazole', brandName: 'Lotrimin', category: catMap['Skin Care'], manufacturer: mfgMap['Bayer AG'], dosageForm: 'cream', strength: '1%', activeIngredients: ['Clotrimazole'], usage: 'Used to treat fungal skin infections including athlete foot and ringworm.', warnings: ['For external use only', 'Complete full course of treatment'], contraindications: ['Known hypersensitivity to clotrimazole'], prescriptionRequired: false, price: 9.99 },
      // Hormonal
      { name: 'Levothyroxine', genericName: 'Levothyroxine Sodium', brandName: 'Synthroid', category: catMap['Hormonal'], manufacturer: mfgMap['Abbott Laboratories'], dosageForm: 'tablet', strength: '50mcg', activeIngredients: ['Levothyroxine sodium'], usage: 'Used to treat hypothyroidism (underactive thyroid).', warnings: ['Take on empty stomach 30-60 min before breakfast', 'Regular thyroid function tests needed'], contraindications: ['Untreated adrenal insufficiency', 'Thyrotoxicosis'], prescriptionRequired: true, price: 15.99 },
      { name: 'Prednisolone', genericName: 'Prednisolone', brandName: 'Prelone', category: catMap['Hormonal'], manufacturer: mfgMap['Sanofi SA'], dosageForm: 'tablet', strength: '5mg', activeIngredients: ['Prednisolone'], usage: 'Used to treat inflammatory conditions, autoimmune disorders, and allergic reactions.', warnings: ['Do not stop suddenly after long-term use', 'May increase blood sugar', 'May weaken immune system'], contraindications: ['Systemic fungal infections', 'Live vaccines during high-dose therapy'], prescriptionRequired: true, price: 12.49 },
      // Anti-viral
      { name: 'Acyclovir', genericName: 'Acyclovir', brandName: 'Zovirax', category: catMap['Anti-viral'], manufacturer: mfgMap['GlaxoSmithKline'], dosageForm: 'tablet', strength: '400mg', activeIngredients: ['Acyclovir'], usage: 'Used to treat herpes simplex, varicella-zoster, and shingles.', warnings: ['Stay well hydrated', 'Complete full course'], contraindications: ['Known hypersensitivity to acyclovir'], prescriptionRequired: true, price: 22.99 },
      { name: 'Oseltamivir', genericName: 'Oseltamivir Phosphate', brandName: 'Tamiflu', category: catMap['Anti-viral'], manufacturer: mfgMap['Roche Holding AG'], dosageForm: 'capsule', strength: '75mg', activeIngredients: ['Oseltamivir phosphate'], usage: 'Used to treat and prevent influenza (flu).', warnings: ['Start within 48 hours of symptom onset', 'May cause nausea and vomiting'], contraindications: ['Known hypersensitivity'], prescriptionRequired: true, price: 45.99 },
      // More Pain Relief
      { name: 'Tramadol', genericName: 'Tramadol HCl', brandName: 'Ultram', category: catMap['Pain Relief'], manufacturer: mfgMap['Johnson & Johnson'], dosageForm: 'tablet', strength: '50mg', activeIngredients: ['Tramadol hydrochloride'], usage: 'Used for moderate to moderately severe pain.', warnings: ['Risk of dependence', 'May cause seizures', 'Do not take with alcohol or sedatives'], contraindications: ['Severe respiratory depression', 'Acute intoxication', 'Use with MAOIs'], prescriptionRequired: true, price: 16.99 },
      { name: 'Gabapentin', genericName: 'Gabapentin', brandName: 'Neurontin', category: catMap['Pain Relief'], manufacturer: mfgMap['Pfizer Inc.'], dosageForm: 'capsule', strength: '300mg', activeIngredients: ['Gabapentin'], usage: 'Used for neuropathic pain and as an adjunct in epilepsy.', warnings: ['May cause drowsiness and dizziness', 'Do not stop suddenly'], contraindications: ['Known hypersensitivity'], prescriptionRequired: true, price: 18.99 },
      // More GI
      { name: 'Ranitidine', genericName: 'Ranitidine HCl', brandName: 'Zantac', category: catMap['Gastrointestinal'], manufacturer: mfgMap['GlaxoSmithKline'], dosageForm: 'tablet', strength: '150mg', activeIngredients: ['Ranitidine hydrochloride'], usage: 'Used to reduce stomach acid and treat heartburn, GERD, and ulcers.', warnings: ['May interact with certain medications', 'Take 30-60 minutes before meals'], contraindications: ['Known hypersensitivity'], prescriptionRequired: false, price: 10.99 },
      // More Cardiovascular
      { name: 'Warfarin', genericName: 'Warfarin Sodium', brandName: 'Coumadin', category: catMap['Cardiovascular'], manufacturer: mfgMap['Abbott Laboratories'], dosageForm: 'tablet', strength: '5mg', activeIngredients: ['Warfarin sodium'], usage: 'Used as a blood thinner to prevent blood clots, stroke, and heart attack.', warnings: ['Regular INR monitoring required', 'Avoid vitamin K-rich foods in excess', 'Avoid alcohol'], contraindications: ['Pregnancy', 'Active bleeding', 'Recent surgery'], prescriptionRequired: true, price: 14.49 },
      { name: 'Clopidogrel', genericName: 'Clopidogrel Bisulfate', brandName: 'Plavix', category: catMap['Cardiovascular'], manufacturer: mfgMap['Sanofi SA'], dosageForm: 'tablet', strength: '75mg', activeIngredients: ['Clopidogrel bisulfate'], usage: 'Used to prevent blood clots after heart attack or stroke.', warnings: ['Do not stop without consulting doctor', 'Report any unusual bleeding'], contraindications: ['Active pathological bleeding', 'Severe liver impairment'], prescriptionRequired: true, price: 28.99 },
      // More Diabetes
      { name: 'Sitagliptin', genericName: 'Sitagliptin Phosphate', brandName: 'Januvia', category: catMap['Diabetes'], manufacturer: mfgMap['Merck & Co.'], dosageForm: 'tablet', strength: '100mg', activeIngredients: ['Sitagliptin phosphate'], usage: 'Used alongside diet and exercise to improve blood sugar control in type 2 diabetes.', warnings: ['May cause pancreatitis (rare)', 'Dose adjustment needed for kidney impairment'], contraindications: ['Type 1 diabetes', 'Diabetic ketoacidosis'], prescriptionRequired: true, price: 42.99 },
    ];

    const medicinesWithImages = medicinesData.map(med => ({
      ...med,
      image: getMedicineImage(med.name, med.dosageForm || 'tablet')
    }));

    const medicines = await Medicine.insertMany(medicinesWithImages);
    console.log(`✅ ${medicines.length} Medicines seeded`);

    // Update category medicine counts
    const categoryCounts = {};
    medicines.forEach(m => {
      const catId = m.category.toString();
      categoryCounts[catId] = (categoryCounts[catId] || 0) + 1;
    });
    for (const [catId, count] of Object.entries(categoryCounts)) {
      await Category.findByIdAndUpdate(catId, { medicineCount: count });
    }
    console.log('✅ Category medicine counts updated');

    // ============ SEED DOSAGE GUIDES ============
    const paracetamol = medicines.find(m => m.name === 'Paracetamol');
    const ibuprofen = medicines.find(m => m.name === 'Ibuprofen');
    const amoxicillin = medicines.find(m => m.name === 'Amoxicillin');
    const metformin = medicines.find(m => m.name === 'Metformin');
    const omeprazole = medicines.find(m => m.name === 'Omeprazole');
    const cetirizine = medicines.find(m => m.name === 'Cetirizine');
    const lisinopril = medicines.find(m => m.name === 'Lisinopril');

    await DosageGuide.insertMany([
      // Paracetamol dosages
      { medicine: paracetamol._id, ageGroup: 'infant', dosage: '60-120mg', frequency: 'Every 4-6 hours', route: 'oral', maxDailyDose: '480mg', specialInstructions: 'Use infant drops or syrup formulation', foodInstructions: 'Can be given with or without food', missedDoseInstructions: 'Give as soon as remembered. Do not double dose.' },
      { medicine: paracetamol._id, ageGroup: 'child', dosage: '250-500mg', frequency: 'Every 4-6 hours', route: 'oral', maxDailyDose: '2000mg', specialInstructions: 'Use age-appropriate formulation', foodInstructions: 'Can be taken with or without food' },
      { medicine: paracetamol._id, ageGroup: 'adult', dosage: '500-1000mg', frequency: 'Every 4-6 hours', route: 'oral', maxDailyDose: '4000mg', specialInstructions: 'Do not exceed maximum daily dose to avoid liver damage', foodInstructions: 'Can be taken with or without food' },
      { medicine: paracetamol._id, ageGroup: 'elderly', dosage: '500mg', frequency: 'Every 6 hours', route: 'oral', maxDailyDose: '3000mg', specialInstructions: 'Reduced maximum dose for elderly patients', foodInstructions: 'Can be taken with or without food' },
      // Ibuprofen dosages
      { medicine: ibuprofen._id, ageGroup: 'child', dosage: '200mg', frequency: 'Every 6-8 hours', route: 'oral', maxDailyDose: '600mg', specialInstructions: 'Use only if over 6 months of age', foodInstructions: 'Take with food or milk to reduce stomach upset' },
      { medicine: ibuprofen._id, ageGroup: 'adult', dosage: '200-400mg', frequency: 'Every 4-6 hours', route: 'oral', maxDailyDose: '1200mg (OTC) / 3200mg (prescription)', specialInstructions: 'Use lowest effective dose for shortest duration', foodInstructions: 'Take with food or milk' },
      { medicine: ibuprofen._id, ageGroup: 'elderly', dosage: '200mg', frequency: 'Every 6-8 hours', route: 'oral', maxDailyDose: '1200mg', specialInstructions: 'Use with caution; increased GI and renal risks', foodInstructions: 'Always take with food' },
      // Amoxicillin dosages
      { medicine: amoxicillin._id, ageGroup: 'child', dosage: '250mg', frequency: 'Every 8 hours', route: 'oral', duration: '7-10 days', maxDailyDose: '750mg', specialInstructions: 'Complete full course even if symptoms improve', foodInstructions: 'Can be taken with or without food' },
      { medicine: amoxicillin._id, ageGroup: 'adult', dosage: '500mg', frequency: 'Every 8 hours', route: 'oral', duration: '7-10 days', maxDailyDose: '1500mg', specialInstructions: 'Complete full course of antibiotics', foodInstructions: 'Can be taken with or without food' },
      // Metformin dosages
      { medicine: metformin._id, ageGroup: 'adult', dosage: '500mg', frequency: 'Twice daily with meals', route: 'oral', maxDailyDose: '2000mg', specialInstructions: 'Gradually increase dose to minimize GI side effects', foodInstructions: 'Always take with meals' },
      { medicine: metformin._id, ageGroup: 'elderly', dosage: '500mg', frequency: 'Once or twice daily', route: 'oral', maxDailyDose: '1500mg', specialInstructions: 'Monitor renal function regularly', foodInstructions: 'Take with meals' },
      // Omeprazole dosages
      { medicine: omeprazole._id, ageGroup: 'adult', dosage: '20mg', frequency: 'Once daily', route: 'oral', duration: '4-8 weeks', maxDailyDose: '40mg', specialInstructions: 'Take 30 minutes before first meal of the day', foodInstructions: 'Take before meals on empty stomach' },
      // Cetirizine dosages
      { medicine: cetirizine._id, ageGroup: 'child', dosage: '5mg', frequency: 'Once daily', route: 'oral', maxDailyDose: '5mg', specialInstructions: 'For children 6-12 years', foodInstructions: 'Can be taken with or without food' },
      { medicine: cetirizine._id, ageGroup: 'adult', dosage: '10mg', frequency: 'Once daily', route: 'oral', maxDailyDose: '10mg', specialInstructions: 'Take in the evening if drowsiness occurs', foodInstructions: 'Can be taken with or without food' },
      // Lisinopril dosages
      { medicine: lisinopril._id, ageGroup: 'adult', dosage: '10mg', frequency: 'Once daily', route: 'oral', maxDailyDose: '80mg', specialInstructions: 'Start with lower dose and titrate up gradually', foodInstructions: 'Can be taken with or without food' },
    ]);
    console.log('✅ Dosage guides seeded');

    // ============ SEED SIDE EFFECTS ============
    await SideEffect.insertMany([
      // Paracetamol side effects
      { medicine: paracetamol._id, effect: 'Nausea', severity: 'mild', frequency: 'uncommon', description: 'Mild nausea may occur', actionRequired: 'Take with food if persistent' },
      { medicine: paracetamol._id, effect: 'Allergic Skin Rash', severity: 'moderate', frequency: 'rare', description: 'Skin rash or itching', actionRequired: 'Discontinue and consult doctor' },
      { medicine: paracetamol._id, effect: 'Liver Damage (Overdose)', severity: 'life-threatening', frequency: 'rare', description: 'Hepatotoxicity from exceeding maximum dose', actionRequired: 'Seek emergency medical attention immediately' },
      // Ibuprofen side effects
      { medicine: ibuprofen._id, effect: 'Stomach Pain', severity: 'mild', frequency: 'common', description: 'Upset stomach, indigestion', actionRequired: 'Take with food or milk' },
      { medicine: ibuprofen._id, effect: 'Headache', severity: 'mild', frequency: 'common', description: 'Mild headache', actionRequired: 'Usually resolves on its own' },
      { medicine: ibuprofen._id, effect: 'GI Bleeding', severity: 'severe', frequency: 'rare', description: 'Stomach or intestinal bleeding', actionRequired: 'Seek immediate medical attention' },
      { medicine: ibuprofen._id, effect: 'Kidney Problems', severity: 'severe', frequency: 'rare', description: 'Decreased kidney function with long-term use', actionRequired: 'Consult doctor immediately' },
      // Amoxicillin side effects
      { medicine: amoxicillin._id, effect: 'Diarrhea', severity: 'mild', frequency: 'common', description: 'Loose or watery stools', actionRequired: 'Stay hydrated, consult doctor if severe' },
      { medicine: amoxicillin._id, effect: 'Skin Rash', severity: 'moderate', frequency: 'common', description: 'Red, itchy skin rash', actionRequired: 'Discontinue and contact doctor (may indicate allergy)' },
      { medicine: amoxicillin._id, effect: 'Anaphylaxis', severity: 'life-threatening', frequency: 'very-rare', description: 'Severe allergic reaction with difficulty breathing', actionRequired: 'Call emergency services immediately' },
      // Metformin side effects
      { medicine: metformin._id, effect: 'Nausea & Vomiting', severity: 'mild', frequency: 'very-common', description: 'GI upset, especially when starting', actionRequired: 'Take with meals, symptoms usually improve over time' },
      { medicine: metformin._id, effect: 'Diarrhea', severity: 'mild', frequency: 'common', description: 'Loose stools', actionRequired: 'Take with food, consider dose reduction' },
      { medicine: metformin._id, effect: 'Lactic Acidosis', severity: 'life-threatening', frequency: 'very-rare', description: 'Build-up of lactic acid in the blood', actionRequired: 'Seek emergency medical attention immediately' },
      // Cetirizine side effects
      { medicine: cetirizine._id, effect: 'Drowsiness', severity: 'mild', frequency: 'common', description: 'Feeling sleepy or tired', actionRequired: 'Avoid driving if affected. Take at bedtime.' },
      { medicine: cetirizine._id, effect: 'Dry Mouth', severity: 'mild', frequency: 'common', description: 'Dryness of mouth', actionRequired: 'Stay hydrated, chew sugar-free gum' },
      // Sertraline side effects
      { medicine: medicines.find(m => m.name === 'Sertraline')._id, effect: 'Nausea', severity: 'mild', frequency: 'very-common', description: 'Feeling sick, especially in first weeks', actionRequired: 'Take with food, usually improves over time' },
      { medicine: medicines.find(m => m.name === 'Sertraline')._id, effect: 'Insomnia', severity: 'mild', frequency: 'common', description: 'Difficulty sleeping', actionRequired: 'Take in the morning instead of evening' },
      { medicine: medicines.find(m => m.name === 'Sertraline')._id, effect: 'Sexual Dysfunction', severity: 'moderate', frequency: 'common', description: 'Decreased libido or difficulty with orgasm', actionRequired: 'Discuss with doctor; dose adjustment or switch may help' },
    ]);
    console.log('✅ Side effects seeded');

    // ============ SEED DRUG INTERACTIONS ============
    await DrugInteraction.insertMany([
      {
        drugA: ibuprofen._id, drugB: medicines.find(m => m.name === 'Aspirin')._id,
        severity: 'major', description: 'Ibuprofen may interfere with the antiplatelet effect of aspirin.',
        mechanism: 'Ibuprofen competes for COX-1 binding site', clinicalEffect: 'Reduced cardioprotective effect of aspirin',
        management: 'Take aspirin at least 30 minutes before ibuprofen', evidenceLevel: 'established',
      },
      {
        drugA: ibuprofen._id, drugB: medicines.find(m => m.name === 'Warfarin')._id,
        severity: 'major', description: 'NSAIDs increase bleeding risk when taken with blood thinners.',
        mechanism: 'NSAIDs inhibit platelet function and may cause GI erosion', clinicalEffect: 'Increased risk of bleeding',
        management: 'Avoid combination or use with close monitoring of INR', evidenceLevel: 'established',
      },
      {
        drugA: medicines.find(m => m.name === 'Lisinopril')._id, drugB: ibuprofen._id,
        severity: 'moderate', description: 'NSAIDs may reduce the antihypertensive effect of ACE inhibitors.',
        mechanism: 'NSAIDs inhibit prostaglandin synthesis', clinicalEffect: 'Decreased blood pressure control, increased kidney risk',
        management: 'Monitor blood pressure and kidney function', evidenceLevel: 'established',
      },
      {
        drugA: metformin._id, drugB: medicines.find(m => m.name === 'Ciprofloxacin')._id,
        severity: 'moderate', description: 'Ciprofloxacin may alter blood sugar levels in patients taking metformin.',
        mechanism: 'Fluoroquinolones can cause dysglycemia', clinicalEffect: 'Risk of hypoglycemia or hyperglycemia',
        management: 'Monitor blood glucose closely during concurrent use', evidenceLevel: 'probable',
      },
      {
        drugA: medicines.find(m => m.name === 'Sertraline')._id, drugB: medicines.find(m => m.name === 'Tramadol')._id,
        severity: 'major', description: 'Combining SSRIs with tramadol increases risk of serotonin syndrome.',
        mechanism: 'Both drugs increase serotonin levels', clinicalEffect: 'Serotonin syndrome: agitation, confusion, rapid heart rate, high blood pressure',
        management: 'Avoid combination; if necessary, use lowest doses with close monitoring', evidenceLevel: 'established',
      },
      {
        drugA: medicines.find(m => m.name === 'Warfarin')._id, drugB: medicines.find(m => m.name === 'Aspirin')._id,
        severity: 'major', description: 'Combining warfarin with aspirin significantly increases bleeding risk.',
        mechanism: 'Dual anticoagulant/antiplatelet effect', clinicalEffect: 'Greatly increased risk of serious bleeding events',
        management: 'Generally avoid unless specifically indicated by physician', evidenceLevel: 'established',
      },
      {
        drugA: medicines.find(m => m.name === 'Diazepam')._id, drugB: medicines.find(m => m.name === 'Sertraline')._id,
        severity: 'moderate', description: 'Sertraline may increase diazepam levels.',
        mechanism: 'Sertraline inhibits CYP2C19 metabolism of diazepam', clinicalEffect: 'Increased sedation and CNS depression',
        management: 'Monitor for increased sedation; consider dose reduction of diazepam', evidenceLevel: 'established',
      },
      {
        drugA: medicines.find(m => m.name === 'Atorvastatin')._id, drugB: medicines.find(m => m.name === 'Azithromycin')._id,
        severity: 'moderate', description: 'Azithromycin may increase atorvastatin levels.',
        mechanism: 'Possible inhibition of hepatic metabolism', clinicalEffect: 'Increased risk of myopathy and rhabdomyolysis',
        management: 'Monitor for muscle pain or weakness during concurrent use', evidenceLevel: 'probable',
      },
    ]);
    console.log('✅ Drug interactions seeded');

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('Login credentials:');
    console.log('  Admin:      admin@safedose.com / Admin@123');
    console.log('  Pharmacist: pharmacist@safedose.com / Pharma@123');
    console.log('  User:       user@safedose.com / User@123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();
