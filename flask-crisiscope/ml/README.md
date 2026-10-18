# CRISISCOPE X — Machine Learning Architecture & Pipelines

This directory contains the supervised machine learning pipeline for binary inundation hazard classification.

## 1. Feature Schema & Definitions

| Feature Name | Type | Unit / Range | Physical Interpretation |
| :--- | :--- | :--- | :--- |
| `rainfallIntensityMmHr` | Float | 15 - 150 mm/hr | Instantaneous peak precipitation rate |
| `cumulativeRainfallMm` | Float | 20 - 400 mm | Total volume load accumulated over the storm duration |
| `elevationMeters` | Float | 860 - 940 m | Topographic elevation above sea level (Bengaluru basin) |
| `soilSaturationPct` | Float | 20 - 100 % | Antecedent moisture index impeding subsurface infiltration |
| `drainageMaintenanceScore` | Integer | 1 - 10 | Silt clearance score (higher = unobstructed culvert throughput) |

**Target Variable:** `historicalInundationAlert` (Binary: `0` = Nominal / Low Risk, `1` = High Inundation Hazard Alert)

## 2. Model Architecture
- **Algorithm:** Supervised Logistic Regression with L2 Regularization
- **Optimization:** Stochastic Gradient Descent / L-BFGS Cross-Entropy Minimization
- **Train/Test Separation:** 75% Training / 25% Held-Out Testing with stratification
- **Leakage Prevention:** Standardization scaler parameters $(\mu, \sigma)$ are fitted exclusively on the training split.

## 3. Training & Evaluation Commands

```bash
# Optional Python environment setup:
pip install pandas numpy scikit-learn

# Run reproducible model training:
python ml/training/train_model.py
```

## 4. Operational Boundaries & Honest Limitations
- **Synthetic Scope:** This model was trained on deterministically generated benchmark data.
- **Evaluation Notice:** Test accuracy and confusion matrix metrics demonstrate optimization correctness under simulated physics, and must **never** be cited as field accuracy for real-world unobserved municipal floods in Bengaluru.
