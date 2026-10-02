# ============================================================
#   ClimateGuard AI — Day 6
#   Random Forest + making the problem genuinely challenging
#   Key lesson: Random Forest vs Decision Tree comparison
# ============================================================

import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import pickle
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

# ============================================================
# STEP 1 — Load clean data and rebuild with NOISE
# ============================================================

df = pd.read_csv("climategaurd_clean.csv")
df["acq_date"] = pd.to_datetime(df["acq_date"])
df["month"] = df["acq_date"].dt.month

# Remove outliers
def remove_outliers(dataframe, column):
    Q1 = dataframe[column].quantile(0.25)
    Q3 = dataframe[column].quantile(0.75)
    IQR = Q3 - Q1
    return dataframe[
        (dataframe[column] >= Q1 - 1.5 * IQR) &
        (dataframe[column] <= Q3 + 1.5 * IQR)
    ]

df = remove_outliers(df, "brightness")
df = remove_outliers(df, "frp")
df = df.drop_duplicates().reset_index(drop=True)

print(f"✅ Data loaded: {len(df):,} examples")

# ============================================================
# STEP 2 — Add realistic noise to simulate real world
# ============================================================

# In the real world, satellite sensors have measurement errors
# Wind can carry fire heat beyond the actual fire location
# Humidity affects brightness readings
# We add small random noise to make prediction genuinely hard

np.random.seed(42)

# Add ±2% noise to brightness (sensor measurement error)
noise_brightness = np.random.normal(0, df["brightness"].std() * 0.02, len(df))
df["brightness"] = df["brightness"] + noise_brightness

# Add ±5% noise to frp (fire power varies with wind)
noise_frp = np.random.normal(0, df["frp"].std() * 0.05, len(df))
df["frp"] = df["frp"] + noise_frp

print(f"✅ Realistic sensor noise added")

# ============================================================
# STEP 3 — Create features
# ============================================================

def get_season(month):
    if month in [12, 1, 2]:     return 0  # Winter
    elif month in [3, 4, 5]:    return 1  # Summer
    elif month in [6, 7, 8, 9]: return 2  # Monsoon
    else:                        return 3  # PostMonsoon

df["season_encoded"] = df["month"].apply(get_season)
df["is_dry_season"]  = df["season_encoded"].isin([1, 3]).astype(int)

# NEW features that add real predictive complexity
# Day of year (1-365) captures seasonal transitions better than month
df["day_of_year"] = df["acq_date"].dt.dayofyear

# Brightness x FRP interaction — combined fire energy
df["fire_energy"] = df["brightness"] * df["frp"]

# Normalize all numeric features
for col in ["brightness", "frp", "latitude", "longitude",
            "day_of_year", "fire_energy"]:
    mn = df[col].min()
    mx = df[col].max()
    df[col + "_norm"] = (df[col] - mn) / (mx - mn)

print(f"✅ Features created")

# ============================================================
# STEP 4 — Create GENUINELY CHALLENGING risk labels
# ============================================================

# Use fire_energy (brightness x frp combined) as primary signal
# Add season as a modifier — same fire energy = higher risk in dry season
# This creates genuinely overlapping boundaries = harder to predict

e33 = df["fire_energy"].quantile(0.33)
e66 = df["fire_energy"].quantile(0.66)
e85 = df["fire_energy"].quantile(0.85)

def challenging_risk(row):
    energy = row["fire_energy"]
    dry    = row["is_dry_season"]
    month  = row["month"]

    # Base risk from energy
    if energy >= e85:
        base = 2       # High
    elif energy >= e66:
        base = 2 if dry else 1   # High in dry, Medium in wet
    elif energy >= e33:
        base = 1       # Medium
    else:
        base = 1 if (dry and month in [3,4,5]) else 0  # Medium in peak summer else Low

    return base

df["risk_encoded"] = df.apply(challenging_risk, axis=1)

print(f"\n=== RISK DISTRIBUTION ===")
counts = df["risk_encoded"].value_counts().sort_index()
labels_map = {0:"Low", 1:"Medium", 2:"High"}
for code, count in counts.items():
    pct = count / len(df) * 100
    bar = "█" * int(pct / 2)
    print(f"  {labels_map[code]:6} ({code}): {count:6,}  {bar} {pct:.1f}%")

# ============================================================
# STEP 5 — Final features for ML
# ============================================================

FEATURES = [
    "brightness_norm",
    "frp_norm",
    "fire_energy_norm",    # NEW — combined energy signal
    "day_of_year_norm",    # NEW — captures seasonal transitions
    "month",
    "season_encoded",
    "is_dry_season",
    "latitude_norm",
    "longitude_norm",
]

X = df[FEATURES]
y = df["risk_encoded"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"\nTraining: {len(X_train):,}  |  Testing: {len(X_test):,}")

# ============================================================
# STEP 6 — Train Decision Tree (our baseline)
# ============================================================

print(f"\n=== MODEL 1: DECISION TREE (baseline) ===")

dt_model = DecisionTreeClassifier(max_depth=8, random_state=42)
dt_model.fit(X_train, y_train)
dt_pred = dt_model.predict(X_test)
dt_acc  = accuracy_score(y_test, dt_pred)

print(f"Decision Tree Accuracy: {dt_acc*100:.2f}%")

# ============================================================
# STEP 7 — Train Random Forest (the upgrade)
# ============================================================

# Random Forest = 100 Decision Trees trained on random subsets
# Each tree sees different random rows and random features
# Final answer = majority vote of all 100 trees
# More trees = less chance that any single mistake dominates

print(f"\n=== MODEL 2: RANDOM FOREST (100 trees) ===")

rf_model = RandomForestClassifier(
    n_estimators=100,    # 100 decision trees
    max_depth=10,        # each tree can go 10 levels deep
    min_samples_leaf=5,  # each leaf needs 5+ examples
    random_state=42,
    n_jobs=-1            # use all CPU cores for speed
)

print(f"Training 100 trees on {len(X_train):,} examples...")
rf_model.fit(X_train, y_train)
rf_pred = rf_model.predict(X_test)
rf_acc  = accuracy_score(y_test, rf_pred)

print(f"Random Forest Accuracy: {rf_acc*100:.2f}%")
print(f"Improvement over Decision Tree: +{(rf_acc - dt_acc)*100:.2f}%")

# ============================================================
# STEP 8 — Cross Validation (the most honest accuracy)
# ============================================================

# Cross validation splits data into 5 groups
# Trains 5 times — each time a different group is the test set
# Averages all 5 accuracy scores
# This gives the most reliable accuracy estimate

print(f"\n=== CROSS VALIDATION (5-fold) ===")
cv_scores = cross_val_score(rf_model, X, y, cv=5, scoring="accuracy")
print(f"5 fold scores: {[f'{s*100:.1f}%' for s in cv_scores]}")
print(f"Average:       {cv_scores.mean()*100:.2f}%")
print(f"Std deviation: ±{cv_scores.std()*100:.2f}%")
print(f"(Lower std = more consistent = better model)")

# ============================================================
# STEP 9 — Detailed classification report
# ============================================================

existing_classes = sorted(y.unique())
existing_labels  = [labels_map[c] for c in existing_classes]

print(f"\n=== DETAILED PERFORMANCE REPORT ===")
print(classification_report(y_test, rf_pred,
                             labels=existing_classes,
                             target_names=existing_labels))

# ============================================================
# STEP 10 — Feature importance from Random Forest
# ============================================================

fi_df = pd.DataFrame({
    "feature":    FEATURES,
    "importance": rf_model.feature_importances_
}).sort_values("importance", ascending=False)

print(f"=== RANDOM FOREST FEATURE IMPORTANCE ===")
for _, row in fi_df.iterrows():
    bar = "█" * int(row["importance"] * 50)
    print(f"  {row['feature']:20} {bar} {row['importance']:.4f}")

# ============================================================
# STEP 11 — Predict new fire with confidence
# ============================================================

print(f"\n=== PREDICTING NEW FIRE SCENARIO ===")

new_fire = pd.DataFrame([{
    "brightness_norm":   0.72,
    "frp_norm":          0.68,
    "fire_energy_norm":  0.75,
    "day_of_year_norm":  0.25,   # April (peak fire season)
    "month":             4,
    "season_encoded":    1,
    "is_dry_season":     1,
    "latitude_norm":     0.50,
    "longitude_norm":    0.45,
}])

prediction  = rf_model.predict(new_fire)[0]
probability = rf_model.predict_proba(new_fire)[0]
classes     = rf_model.classes_

print(f"Scenario: Hot April fire, central India, dry season")
print(f"\n🔥 Random Forest Prediction: {labels_map[prediction].upper()} RISK")
print(f"\nAll 100 trees voted — here is the breakdown:")
for cls, prob in zip(classes, probability):
    bar = "█" * int(prob * 40)
    print(f"  {labels_map[cls]:6}: {bar} {prob*100:.1f}%")

# ============================================================
# STEP 12 — CHARTS
# ============================================================

fig, axes = plt.subplots(2, 2, figsize=(15, 11))
fig.suptitle("ClimateGuard AI — Day 6: Decision Tree vs Random Forest",
             fontsize=13, fontweight="bold")

# Chart 1: Accuracy comparison
models   = ["Decision Tree\n(1 tree)", "Random Forest\n(100 trees)"]
accs     = [dt_acc * 100, rf_acc * 100]
colors   = ["#e74c3c", "#2ecc71"]
bars = axes[0,0].bar(models, accs, color=colors, width=0.4)
axes[0,0].set_ylim(0, 110)
axes[0,0].set_title("Accuracy: Decision Tree vs Random Forest")
axes[0,0].set_ylabel("Accuracy (%)")
for bar, acc in zip(bars, accs):
    axes[0,0].text(bar.get_x() + bar.get_width()/2,
                   bar.get_height() + 1,
                   f"{acc:.1f}%", ha="center", fontweight="bold", fontsize=12)

# Chart 2: Confusion matrix for Random Forest
cm_rf = confusion_matrix(y_test, rf_pred, labels=existing_classes)
im = axes[0,1].imshow(cm_rf, cmap="Blues")
axes[0,1].set_title("Random Forest Confusion Matrix")
axes[0,1].set_xlabel("Predicted")
axes[0,1].set_ylabel("Actual")
axes[0,1].set_xticks(range(len(existing_labels)))
axes[0,1].set_yticks(range(len(existing_labels)))
axes[0,1].set_xticklabels(existing_labels)
axes[0,1].set_yticklabels(existing_labels)
for i in range(len(existing_labels)):
    for j in range(len(existing_labels)):
        axes[0,1].text(j, i, str(cm_rf[i][j]),
                       ha="center", va="center", fontsize=11, fontweight="bold",
                       color="white" if cm_rf[i][j] > cm_rf.max()/2 else "black")
plt.colorbar(im, ax=axes[0,1])

# Chart 3: Feature importance
bar_colors = ["#e74c3c","#e67e22","#f1c40f","#2ecc71",
              "#1abc9c","#3498db","#9b59b6","#95a5a6","#34495e"]
axes[1,0].barh(fi_df["feature"], fi_df["importance"],
               color=bar_colors[:len(fi_df)])
axes[1,0].set_title("Random Forest Feature Importance")
axes[1,0].set_xlabel("Importance Score")
axes[1,0].invert_yaxis()

# Chart 4: Cross validation scores
cv_x = [f"Fold {i+1}" for i in range(len(cv_scores))]
axes[1,1].bar(cv_x, cv_scores * 100, color="#3498db", alpha=0.8)
axes[1,1].axhline(y=cv_scores.mean()*100, color="red",
                   linestyle="--", linewidth=2, label=f"Average: {cv_scores.mean()*100:.1f}%")
axes[1,1].set_title("Cross Validation — 5 Fold Scores")
axes[1,1].set_ylabel("Accuracy (%)")
axes[1,1].set_ylim(0, 110)
axes[1,1].legend()
for i, score in enumerate(cv_scores):
    axes[1,1].text(i, score*100 + 1, f"{score*100:.1f}%",
                   ha="center", fontsize=9, fontweight="bold")

plt.tight_layout()
plt.show()

# ============================================================
# STEP 13 — Save the Random Forest model
# ============================================================

with open("climategaurd_model.pkl", "wb") as f:
    pickle.dump(rf_model, f)

# Save feature list too — needed by the web app in Week 3
import json
with open("climategaurd_features.json", "w") as f:
    json.dump(FEATURES, f)

print(f"\n✅ Random Forest model saved: climategaurd_model.pkl")
print(f"✅ Feature list saved:         climategaurd_features.json")

print(f"\n{'='*55}")
print(f"🎉 Day 6 Complete!")
print(f"{'='*55}")
print(f"\nWhat you learned today:")
print(f"  ✓ Why 100% accuracy means the problem is too easy")
print(f"  ✓ How noise makes ML problems genuinely hard")
print(f"  ✓ Random Forest = 100 trees voting together")
print(f"  ✓ Cross validation = most honest accuracy test")
print(f"  ✓ Classification report = precision + recall")
print(f"\nTomorrow Day 7: Tune the model + final ML evaluation!")
print(f"  Then Week 3 begins — we build the web app! 🌐")