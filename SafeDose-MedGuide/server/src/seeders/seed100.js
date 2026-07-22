const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const Category = require('../models/Category');
const Manufacturer = require('../models/Manufacturer');
const Medicine = require('../models/Medicine');

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

const drugTemplates = [
  { category: 'Pain Relief', genericName: 'Tramadol', brandName: 'ConZip', form: 'tablet', strength: '50mg', prescription: true, usage: 'Used to treat moderate to severe pain.' },
  { category: 'Pain Relief', genericName: 'Oxycodone', brandName: 'OxyContin', form: 'tablet', strength: '10mg', prescription: true, usage: 'Used to treat moderate to severe pain.' },
  { category: 'Pain Relief', genericName: 'Hydrocodone', brandName: 'Hysingla', form: 'tablet', strength: '20mg', prescription: true, usage: 'Used for severe chronic pain management.' },
  { category: 'Pain Relief', genericName: 'Fentanyl', brandName: 'Duragesic', form: 'patch', strength: '25mcg/hr', prescription: true, usage: 'Strong opioid pain medication delivered via skin patch.' },
  { category: 'Pain Relief', genericName: 'Meloxicam', brandName: 'Mobic', form: 'tablet', strength: '15mg', prescription: true, usage: 'Nonsteroidal anti-inflammatory drug (NSAID) for arthritis pain.' },
  { category: 'Pain Relief', genericName: 'Celecoxib', brandName: 'Celebrex', form: 'capsule', strength: '200mg', prescription: true, usage: 'NSAID used to treat osteoarthritis and rheumatoid arthritis.' },
  { category: 'Pain Relief', genericName: 'Morphine', brandName: 'MS Contin', form: 'tablet', strength: '15mg', prescription: true, usage: 'Used to manage severe acute or chronic pain.' },
  { category: 'Pain Relief', genericName: 'Methadone', brandName: 'Dolophine', form: 'tablet', strength: '10mg', prescription: true, usage: 'Used for pain management and drug detoxification.' },
  { category: 'Pain Relief', genericName: 'Buprenorphine', brandName: 'Subutex', form: 'tablet', strength: '8mg', prescription: true, usage: 'Used to treat opioid use disorder and acute pain.' },

  { category: 'Antibiotics', genericName: 'Clindamycin', brandName: 'Cleocin', form: 'capsule', strength: '150mg', prescription: true, usage: 'Treats serious infections caused by anaerobic bacteria.' },
  { category: 'Antibiotics', genericName: 'Doxycycline', brandName: 'Vibramycin', form: 'capsule', strength: '100mg', prescription: true, usage: 'Broad-spectrum antibiotic used to treat bacterial infections.' },
  { category: 'Antibiotics', genericName: 'Cephalexin', brandName: 'Keflex', form: 'capsule', strength: '500mg', prescription: true, usage: 'First-generation cephalosporin for skin and bone infections.' },
  { category: 'Antibiotics', genericName: 'Sulfamethoxazole', brandName: 'Bactrim', form: 'tablet', strength: '800mg', prescription: true, usage: 'Combination antibiotic used for urinary tract infections.' },
  { category: 'Antibiotics', genericName: 'Levofloxacin', brandName: 'Levaquin', form: 'tablet', strength: '500mg', prescription: true, usage: 'Fluoroquinolone antibiotic for respiratory infections.' },
  { category: 'Antibiotics', genericName: 'Erythromycin', brandName: 'E-Mycin', form: 'tablet', strength: '250mg', prescription: true, usage: 'Macrolide antibiotic for skin and respiratory infections.' },
  { category: 'Antibiotics', genericName: 'Clarithromycin', brandName: 'Biaxin', form: 'tablet', strength: '500mg', prescription: true, usage: 'Used to treat various respiratory and skin infections.' },
  { category: 'Antibiotics', genericName: 'Nitrofurantoin', brandName: 'Macrodantin', form: 'capsule', strength: '100mg', prescription: true, usage: 'Commonly used to treat and prevent urinary tract infections.' },
  { category: 'Antibiotics', genericName: 'Minocycline', brandName: 'Minocin', form: 'capsule', strength: '100mg', prescription: true, usage: 'Tetracycline antibiotic used for acne and other bacterial infections.' },

  { category: 'Cardiovascular', genericName: 'Simvastatin', brandName: 'Zocor', form: 'tablet', strength: '20mg', prescription: true, usage: 'Lower cholesterol and reduce risk of heart disease.' },
  { category: 'Cardiovascular', genericName: 'Pravastatin', brandName: 'Pravachol', form: 'tablet', strength: '40mg', prescription: true, usage: 'Statin medication to lower blood cholesterol.' },
  { category: 'Cardiovascular', genericName: 'Rosuvastatin', brandName: 'Crestor', form: 'tablet', strength: '10mg', prescription: true, usage: 'Statin medication to reduce cardiovascular risks.' },
  { category: 'Cardiovascular', genericName: 'Carvedilol', brandName: 'Coreg', form: 'tablet', strength: '12.5mg', prescription: true, usage: 'Beta-blocker for heart failure and hypertension.' },
  { category: 'Cardiovascular', genericName: 'Atenolol', brandName: 'Tenormin', form: 'tablet', strength: '50mg', prescription: true, usage: 'Beta-blocker to treat high blood pressure and angina.' },
  { category: 'Cardiovascular', genericName: 'Spironolactone', brandName: 'Aldactone', form: 'tablet', strength: '25mg', prescription: true, usage: 'Potassium-sparing diuretic for heart failure.' },
  { category: 'Cardiovascular', genericName: 'Clonidine', brandName: 'Catapres', form: 'tablet', strength: '0.1mg', prescription: true, usage: 'Centrally acting alpha-agonist for hypertension.' },
  { category: 'Cardiovascular', genericName: 'Hydralazine', brandName: 'Apresoline', form: 'tablet', strength: '25mg', prescription: true, usage: 'Vasodilator used to treat high blood pressure.' },
  { category: 'Cardiovascular', genericName: 'Furosemide', brandName: 'Lasix', form: 'tablet', strength: '40mg', prescription: true, usage: 'Loop diuretic used to treat edema and swelling.' },

  { category: 'Diabetes', genericName: 'Glipizide', brandName: 'Glucotrol', form: 'tablet', strength: '5mg', prescription: true, usage: 'Sulfonylurea medication to control blood sugar.' },
  { category: 'Diabetes', genericName: 'Glimepiride', brandName: 'Amaryl', form: 'tablet', strength: '4mg', prescription: true, usage: 'Used to lower blood sugar in type 2 diabetes.' },
  { category: 'Diabetes', genericName: 'Pioglitazone', brandName: 'Actos', form: 'tablet', strength: '15mg', prescription: true, usage: 'Thiazolidinedione medication for type 2 diabetes.' },
  { category: 'Diabetes', genericName: 'Sitagliptin', brandName: 'Januvia', form: 'tablet', strength: '100mg', prescription: true, usage: 'DPP-4 inhibitor to lower blood glucose.' },
  { category: 'Diabetes', genericName: 'Empagliflozin', brandName: 'Jardiance', form: 'tablet', strength: '10mg', prescription: true, usage: 'SGLT2 inhibitor to lower blood sugar and protect heart.' },
  { category: 'Diabetes', genericName: 'Liraglutide', brandName: 'Victoza', form: 'injection', strength: '1.8mg', prescription: true, usage: 'GLP-1 receptor agonist for blood sugar management.' },
  { category: 'Diabetes', genericName: 'Dulaglutide', brandName: 'Trulicity', form: 'injection', strength: '1.5mg', prescription: true, usage: 'Weekly injection for blood glucose control.' },
  { category: 'Diabetes', genericName: 'Acarbose', brandName: 'Precose', form: 'tablet', strength: '50mg', prescription: true, usage: 'Alpha-glucosidase inhibitor to prevent glucose spikes after meals.' },
  { category: 'Diabetes', genericName: 'Repaglinide', brandName: 'Prandin', form: 'tablet', strength: '1mg', prescription: true, usage: 'Meglitinide medication to stimulate insulin release.' },

  { category: 'Respiratory', genericName: 'Advair HFA', brandName: 'Fluticasone/Salmeterol', form: 'inhaler', strength: '115mcg', prescription: true, usage: 'Combination maintenance inhaler for asthma and COPD.' },
  { category: 'Respiratory', genericName: 'Symbicort', brandName: 'Budesonide/Formoterol', form: 'inhaler', strength: '160mcg', prescription: true, usage: 'Combination bronchodilator and steroid inhaler.' },
  { category: 'Respiratory', genericName: 'Flovent HFA', brandName: 'Fluticasone Propionate', form: 'inhaler', strength: '110mcg', prescription: true, usage: 'Inhaled corticosteroid for asthma prevention.' },
  { category: 'Respiratory', genericName: 'Spiriva', brandName: 'Tiotropium Bromide', form: 'inhaler', strength: '18mcg', prescription: true, usage: 'Anticholinergic bronchodilator for COPD.' },
  { category: 'Respiratory', genericName: 'Singulair', brandName: 'Montelukast', form: 'tablet', strength: '10mg', prescription: true, usage: 'Leukotriene receptor antagonist for asthma and allergies.' },
  { category: 'Respiratory', genericName: 'Xopenex', brandName: 'Levalbuterol', form: 'inhaler', strength: '45mcg', prescription: true, usage: 'Short-acting beta-agonist for quick asthma relief.' },
  { category: 'Respiratory', genericName: 'Breo Ellipta', brandName: 'Fluticasone/Vilanterol', form: 'inhaler', strength: '100mcg', prescription: true, usage: 'Inhaled steroid and long-acting bronchodilator.' },
  { category: 'Respiratory', genericName: 'Anoro Ellipta', brandName: 'Umeclidinium/Vilanterol', form: 'inhaler', strength: '62.5mcg', prescription: true, usage: 'Dual bronchodilator inhaler for COPD.' },
  { category: 'Respiratory', genericName: 'Pulmicort Flexhaler', brandName: 'Budesonide', form: 'inhaler', strength: '90mcg', prescription: true, usage: 'Preventative corticosteroid inhaler for asthma.' },

  { category: 'Gastrointestinal', genericName: 'Esomeprazole', brandName: 'Nexium', form: 'capsule', strength: '40mg', prescription: false, usage: 'Proton pump inhibitor for acid reflux.' },
  { category: 'Gastrointestinal', genericName: 'Lansoprazole', brandName: 'Prevacid', form: 'capsule', strength: '30mg', prescription: false, usage: 'PPI for treating GERD and stomach ulcers.' },
  { category: 'Gastrointestinal', genericName: 'Rabeprazole', brandName: 'Aciphex', form: 'tablet', strength: '20mg', prescription: true, usage: 'PPI to reduce stomach acid secretion.' },
  { category: 'Gastrointestinal', genericName: 'Famotidine', brandName: 'Pepcid', form: 'tablet', strength: '20mg', prescription: false, usage: 'H2-receptor antagonist for heartburn relief.' },
  { category: 'Gastrointestinal', genericName: 'Ranitidine', brandName: 'Zantac 360', form: 'tablet', strength: '150mg', prescription: false, usage: 'Heartburn preventative medication.' },
  { category: 'Gastrointestinal', genericName: 'Dicyclomine', brandName: 'Bentyl', form: 'tablet', strength: '20mg', prescription: true, usage: 'Antispasmodic for irritable bowel syndrome.' },
  { category: 'Gastrointestinal', genericName: 'Metoclopramide', brandName: 'Reglan', form: 'tablet', strength: '10mg', prescription: true, usage: 'Prokinetic agent for gastroparesis and reflux.' },
  { category: 'Gastrointestinal', genericName: 'Ondansetron', brandName: 'Zofran', form: 'tablet', strength: '8mg', prescription: true, usage: 'Anti-emetic to prevent nausea and vomiting.' },
  { category: 'Gastrointestinal', genericName: 'Sucralfate', brandName: 'Carafate', form: 'tablet', strength: '1g', prescription: true, usage: 'Creates a protective barrier to heal active duodenal ulcers.' },

  { category: 'Mental Health', genericName: 'Escitalopram', brandName: 'Lexapro', form: 'tablet', strength: '10mg', prescription: true, usage: 'SSRI antidepressant for depression and anxiety.' },
  { category: 'Mental Health', genericName: 'Citalopram', brandName: 'Celexa', form: 'tablet', strength: '20mg', prescription: true, usage: 'SSRI used to treat major depressive disorder.' },
  { category: 'Mental Health', genericName: 'Duloxetine', brandName: 'Cymbalta', form: 'capsule', strength: '60mg', prescription: true, usage: 'SNRI for depression, anxiety, and fibromyalgia.' },
  { category: 'Mental Health', genericName: 'Venlafaxine', brandName: 'Effexor XR', form: 'capsule', strength: '75mg', prescription: true, usage: 'SNRI antidepressant and anxiety treatment.' },
  { category: 'Mental Health', genericName: 'Bupropion', brandName: 'Wellbutrin XL', form: 'tablet', strength: '150mg', prescription: true, usage: 'Atypical antidepressant and smoking cessation aid.' },
  { category: 'Mental Health', genericName: 'Amitriptyline', brandName: 'Elavil', form: 'tablet', strength: '25mg', prescription: true, usage: 'Tricyclic antidepressant often used for nerve pain.' },
  { category: 'Mental Health', genericName: 'Aripiprazole', brandName: 'Abilify', form: 'tablet', strength: '5mg', prescription: true, usage: 'Atypical antipsychotic for schizophrenia and bipolar.' },
  { category: 'Mental Health', genericName: 'Quetiapine', brandName: 'Seroquel', form: 'tablet', strength: '100mg', prescription: true, usage: 'Atypical antipsychotic and sleep aid.' },
  { category: 'Mental Health', genericName: 'Risperidone', brandName: 'Risperdal', form: 'tablet', strength: '2mg', prescription: true, usage: 'Used to treat schizophrenia and irritability in autism.' },

  { category: 'Allergy', genericName: 'Fexofenadine', brandName: 'Allegra', form: 'tablet', strength: '180mg', prescription: false, usage: 'Non-drowsy antihistamine for seasonal allergy relief.' },
  { category: 'Allergy', genericName: 'Levocetirizine', brandName: 'Xyzal', form: 'tablet', strength: '5mg', prescription: false, usage: 'Antihistamine for hives and allergy symptoms.' },
  { category: 'Allergy', genericName: 'Desloratadine', brandName: 'Clarinex', form: 'tablet', strength: '5mg', prescription: true, usage: 'Long-acting antihistamine for indoor and outdoor allergies.' },
  { category: 'Allergy', genericName: 'Fluticasone propionate', brandName: 'Flonase', form: 'drops', strength: '50mcg', prescription: false, usage: 'Glucocorticoid nasal spray for allergy congestion.' },
  { category: 'Allergy', genericName: 'Triamcinolone nasal', brandName: 'Nasacort', form: 'drops', strength: '55mcg', prescription: false, usage: '24-hour allergy nasal congestion spray.' },
  { category: 'Allergy', genericName: 'Azelastine', brandName: 'Astelin', form: 'drops', strength: '137mcg', prescription: true, usage: 'Antihistamine nasal spray for rhinitis.' },
  { category: 'Allergy', genericName: 'Olopatadine', brandName: 'Patanol', form: 'drops', strength: '0.1%', prescription: true, usage: 'Antihistamine eye drops for allergic conjunctivitis.' },
  { category: 'Allergy', genericName: 'Hydroxyzine', brandName: 'Atarax', form: 'tablet', strength: '25mg', prescription: true, usage: 'Antihistamine used for itching and acute anxiety.' },
  { category: 'Allergy', genericName: 'Promethazine', brandName: 'Phenergan', form: 'tablet', strength: '25mg', prescription: true, usage: 'Antihistamine for motion sickness and nausea.' },

  { category: 'Vitamins & Supplements', genericName: 'Folic Acid', brandName: 'Folvite', form: 'tablet', strength: '1mg', prescription: false, usage: 'Essential B-vitamin for red blood cells and pregnancy support.' },
  { category: 'Vitamins & Supplements', genericName: 'Vitamin B12', brandName: 'Cobal', form: 'tablet', strength: '1000mcg', prescription: false, usage: 'Supports nerve function, cellular energy and DNA synthesis.' },
  { category: 'Vitamins & Supplements', genericName: 'Calcium Citrate', brandName: 'Citracal', form: 'tablet', strength: '315mg', prescription: false, usage: 'Calcium supplement to support strong bones.' },
  { category: 'Vitamins & Supplements', genericName: 'Zinc Gluconate', brandName: 'Zinc-50', form: 'tablet', strength: '50mg', prescription: false, usage: 'Mineral supplement supporting immune function.' },
  { category: 'Vitamins & Supplements', genericName: 'Magnesium Oxide', brandName: 'Mag-Ox', form: 'tablet', strength: '400mg', prescription: false, usage: 'Mineral supplement for magnesium deficiency.' },
  { category: 'Vitamins & Supplements', genericName: 'Coenzyme Q10', brandName: 'CoQ10', form: 'capsule', strength: '100mg', prescription: false, usage: 'Antioxidant that supports cell energy production.' },
  { category: 'Vitamins & Supplements', genericName: 'Omega-3 Fish Oil', brandName: 'Fish Oil-1000', form: 'capsule', strength: '1000mg', prescription: false, usage: 'Supports cardiovascular and joint health.' },
  { category: 'Vitamins & Supplements', genericName: 'Biotin', brandName: 'Biotin-5000', form: 'capsule', strength: '5000mcg', prescription: false, usage: 'B-vitamin supporting hair, skin, and nail health.' },
  { category: 'Vitamins & Supplements', genericName: 'Vitamin E', brandName: 'E-400', form: 'capsule', strength: '400 IU', prescription: false, usage: 'Antioxidant supporting cellular health.' },

  { category: 'Skin Care', genericName: 'Mupirocin', brandName: 'Bactroban', form: 'ointment', strength: '2%', prescription: true, usage: 'Topical antibiotic ointment for skin infections.' },
  { category: 'Skin Care', genericName: 'Ketoconazole topical', brandName: 'Nizoral', form: 'cream', strength: '2%', prescription: true, usage: 'Topical antifungal cream for athlete\'s foot and ringworm.' },
  { category: 'Skin Care', genericName: 'Triamcinolone topical', brandName: 'Kenalog', form: 'cream', strength: '0.1%', prescription: true, usage: 'Corticosteroid cream for skin rash and inflammation.' },
  { category: 'Skin Care', genericName: 'Clobetasol', brandName: 'Temovate', form: 'cream', strength: '0.05%', prescription: true, usage: 'Super-high potency steroid for psoriasis and eczema.' },
  { category: 'Skin Care', genericName: 'Betamethasone', brandName: 'Diprolene', form: 'ointment', strength: '0.05%', prescription: true, usage: 'High-potency steroid for skin inflammation.' },
  { category: 'Skin Care', genericName: 'Hydrocortisone topical', brandName: 'Cortizone-10', form: 'cream', strength: '1%', prescription: false, usage: 'Low-potency topical steroid for itchy skin.' },
  { category: 'Skin Care', genericName: 'Adapalene', brandName: 'Differin', form: 'gel', strength: '0.1%', prescription: false, usage: 'Topical retinoid gel used to treat acne.' },
  { category: 'Skin Care', genericName: 'Benzoyl Peroxide', brandName: 'PanOxyl', form: 'gel', strength: '5%', prescription: false, usage: 'Antibacterial acne cream.' },
  { category: 'Skin Care', genericName: 'Tacrolimus topical', brandName: 'Protopic', form: 'ointment', strength: '0.1%', prescription: true, usage: 'Immunomodulator for moderate to severe eczema.' },

  { category: 'Hormonal', genericName: 'Levothyroxine', brandName: 'Synthroid', form: 'tablet', strength: '75mcg', prescription: true, usage: 'Thyroid hormone replacement for hypothyroidism.' },
  { category: 'Hormonal', genericName: 'Liothyronine', brandName: 'Cytomel', form: 'tablet', strength: '25mcg', prescription: true, usage: 'T3 thyroid hormone replacement.' },
  { category: 'Hormonal', genericName: 'Progesterone', brandName: 'Prometrium', form: 'capsule', strength: '200mg', prescription: true, usage: 'Progesterone hormone replacement therapy.' },
  { category: 'Hormonal', genericName: 'Estradiol', brandName: 'Estrace', form: 'tablet', strength: '1mg', prescription: true, usage: 'Estrogen replacement therapy for menopause.' },
  { category: 'Hormonal', genericName: 'Testosterone', brandName: 'AndroGel', form: 'gel', strength: '1.62%', prescription: true, usage: 'Androgen replacement therapy for hypogonadism.' },
  { category: 'Hormonal', genericName: 'Alendronate', brandName: 'Fosamax', form: 'tablet', strength: '70mg', prescription: true, usage: 'Bisphosphonate for osteoporosis prevention.' },
  { category: 'Hormonal', genericName: 'Raloxifene', brandName: 'Evista', form: 'tablet', strength: '60mg', prescription: true, usage: 'Estrogen modulator for osteoporosis and breast cancer risk reduction.' },
  { category: 'Hormonal', genericName: 'Finasteride', brandName: 'Proscar', form: 'tablet', strength: '5mg', prescription: true, usage: '5-alpha reductase inhibitor for enlarged prostate.' },
  { category: 'Hormonal', genericName: 'Dutasteride', brandName: 'Avodart', form: 'capsule', strength: '0.5mg', prescription: true, usage: 'Treats enlarged prostate symptoms.' },

  { category: 'Anti-viral', genericName: 'Valacyclovir', brandName: 'Valtrex', form: 'tablet', strength: '500mg', prescription: true, usage: 'Treats herpes virus infections, shingles, and cold sores.' },
  { category: 'Anti-viral', genericName: 'Acyclovir', brandName: 'Zovirax', form: 'tablet', strength: '400mg', prescription: true, usage: 'Antiviral for chickenpox, shingles, and herpes simplex.' },
  { category: 'Anti-viral', genericName: 'Oseltamivir', brandName: 'Tamiflu', form: 'capsule', strength: '75mg', prescription: true, usage: 'Treats and prevents influenza (flu).' },
  { category: 'Anti-viral', genericName: 'Tenofovir', brandName: 'Viread', form: 'tablet', strength: '300mg', prescription: true, usage: 'Treats chronic hepatitis B and HIV-1.' },
  { category: 'Anti-viral', genericName: 'Emtricitabine', brandName: 'Emtriva', form: 'capsule', strength: '200mg', prescription: true, usage: 'Nucleoside reverse transcriptase inhibitor for HIV.' },
  { category: 'Anti-viral', genericName: 'Sofosbuvir', brandName: 'Sovaldi', form: 'tablet', strength: '400mg', prescription: true, usage: 'Direct-acting antiviral for chronic Hepatitis C.' },
  { category: 'Anti-viral', genericName: 'Ribavirin', brandName: 'Copegus', form: 'tablet', strength: '200mg', prescription: true, usage: 'Used in combination to treat chronic Hepatitis C.' },
  { category: 'Anti-viral', genericName: 'Abacavir', brandName: 'Ziagen', form: 'tablet', strength: '300mg', prescription: true, usage: 'Antiviral agent for HIV-1 infection.' },
  { category: 'Anti-viral', genericName: 'Lamivudine', brandName: 'Epivir', form: 'tablet', strength: '150mg', prescription: true, usage: 'Used to treat HIV and chronic Hepatitis B.' },
  { category: 'Anti-viral', genericName: 'Famciclovir', brandName: 'Famvir', form: 'tablet', strength: '500mg', prescription: true, usage: 'Treats shingles, herpes simplex, and cold sores.' }
];

const seedAdditionalMedicines = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding 100+ medicines...');

    // Fetch existing categories and manufacturers
    const categories = await Category.find({});
    const manufacturers = await Manufacturer.find({});

    if (categories.length === 0 || manufacturers.length === 0) {
      console.error('Error: Please run primary seed script first to populate categories and manufacturers.');
      process.exit(1);
    }

    const categoryMap = {};
    categories.forEach(c => { categoryMap[c.name] = c._id; });

    let addedCount = 0;

    for (const t of drugTemplates) {
      // Find category ID
      const categoryId = categoryMap[t.category];
      if (!categoryId) continue;

      // Select random manufacturer
      const randMfg = manufacturers[Math.floor(Math.random() * manufacturers.length)];

      // Check if medicine already exists by name or generic name
      const exists = await Medicine.findOne({ name: t.genericName });
      if (exists) {
        console.log(`Skipped existing: ${t.genericName}`);
        continue;
      }

      const desc = `${t.genericName} (${t.brandName || ''}) is a ${t.form || 'tablet'} formulation. ${t.usage} Indicated for professional management under standard healthcare precautions.`;

      // Create new medicine record
      await Medicine.create({
        name: t.genericName,
        genericName: t.genericName,
        brandName: t.brandName || '',
        description: desc,
        category: categoryId,
        manufacturer: randMfg._id,
        dosageForm: t.form || 'tablet',
        strength: t.strength || '',
        activeIngredients: [t.genericName],
        usage: t.usage,
        prescriptionRequired: t.prescription,
        price: parseFloat((Math.random() * (85 - 5) + 5).toFixed(2)),
        image: getMedicineImage(t.genericName, t.form || 'tablet'),
        viewCount: Math.floor(Math.random() * 800) + 10,
        searchCount: Math.floor(Math.random() * 200) + 5,
        isActive: true
      });

      // Update category medicine count
      await Category.findByIdAndUpdate(categoryId, { $inc: { medicineCount: 1 } });
      addedCount++;
    }

    console.log(`\n🎉 Success! Added ${addedCount} new unique medicines.`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding additional medicines:', error);
    process.exit(1);
  }
};

seedAdditionalMedicines();
