# ============================================================
#   ClimateGuard AI — Day 5 (REBUILT)
#   We fix the overfitting problem and build a honest model
#   Key lesson: 100% accuracy = something is wrong!
# ============================================================

import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import pickle
from sklearn.tree import DecisionTreeClassifier, plot_tree
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix

# ============================================================
# STEP 1 — Load data and check what risk levels exist
# ============================================================

df = pd.read_csv("climategaurd_ml_ready.csv")

print("✅ Data loaded!")
print(f"Total examples: {len(df):,}")
print(f"\nRisk levels in YOUR data:")
print(df["risk_level"].value_counts())

# ============================================================
# STEP 2 — Rebuild the target using RAW columns
# ============================================================

# WHY WE REBUILD:
# Our original risk_encoded was created FROM intensity_encoded
# So the model just learned: "intensity_encoded=2 → risk=2"
# That is not real learning — it is cheating!
# We need to create risk from RAW measurements only
# brightness and frp are the honest raw satellite readings

print("\n=== REBUILDING HONEST TARGET LABEL ===")

# Load the clean data which has raw brightness and frp
df_raw = pd.read_csv("climategaurd_clean.csv")
df_raw["acq_date"] = pd.to_datetime(df_raw["acq_date"])
df_raw["month"] = df_raw["acq_date"].dt.month

# Remove outliers same as before
def remove_outliers(dataframe, column):
    Q1 = dataframe[column].quantile(0.25)
    Q3 = dataframe[column].quantile(0.75)
    IQR = Q3 - Q1
    return dataframe[
        (dataframe[column] >= Q1 - 1.5 * IQR) &
        (dataframe[column] <= Q3 + 1.5 * IQR)
    ]

df_raw = remove_outliers(df_raw, "brightness")
df_raw = remove_outliers(df_raw, "frp")
df_raw = df_raw.drop_duplicates()

print(f"Clean examples available: {len(df_raw):,}")

# ============================================================
# STEP 3 — Create season features
# ============================================================

def get_season(month):
    if month in [12, 1, 2]:   return 0  # Winter
    elif month in [3, 4, 5]:  return 1  # Summer
    elif month in [6, 7, 8, 9]: return 2  # Monsoon
    else:                      return 3  # PostMonsoon

df_raw["season_encoded"] = df_raw["month"].apply(get_season)
df_raw["is_dry_season"]  = df_raw["season_encoded"].isin([1, 3]).astype(int)

# ============================================================
# STEP 4 — Create HONEST target using ONLY raw measurements
# ============================================================

# brightness percentiles — divide into thirds
b33 = df_raw["brightness"].quantile(0.33)
b66 = df_raw["brightness"].quantile(0.66)

# frp percentiles
f33 = df_raw["frp"].quantile(0.33)
f66 = df_raw["frp"].quantile(0.66)

print(f"\nBrightness thresholds: low<{b33:.1f}  medium<{b66:.1f}  high>={b66:.1f}")
print(f"FRP thresholds:        low<{f33:.1f}   medium<{f66:.1f}   high>={f66:.1f}")

def honest_risk(row):
    # Score based purely on raw satellite measurements
    score = 0

    # Brightness score (0, 1, or 2)
    if row["brightness"] >= b66:
        score += 2
    elif row["brightness"] >= b33:
        score += 1

    # FRP score (0, 1, or 2)
    if row["frp"] >= f66:
        score += 2
    elif row["frp"] >= f33:
        score += 1

    # Dry season bonus
    if row["is_dry_season"] == 1:
        score += 1

    # Convert score to risk level
    if score >= 4:    return 2  # High
    elif score >= 2:  return 1  # Medium
    else:             return 0  # Low

df_raw["risk_encoded"] = df_raw.apply(honest_risk, axis=1)

print(f"\nNew honest risk distribution:")
counts = df_raw["risk_encoded"].value_counts().sort_index()
labels = {0:"Low", 1:"Medium", 2:"High"}
for code, count in counts.items():
    pct = count / len(df_raw) * 100
    bar = "█" * int(pct / 2)
    print(f"  {labels[code]:6} ({code}): {count:6,}  {bar} {pct:.1f}%")

# ============================================================
# STEP 5 — Normalize features
# ============================================================

for col in ["brightness", "frp", "latitude", "longitude"]:
    mn = df_raw[col].min()
    mx = df_raw[col].max()
    df_raw[col + "_norm"] = (df_raw[col] - mn) / (mx - mn)

# ============================================================
# STEP 6 — Define HONEST features (no encoded risk columns!)
# ============================================================

# KEY LESSON: We only use RAW or TIME features as inputs
# We do NOT use intensity_encoded or frp_encoded
# because those were derived from the same logic as risk
# Using them = the model cheats by looking at the answer

FEATURES = [
    "brightness_norm",   # raw fire temperature
    "frp_norm",          # raw fire power
    "month",             # time of year
    "season_encoded",    # which season
    "is_dry_season",     # dry or wet
    "latitude_norm",     # location
    "longitude_norm",    # location
]

TARGET = "risk_encoded"

X = df_raw[FEATURES]
y = df_raw[TARGET]

print(f"\n✅ Honest features: {FEATURES}")
print(f"   No derived/encoded risk features used!")

# ============================================================
# STEP 7 — Train / Test Split
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
# stratify=y ensures each risk level is equally represented
# in both train and test sets

print(f"\n=== TRAIN / TEST SPLIT ===")
print(f"Training: {len(X_train):,}  |  Testing: {len(X_test):,}")

# ============================================================
# STEP 8 — Train Decision Tree with honest depth limits
# ============================================================

print(f"\n=== TRAINING DECISION TREE ===")

model = DecisionTreeClassifier(
    max_depth=8,        # deeper = more complex patterns
    min_samples_leaf=20,# each leaf needs at least 20 examples
    random_state=42
)

model.fit(X_train, y_train)
print(f"✅ Training complete!")

# ============================================================
# STEP 9 — Evaluate honestly
# ============================================================

y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"\n=== HONEST MODEL ACCURACY ===")
print(f"Accuracy: {accuracy*100:.2f}%")

if accuracy >= 0.85:
    print(f"🏆 Excellent! This is genuinely strong.")
elif accuracy >= 0.75:
    print(f"✅ Good — solid real-world performance.")
elif accuracy >= 0.65:
    print(f"⚠️  Okay — we improve this tomorrow with Random Forest.")
else:
    print(f"📚 Learning opportunity — Random Forest will fix this tomorrow!")

# Confusion matrix — handle however many classes exist
cm = confusion_matrix(y_test, y_pred)
existing_classes = sorted(y.unique())
existing_labels  = [labels[c] for c in existing_classes]

print(f"\n=== CONFUSION MATRIX ===")
header = "        " + "  ".join(f"{l:6}" for l in existing_labels)
print(f"           Predicted →")
print(header)
for i, row_label in enumerate(existing_labels):
    print(f"Actual {row_label:6}: {cm[i]}")

print(f"\nDiagonal (correct):")
for i, lbl in enumerate(existing_labels):
    print(f"  {lbl:6} correct: {cm[i][i]:,}")

# ============================================================
# STEP 10 — Feature Importance
# ============================================================

importances = model.feature_importances_
fi_df = pd.DataFrame({
    "feature": FEATURES,
    "importance": importances
}).sort_values("importance", ascending=False)

print(f"\n=== FEATURE IMPORTANCE ===")
for _, row in fi_df.iterrows():
    bar = "█" * int(row["importance"] * 40)
    print(f"  {row['feature']:20} {bar} {row['importance']:.4f}")

# ============================================================
# STEP 11 — Predict a brand new fire event
# ============================================================

print(f"\n=== PREDICTING A NEW FIRE EVENT ===")
print(f"Scenario: Very hot fire in April (dry season), central India")

new_fire = pd.DataFrame([{
    "brightness_norm": 0.80,
    "frp_norm":        0.75,
    "month":           4,
    "season_encoded":  1,
    "is_dry_season":   1,
    "latitude_norm":   0.50,
    "longitude_norm":  0.50,
}])

prediction   = model.predict(new_fire)[0]
probability  = model.predict_proba(new_fire)[0]
classes      = model.classes_

print(f"\n🔥 Prediction: {labels[prediction].upper()} RISK")
print(f"\nConfidence breakdown:")
for cls, prob in zip(classes, probability):
    bar = "█" * int(prob * 30)
    print(f"  {labels[cls]:6}: {bar} {prob*100:.1f}%")

# ============================================================
# STEP 12 — CHARTS
# ============================================================

fig, axes = plt.subplots(1, 3, figsize=(18, 6))
fig.suptitle("ClimateGuard AI — Day 5: Honest Decision Tree",
             fontsize=14, fontweight="bold")

# Chart 1: Confusion matrix
im = axes[0].imshow(cm, cmap="Blues")
axes[0].set_title(f"Confusion Matrix\nAccuracy: {accuracy*100:.1f}%")
axes[0].set_xlabel("Predicted")
axes[0].set_ylabel("Actual")
axes[0].set_xticks(range(len(existing_labels)))
axes[0].set_yticks(range(len(existing_labels)))
axes[0].set_xticklabels(existing_labels)
axes[0].set_yticklabels(existing_labels)
for i in range(len(existing_labels)):
    for j in range(len(existing_labels)):
        axes[0].text(j, i, str(cm[i][j]),
                    ha="center", va="center", fontsize=11, fontweight="bold",
                    color="white" if cm[i][j] > cm.max()/2 else "black")
plt.colorbar(im, ax=axes[0])

# Chart 2: Feature importance
colors = ["#e74c3c","#e67e22","#f1c40f","#2ecc71","#3498db","#9b59b6","#1abc9c"]
axes[1].barh(fi_df["feature"], fi_df["importance"], color=colors[:len(fi_df)])
axes[1].set_title("Feature Importance\n(what the model uses most)")
axes[1].set_xlabel("Importance Score")
axes[1].invert_yaxis()

# Chart 3: Decision Tree top 3 levels
plot_tree(
    model,
    max_depth=3,
    feature_names=FEATURES,
    class_names=existing_labels,
    filled=True,
    fontsize=6,
    ax=axes[2]
)
axes[2].set_title("Decision Tree (top 3 levels)")

plt.tight_layout()
plt.show()

# ============================================================
# STEP 13 — Save the honest model
# ============================================================

with open("climategaurd_model.pkl", "wb") as f:
    pickle.dump(model, f)

print(f"\n✅ Honest model saved: climategaurd_model.pkl")
print(f"\n{'='*55}")
print(f"🎉 Day 5 Complete — with a genuinely honest model!")
print(f"{'='*55}")
print(f"\nKey lesson learned today:")
print(f"  100% accuracy = model is CHEATING, not learning")
print(f"  Real accuracy = model tested on data it never saw")
print(f"  Honest features = no columns derived from the answer")
print(f"\nTomorrow Day 6: Random Forest — 100 trees voting!")
print(f"  Your accuracy will improve significantly.")