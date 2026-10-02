# ============================================================
#   ClimateGuard AI — Day 7
#   Goal: Hyperparameter tuning + final model evaluation
#   New skills: GridSearchCV, learning curves, model saving
#   This is the FINAL model — used in the web app Week 3
# ============================================================

import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import pickle
import json
import warnings
warnings.filterwarnings("ignore")

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import (train_test_split, cross_val_score,
                                     GridSearchCV, learning_curve)
from sklearn.metrics import (accuracy_score, confusion_matrix,
                             classification_report)

# ============================================================
# STEP 1 — Rebuild dataset (same as Day 6)
# ============================================================

df = pd.read_csv("climategaurd_clean.csv")
df["acq_date"] = pd.to_datetime(df["acq_date"])
df["month"]    = df["acq_date"].dt.month

def remove_outliers(dataframe, column):
    Q1  = dataframe[column].quantile(0.25)
    Q3  = dataframe[column].quantile(0.75)
    IQR = Q3 - Q1
    return dataframe[(dataframe[column] >= Q1 - 1.5*IQR) &
                     (dataframe[column] <= Q3 + 1.5*IQR)]

df = remove_outliers(df, "brightness")
df = remove_outliers(df, "frp")
df = df.drop_duplicates().reset_index(drop=True)

# Add noise
np.random.seed(42)
df["brightness"] += np.random.normal(0, df["brightness"].std()*0.02, len(df))
df["frp"]        += np.random.normal(0, df["frp"].std()*0.05, len(df))

# Features
def get_season(month):
    if month in [12,1,2]:      return 0
    elif month in [3,4,5]:     return 1
    elif month in [6,7,8,9]:   return 2
    else:                       return 3

df["season_encoded"] = df["month"].apply(get_season)
df["is_dry_season"]  = df["season_encoded"].isin([1,3]).astype(int)
df["day_of_year"]    = df["acq_date"].dt.dayofyear
df["fire_energy"]    = df["brightness"] * df["frp"]

for col in ["brightness","frp","latitude","longitude","day_of_year","fire_energy"]:
    mn = df[col].min(); mx = df[col].max()
    df[col+"_norm"] = (df[col] - mn) / (mx - mn)

# Risk labels
e33 = df["fire_energy"].quantile(0.33)
e66 = df["fire_energy"].quantile(0.66)
e85 = df["fire_energy"].quantile(0.85)

def challenging_risk(row):
    energy = row["fire_energy"]
    dry    = row["is_dry_season"]
    month  = row["month"]
    if energy >= e85:                              return 2
    elif energy >= e66:                            return 2 if dry else 1
    elif energy >= e33:                            return 1
    else: return 1 if (dry and month in [3,4,5]) else 0

df["risk_encoded"] = df.apply(challenging_risk, axis=1)

FEATURES = ["brightness_norm","frp_norm","fire_energy_norm",
            "day_of_year_norm","month","season_encoded",
            "is_dry_season","latitude_norm","longitude_norm"]
labels_map = {0:"Low", 1:"Medium", 2:"High"}

X = df[FEATURES]
y = df["risk_encoded"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)

print(f"✅ Data ready: {len(df):,} examples")
print(f"   Train: {len(X_train):,}  Test: {len(X_test):,}")

# ============================================================
# STEP 2 — What is Hyperparameter Tuning?
# ============================================================

# A hyperparameter = a setting you choose BEFORE training
# Examples:
#   n_estimators = how many trees (100? 200? 500?)
#   max_depth    = how deep each tree goes (5? 10? 20?)
#   min_samples_leaf = minimum examples per leaf (1? 5? 20?)

# GridSearchCV tries EVERY combination and finds the best one
# It is like trying every key on a keyring to find which opens the door

print(f"\n=== STEP 2: HYPERPARAMETER TUNING ===")
print(f"Testing different combinations of settings...")
print(f"(This may take 1-2 minutes — 100s of models being tested)")

# Define the grid — all combinations to try
param_grid = {
    "n_estimators":     [50, 100, 200],      # number of trees
    "max_depth":        [6, 10, 15],          # tree depth
    "min_samples_leaf": [3, 5, 10],           # min examples per leaf
}

# Total combinations: 3 × 3 × 3 = 27 combinations
# Each tested with 3-fold cross validation = 81 models trained!
total = 3 * 3 * 3 * 3
print(f"Testing {3*3*3} combinations × 3-fold CV = {total} models...")

grid_search = GridSearchCV(
    RandomForestClassifier(random_state=42, n_jobs=-1),
    param_grid,
    cv=3,              # 3-fold cross validation
    scoring="accuracy",
    n_jobs=-1,         # use all CPU cores
    verbose=1          # print progress
)

grid_search.fit(X_train, y_train)

print(f"\n✅ Grid search complete!")
print(f"Best parameters found:")
for param, value in grid_search.best_params_.items():
    print(f"  {param:20} = {value}")
print(f"Best CV accuracy: {grid_search.best_score_*100:.2f}%")

# ============================================================
# STEP 3 — Train final model with best parameters
# ============================================================

print(f"\n=== STEP 3: FINAL MODEL WITH BEST PARAMETERS ===")

best_params = grid_search.best_params_
final_model = RandomForestClassifier(
    **best_params,      # unpack the best parameters dict
    random_state=42,
    n_jobs=-1
)

final_model.fit(X_train, y_train)
y_pred    = final_model.predict(X_test)
final_acc = accuracy_score(y_test, y_pred)

print(f"Final model accuracy: {final_acc*100:.2f}%")

# Compare with default settings
default_model = RandomForestClassifier(n_estimators=100, random_state=42)
default_model.fit(X_train, y_train)
default_acc = accuracy_score(y_test, default_model.predict(X_test))

print(f"Default model accuracy: {default_acc*100:.2f}%")
print(f"Improvement from tuning: +{(final_acc-default_acc)*100:.2f}%")

# ============================================================
# STEP 4 — Learning Curve
# ============================================================

# Learning curve answers: does MORE data improve the model?
# X axis = how many training examples we used
# Y axis = accuracy achieved
# If curve is still going up = more data would help
# If curve is flat = model has learned all it can from data

print(f"\n=== STEP 4: LEARNING CURVE ===")
print(f"Testing model with different amounts of training data...")

train_sizes, train_scores, val_scores = learning_curve(
    final_model, X, y,
    train_sizes=np.linspace(0.1, 1.0, 8),  # 10% to 100% of data
    cv=3,
    scoring="accuracy",
    n_jobs=-1
)

train_mean = train_scores.mean(axis=1)
val_mean   = val_scores.mean(axis=1)

print(f"\nData size vs accuracy:")
for size, t, v in zip(train_sizes, train_mean, val_mean):
    print(f"  {size:6,} examples → train: {t*100:.1f}%  val: {v*100:.1f}%")

# ============================================================
# STEP 5 — Full evaluation report
# ============================================================

existing_classes = sorted(y.unique())
existing_labels  = [labels_map[c] for c in existing_classes]

print(f"\n=== FINAL MODEL EVALUATION ===")
print(classification_report(y_test, y_pred,
      labels=existing_classes, target_names=existing_labels))

cm = confusion_matrix(y_test, y_pred, labels=existing_classes)
print(f"Confusion matrix:")
print(f"           " + "  ".join(f"{l:7}" for l in existing_labels))
for i, lbl in enumerate(existing_labels):
    print(f"  {lbl:6}:  {cm[i]}")

# ============================================================
# STEP 6 — Final cross validation score
# ============================================================

cv_final = cross_val_score(final_model, X, y, cv=5, scoring="accuracy")
print(f"\n=== FINAL CROSS VALIDATION ===")
print(f"5-fold scores: {[f'{s*100:.1f}%' for s in cv_final]}")
print(f"Mean accuracy: {cv_final.mean()*100:.2f}% ± {cv_final.std()*100:.2f}%")
print(f"\n→ This is your RESUME NUMBER: {cv_final.mean()*100:.1f}% accuracy")

# ============================================================
# STEP 7 — Test with multiple real scenarios
# ============================================================

print(f"\n=== TESTING REAL WORLD SCENARIOS ===")

scenarios = [
    {"name": "July monsoon fire, Kerala",
     "brightness_norm":0.20, "frp_norm":0.15, "fire_energy_norm":0.10,
     "day_of_year_norm":0.53, "month":7, "season_encoded":2,
     "is_dry_season":0, "latitude_norm":0.15, "longitude_norm":0.30},

    {"name": "April peak summer fire, Odisha",
     "brightness_norm":0.78, "frp_norm":0.72, "fire_energy_norm":0.82,
     "day_of_year_norm":0.25, "month":4, "season_encoded":1,
     "is_dry_season":1, "latitude_norm":0.45, "longitude_norm":0.55},

    {"name": "November post-monsoon fire, Punjab",
     "brightness_norm":0.55, "frp_norm":0.60, "fire_energy_norm":0.58,
     "day_of_year_norm":0.85, "month":11, "season_encoded":3,
     "is_dry_season":1, "latitude_norm":0.80, "longitude_norm":0.40},

    {"name": "March dry fire, Rajasthan",
     "brightness_norm":0.65, "frp_norm":0.50, "fire_energy_norm":0.60,
     "day_of_year_norm":0.18, "month":3, "season_encoded":1,
     "is_dry_season":1, "latitude_norm":0.70, "longitude_norm":0.25},
]

for scenario in scenarios:
    name = scenario.pop("name")
    new_fire = pd.DataFrame([scenario])
    pred  = final_model.predict(new_fire)[0]
    proba = final_model.predict_proba(new_fire)[0]
    risk_emoji = {"Low":"🟢", "Medium":"🟡", "High":"🔴"}
    print(f"\n  {name}")
    print(f"  → {risk_emoji[labels_map[pred]]} {labels_map[pred].upper()} RISK  "
          f"(confidence: {max(proba)*100:.0f}%)")

# ============================================================
# STEP 8 — CHARTS
# ============================================================

fig, axes = plt.subplots(2, 2, figsize=(15, 11))
fig.suptitle("ClimateGuard AI — Day 7: Final Tuned Model",
             fontsize=14, fontweight="bold")

# Chart 1: Hyperparameter tuning results
results_df = pd.DataFrame(grid_search.cv_results_)
top10 = results_df.nlargest(10, "mean_test_score")
labels_bar = [f"n={r['param_n_estimators']} d={r['param_max_depth']} "
              f"leaf={r['param_min_samples_leaf']}"
              for _, r in top10.iterrows()]
axes[0,0].barh(range(10), top10["mean_test_score"]*100,
               color="#3498db", alpha=0.8)
axes[0,0].set_yticks(range(10))
axes[0,0].set_yticklabels(labels_bar, fontsize=8)
axes[0,0].set_xlabel("Cross-Validated Accuracy (%)")
axes[0,0].set_title("Top 10 Hyperparameter Combinations")
axes[0,0].set_xlim(80, 101)
axes[0,0].invert_yaxis()

# Chart 2: Learning curve
axes[0,1].plot(train_sizes, train_mean*100, "o-",
               color="#e74c3c", label="Training score", linewidth=2)
axes[0,1].plot(train_sizes, val_mean*100, "o-",
               color="#2ecc71", label="Validation score", linewidth=2)
axes[0,1].fill_between(train_sizes,
                        train_scores.min(axis=1)*100,
                        train_scores.max(axis=1)*100,
                        alpha=0.1, color="#e74c3c")
axes[0,1].fill_between(train_sizes,
                        val_scores.min(axis=1)*100,
                        val_scores.max(axis=1)*100,
                        alpha=0.1, color="#2ecc71")
axes[0,1].set_xlabel("Training examples")
axes[0,1].set_ylabel("Accuracy (%)")
axes[0,1].set_title("Learning Curve\n(does more data help?)")
axes[0,1].legend()
axes[0,1].grid(alpha=0.3)

# Chart 3: Final confusion matrix
im = axes[1,0].imshow(cm, cmap="Blues")
axes[1,0].set_title(f"Final Model Confusion Matrix\n({final_acc*100:.1f}% accuracy)")
axes[1,0].set_xlabel("Predicted")
axes[1,0].set_ylabel("Actual")
axes[1,0].set_xticks(range(len(existing_labels)))
axes[1,0].set_yticks(range(len(existing_labels)))
axes[1,0].set_xticklabels(existing_labels)
axes[1,0].set_yticklabels(existing_labels)
for i in range(len(existing_labels)):
    for j in range(len(existing_labels)):
        axes[1,0].text(j, i, str(cm[i][j]),
                       ha="center", va="center", fontsize=12,
                       fontweight="bold",
                       color="white" if cm[i][j]>cm.max()/2 else "black")
plt.colorbar(im, ax=axes[1,0])

# Chart 4: Final CV scores
axes[1,1].bar([f"Fold {i+1}" for i in range(5)],
              cv_final*100, color="#9b59b6", alpha=0.8)
axes[1,1].axhline(y=cv_final.mean()*100, color="red",
                   linestyle="--", linewidth=2,
                   label=f"Mean: {cv_final.mean()*100:.1f}%")
axes[1,1].set_title("Final Model — 5-Fold Cross Validation")
axes[1,1].set_ylabel("Accuracy (%)")
axes[1,1].set_ylim(70, 105)
axes[1,1].legend(fontsize=11)
for i, s in enumerate(cv_final):
    axes[1,1].text(i, s*100+0.5, f"{s*100:.1f}%",
                   ha="center", fontsize=9, fontweight="bold")

plt.tight_layout()
plt.show()

# ============================================================
# STEP 9 — Save everything for Week 3
# ============================================================

# Save final model
with open("climategaurd_model.pkl", "wb") as f:
    pickle.dump(final_model, f)

# Save feature list (web app needs this)
with open("climategaurd_features.json", "w") as f:
    json.dump(FEATURES, f)

# Save normalization values (web app needs to normalize user input)
norm_values = {}
for col in ["brightness","frp","latitude","longitude","day_of_year","fire_energy"]:
    norm_values[col] = {
        "min": float(df[col].min()),
        "max": float(df[col].max())
    }
with open("climategaurd_norm.json", "w") as f:
    json.dump(norm_values, f, indent=2)

# Save label mapping
with open("climategaurd_labels.json", "w") as f:
    json.dump(labels_map, f)

print(f"\n✅ Files saved for Week 3 web app:")
print(f"   climategaurd_model.pkl      ← trained Random Forest")
print(f"   climategaurd_features.json  ← feature names list")
print(f"   climategaurd_norm.json      ← min/max for normalization")
print(f"   climategaurd_labels.json    ← risk level names")

print(f"\n{'='*55}")
print(f"🎉 WEEK 2 COMPLETE! All 3 days done!")
print(f"{'='*55}")
print(f"\nWeek 2 summary:")
print(f"  Day 5 ✅ First Decision Tree — learned about overfitting")
print(f"  Day 6 ✅ Random Forest — 100 trees, 93.3% accuracy")
print(f"  Day 7 ✅ Tuned model — best hyperparameters found")
print(f"\nYour model is production-ready!")
print(f"\n{'='*55}")
print(f"WEEK 3 STARTS TOMORROW — Building the Web App! 🌐")
print(f"{'='*55}")
print(f"\n  Day 8:  Streamlit basics — your first webpage in Python")
print(f"  Day 9:  Connect model to the app — live predictions")
print(f"  Day 10: Interactive map with Folium — fire risk on map")
print(f"  Day 11: Full dashboard — charts, stats, risk cards")
print(f"\nCome back and say 'Day 8 ready' tomorrow! 🚀")