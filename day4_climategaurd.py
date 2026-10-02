# ============================================================
#   ClimateGuard AI — Day 4
#   Goal: Normalize data, select best features, final prep
#   New skills: normalization, train/test split preview,
#               heatmap, final dataset ready for ML
# ============================================================

import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# ============================================================
# STEP 1 — Load the feature-engineered data from Day 3
# ============================================================

df = pd.read_csv("climategaurd_features.csv")

print("✅ Feature data loaded!")
print(f"Shape: {df.shape}")
print(f"\nColumns: {df.columns.tolist()}")
print(f"\nFirst 5 rows:")
print(df.head())


# ============================================================
# STEP 2 — Check the data one final time
# ============================================================

print("\n=== FINAL DATA HEALTH CHECK ===")

# Check missing values
missing = df.isnull().sum()
print(f"\nMissing values:")
print(missing[missing > 0] if missing.sum() > 0 else "✅ No missing values!")

# Check data types — all must be numbers for ML
print(f"\nData types:")
print(df.dtypes)

# Check class balance — how many Low/Medium/High examples?
print(f"\nRisk level distribution:")
risk_counts = df["risk_encoded"].value_counts().sort_index()
for code, count in risk_counts.items():
    label = {0:"Low", 1:"Medium", 2:"High"}[code]
    pct = count/len(df)*100
    bar = "█" * int(pct/2)
    print(f"  {label:6} ({code}): {count:6,}  {bar} {pct:.1f}%")


# ============================================================
# STEP 3 — Remove duplicates
# ============================================================

# Sometimes satellite passes over the same location twice
# and records the same fire twice — duplicate rows
before = len(df)
df = df.drop_duplicates()
after = len(df)

print(f"\n=== DUPLICATES REMOVED ===")
print(f"Before: {before:,} rows")
print(f"After:  {after:,} rows")
print(f"Removed: {before - after:,} duplicate rows")


# ============================================================
# STEP 4 — Remove outliers
# ============================================================

# Outliers = extreme values that are probably errors
# Example: brightness of 50,000 Kelvin is impossible
# The Sun's surface is ~5,778 Kelvin — 50,000 makes no sense

# IQR method — the professional way to find outliers:
# Q1 = value at 25th percentile (lower quarter)
# Q3 = value at 75th percentile (upper quarter)
# IQR = Q3 - Q1 (the middle 50% range)
# Anything below Q1 - 1.5*IQR or above Q3 + 1.5*IQR = outlier

def remove_outliers(df, column):
    Q1 = df[column].quantile(0.25)   # 25th percentile
    Q3 = df[column].quantile(0.75)   # 75th percentile
    IQR = Q3 - Q1                    # interquartile range
    lower = Q1 - 1.5 * IQR          # lower boundary
    upper = Q3 + 1.5 * IQR          # upper boundary
    # Keep only rows within the boundaries
    return df[(df[column] >= lower) & (df[column] <= upper)]

before = len(df)
df = remove_outliers(df, "brightness")
df = remove_outliers(df, "frp")
after = len(df)

print(f"\n=== OUTLIERS REMOVED ===")
print(f"Before: {before:,} rows")
print(f"After:  {after:,} rows")
print(f"Removed: {before - after:,} outlier rows")


# ============================================================
# STEP 5 — NORMALIZATION
# ============================================================

# Problem: brightness values are like 310-500
#          frp values are like 5-200
#          latitude values are like 8-35
# These are very different scales!

# Imagine a race where one person runs in meters and
# another runs in kilometers — the comparison is unfair.
# Normalization makes everything the SAME scale: 0 to 1

# Formula: normalized = (value - min) / (max - min)
# Minimum value becomes 0.0
# Maximum value becomes 1.0
# Everything in between is a decimal between 0 and 1

# Columns to normalize (the raw number columns)
cols_to_normalize = ["brightness", "frp", "latitude", "longitude"]

print("\n=== BEFORE NORMALIZATION ===")
print(df[cols_to_normalize].describe().round(2))

# Create new normalized columns — keep originals too
for col in cols_to_normalize:
    min_val = df[col].min()
    max_val = df[col].max()
    df[col + "_norm"] = (df[col] - min_val) / (max_val - min_val)

print("\n=== AFTER NORMALIZATION (all values 0.0 to 1.0) ===")
norm_cols = [c + "_norm" for c in cols_to_normalize]
print(df[norm_cols].describe().round(3))


# ============================================================
# STEP 6 — Select FINAL FEATURES for ML model
# ============================================================

# From all our columns, we choose the BEST features
# These are the exact columns that go INTO the ML model

# Why these specific ones?
# brightness_norm  → how hot = fire intensity
# frp_norm         → fire power = energy released
# month            → time of year = seasonal pattern
# season_encoded   → which season = climate context
# is_dry_season    → dry/wet = most important risk factor
# intensity_encoded→ our custom fire strength category
# frp_encoded      → our custom fire power category
# latitude_norm    → location = geography matters
# longitude_norm   → location = geography matters

FEATURES = [
    "brightness_norm",    # normalized fire temperature
    "frp_norm",           # normalized fire power
    "month",              # month number (1-12)
    "season_encoded",     # 0=Winter 1=Summer 2=Monsoon 3=PostMonsoon
    "is_dry_season",      # 1=dry 0=wet
    "intensity_encoded",  # 0=Low 1=Medium 2=High 3=Extreme
    "frp_encoded",        # 0=Weak 1=Moderate 2=Strong 3=Extreme
    "latitude_norm",      # normalized north-south position
    "longitude_norm",     # normalized east-west position
]

TARGET = "risk_encoded"   # 0=Low 1=Medium 2=High — what we predict

# Create final X (features) and y (target) datasets
X = df[FEATURES]
y = df[TARGET]

print(f"\n=== FINAL ML DATASET ===")
print(f"X shape (features): {X.shape}")
print(f"  → {X.shape[0]:,} examples, {X.shape[1]} features each")
print(f"y shape (target):   {y.shape}")
print(f"\nFeature columns: {FEATURES}")
print(f"Target column:   {TARGET}")


# ============================================================
# STEP 7 — Preview Train/Test Split (we do full split in Week 2)
# ============================================================

# Train/test split = divide data into two groups:
# TRAINING set (80%) = what the model LEARNS from
# TESTING set  (20%) = what we use to CHECK if it learned well

# Think of it like studying for an exam:
# 80% of time = study past papers (training)
# 20% of time = do a mock exam you never saw (testing)
# The mock exam score = your real accuracy

total = len(X)
train_size = int(0.8 * total)   # 80% for training
test_size = total - train_size  # 20% for testing

print(f"\n=== TRAIN/TEST SPLIT PREVIEW ===")
print(f"Total examples:    {total:,}")
print(f"Training set (80%): {train_size:,} examples → model learns from these")
print(f"Testing set  (20%): {test_size:,} examples → we test accuracy on these")
print(f"\nThe model will NEVER see test data during training.")
print(f"This makes our accuracy score honest and trustworthy.")


# ============================================================
# STEP 8 — CHARTS (4 powerful visualizations)
# ============================================================

fig, axes = plt.subplots(2, 2, figsize=(15, 11))
fig.suptitle("ClimateGuard AI — Day 4: Final Data Preparation",
             fontsize=14, fontweight="bold")


# --- CHART 1: Feature correlation heatmap ---
# A heatmap shows correlation between ALL pairs of features
# Dark red = strong positive correlation
# Dark blue = strong negative correlation
# White = no correlation
corr_matrix = X.corr()
im = axes[0,0].imshow(corr_matrix.values, cmap="RdBu_r",
                       vmin=-1, vmax=1, aspect="auto")
axes[0,0].set_xticks(range(len(FEATURES)))
axes[0,0].set_yticks(range(len(FEATURES)))
short_names = ["bright","frp","month","season","dry",
               "intensity","frp_cat","lat","lng"]
axes[0,0].set_xticklabels(short_names, rotation=45, ha="right", fontsize=8)
axes[0,0].set_yticklabels(short_names, fontsize=8)
plt.colorbar(im, ax=axes[0,0])
axes[0,0].set_title("Feature Correlation Heatmap")


# --- CHART 2: Brightness distribution before vs after normalization ---
axes[0,1].hist(df["brightness"], bins=50, alpha=0.6,
               color="red", label="Original (300-500 Kelvin)")
ax2 = axes[0,1].twinx()  # second y-axis
ax2.hist(df["brightness_norm"], bins=50, alpha=0.5,
         color="blue", label="Normalized (0.0 to 1.0)")
axes[0,1].set_title("Brightness: Before vs After Normalization")
axes[0,1].set_xlabel("Value")
axes[0,1].set_ylabel("Count (original)", color="red")
ax2.set_ylabel("Count (normalized)", color="blue")


# --- CHART 3: Final feature importance preview ---
# Correlation of each feature with the target (risk)
feature_corr = X.corrwith(y).abs().sort_values(ascending=True)
colors = ["#2ecc71" if v < 0.3 else "#f39c12" if v < 0.6
          else "#e74c3c" for v in feature_corr.values]
axes[1,0].barh(short_names[::-1], feature_corr.values, color=colors)
axes[1,0].set_title("Feature Importance Preview (Correlation with Risk)")
axes[1,0].set_xlabel("Absolute Correlation Score")
axes[1,0].axvline(x=0.3, color="gray", linestyle="--",
                  alpha=0.7, label="0.3 threshold")


# --- CHART 4: Final dataset balance ---
risk_labels = ["Low Risk", "Medium Risk", "High Risk"]
risk_colors = ["#2ecc71", "#f39c12", "#e74c3c"]
risk_counts_final = y.value_counts().sort_index()
wedges, texts, autotexts = axes[1,1].pie(
    risk_counts_final.values,
    labels=risk_labels,
    colors=risk_colors,
    autopct="%1.1f%%",
    startangle=90
)
axes[1,1].set_title("Final Dataset: Risk Level Balance")


plt.tight_layout()
plt.show()


# ============================================================
# STEP 9 — Save the FINAL ML-ready dataset
# ============================================================

# Save X (features) and y (target) together
df_final = X.copy()
df_final["risk_encoded"] = y
df_final["risk_level"] = df_final["risk_encoded"].map(
    {0:"Low", 1:"Medium", 2:"High"})

df_final.to_csv("climategaurd_ml_ready.csv", index=False)

print(f"\n✅ FINAL ML-ready dataset saved: climategaurd_ml_ready.csv")
print(f"   Total clean examples: {len(df_final):,}")
print(f"   Features: {len(FEATURES)}")
print(f"   Ready for: Decision Tree, Random Forest (Week 2)")

print("\n" + "="*55)
print("🎉 WEEK 1 COMPLETE! You finished all 4 days!")
print("="*55)
print("\nWhat you built this week:")
print("  Day 1 ✅ Loaded real NASA satellite data")
print("  Day 2 ✅ Filtered and explored the data")
print("  Day 3 ✅ Created 5 powerful ML features")
print("  Day 4 ✅ Normalized, cleaned, finalized data")
print("\nWhat you learned:")
print("  ✅ DataFrames, filtering, groupby, scatter plots")
print("  ✅ Feature engineering, binning, label encoding")
print("  ✅ Normalization, correlation, train/test split")
print("\nNext week — WEEK 2: Your first ML model!")
print("  Day 5: What is machine learning? + Decision Tree")
print("  Day 6: Train your model on real data")
print("  Day 7: Measure accuracy, improve the model")
print("  Day 8: Random Forest — upgrade to 100 trees!")
print("\nCome back Monday and say 'Day 5 ready' 🚀")