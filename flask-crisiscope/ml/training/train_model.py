"""
CRISISCOPE X — Supervised ML Training Pipeline (scikit-learn)
Model: Binary Inundation Risk Classifier
"""

import json
import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

def train_inundation_model(data_path="ml/data/synthetic_dataset.csv"):
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset fixture not found at {data_path}")

    df = pd.read_csv(data_path)
    feature_cols = [
        "rainfallIntensityMmHr",
        "cumulativeRainfallMm",
        "elevationMeters",
        "soilSaturationPct",
        "drainageMaintenanceScore",
    ]
    target_col = "historicalInundationAlert"

    X = df[feature_cols].values
    y = df[target_col].values

    # Reproducible 75% Train, 25% Test split (Deterministic seed 20260415)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=20260415, stratify=y
    )

    # Standard feature scaling
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Fit Logistic Regression
    clf = LogisticRegression(C=1.0, random_state=20260415, max_iter=200)
    clf.fit(X_train_scaled, y_train)

    # Evaluate on held-out test set
    y_pred = clf.predict(X_test_scaled)
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    cm = confusion_matrix(y_test, y_pred)

    results = {
        "model_type": "LogisticRegression (Supervised Inundation Risk Classifier)",
        "features": feature_cols,
        "sample_count_total": len(df),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "test_metrics": {
            "accuracy": float(round(acc, 4)),
            "precision": float(round(prec, 4)),
            "recall": float(round(rec, 4)),
            "f1_score": float(round(f1, 4)),
            "confusion_matrix": {
                "true_negatives": int(cm[0][0]),
                "false_positives": int(cm[0][1]),
                "false_negatives": int(cm[1][0]),
                "true_positives": int(cm[1][1]),
            },
        },
        "coefficients": {
            feature_cols[i]: float(round(clf.coef_[0][i], 4))
            for i in range(len(feature_cols))
        },
        "intercept": float(round(clf.intercept_[0], 4)),
        "provenance_notice": "Evaluated exclusively on synthetic demonstration fixtures. Not real Bengaluru observations.",
    }

    print("=== Supervised Model Evaluation Summary ===")
    print(json.dumps(results, indent=2))
    return results

if __name__ == "__main__":
    train_inundation_model()
