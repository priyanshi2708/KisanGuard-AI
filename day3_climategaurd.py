# ============================================================
#   ClimateGuard AI — Day 3
#   Goal: Feature Engineering — create new columns for ML model
#   New skills: creating columns, bins, label encoding, correlation
# ============================================================

import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# ============================================================
# STEP 1 — Load the CLEAN data (from Day 2)
# ============================================================

df = pd.read_csv("climategaurd_clean.csv")
df["acq_date"] = pd.to_datetime(df["acq_date"])
df["month"] = df["acq_date"].dt.month

print("✅ Clean data loaded!")
print(f"Total high-confidence fire events: {len(df)}")
print(f"Columns available: {df.columns.tolist()}")


# ============================================================
# STEP 2 — Create Feature: SEASON
# ============================================================

# Feature = a new column we CREATE from existing data
# that gives the ML model more useful information

# India has 4 climate seasons:
# Dec-Feb = Winter (cool and dry)
# Mar-May = Summer (hot and dry = HIGH fire risk)
# Jun-Sep = Monsoon (wet = LOW fire risk)
# Oct-Nov = Post-monsoon (dry again = MEDIUM fire risk)

# We will map each month to a season name
# This is called "domain knowledge" — you know about India's climate
# and you teach that knowledge to the model through features

def get_season(month):
    # A function takes an input and returns an output
    # Input: month number (1-12)
    # Output: season name as a string
    if month in [12, 1, 2]:
        return "Winter"
    elif month in [3, 4, 5]:
        return "Summer"
    elif month in [6, 7, 8, 9]:
        return "Monsoon"
    else:
        return "PostMonsoon"

# .apply() runs a function on every single row
# Like a factory machine — every row goes in, comes out transformed
df["season"] = df["month"].apply(get_season)

print("\n=== SEASON COLUMN CREATED ===")
print(df["season"].value_counts())


# ============================================================
# STEP 3 — Create Feature: FIRE INTENSITY LEVEL
# ============================================================

# "brightness" is a number like 310.5, 425.8, 500.2 etc
# Numbers are hard for some ML models to use directly
# We convert numbers into CATEGORIES using "bins"

# Think of bins like grade boundaries in school:
# 0-330 Kelvin   = Low intensity fire
# 330-380 Kelvin = Medium intensity fire
# 380-500 Kelvin = High intensity fire
# 500+ Kelvin    = Extreme intensity fire

# pd.cut() slices a number column into labeled categories
# bins = the boundary numbers
# labels = what to call each category
df["intensity_level"] = pd.cut(
    df["brightness"],
    bins=[0, 330, 380, 500, 2000],
    labels=["Low", "Medium", "High", "Extreme"]
)

print("\n=== INTENSITY LEVEL COLUMN CREATED ===")
print(df["intensity_level"].value_counts())


# ============================================================
# STEP 4 — Create Feature: IS DRY SEASON (yes or no)
# ============================================================

# Sometimes the simplest features are the most powerful
# ML models love True/False (1/0) columns
# Is this fire in a dry season? = Summer or PostMonsoon
# This directly captures fire risk from season

# We create a TRUE/FALSE column
# .isin() checks if the value is inside a list
df["is_dry_season"] = df["season"].isin(["Summer", "PostMonsoon"])

# Convert True/False to 1/0 (numbers ML models understand)
df["is_dry_season"] = df["is_dry_season"].astype(int)

print("\n=== IS DRY SEASON COLUMN ===")
print(df["is_dry_season"].value_counts())
print("1 = Dry season fire,  0 = Wet season fire")


# ============================================================
# STEP 5 — Create Feature: FIRE POWER CATEGORY
# ============================================================

# FRP = Fire Radiative Power (how much energy in megawatts)
# Same idea as brightness — we bin it into categories

# First let's see the range of FRP values
print(f"\nFRP min: {df['frp'].min()}")
print(f"FRP max: {df['frp'].max()}")
print(f"FRP average: {df['frp'].mean():.1f}")

df["frp_category"] = pd.cut(
    df["frp"],
    bins=[0, 10, 50, 200, 999999],
    labels=["Weak", "Moderate", "Strong", "Extreme"]
)

print("\n=== FRP CATEGORY COLUMN ===")
print(df["frp_category"].value_counts())


# ============================================================
# STEP 6 — Create the TARGET LABEL (what ML will predict)
# ============================================================

# THIS IS THE MOST IMPORTANT STEP
# In ML, the "label" = the answer we want to predict
# Features = inputs    Label = output

# We create a RISK LEVEL column combining all factors:
# HIGH risk   = extreme/high intensity + dry season
# MEDIUM risk = medium intensity OR dry season
# LOW risk    = low intensity + wet season

def calculate_risk(row):
    # row = one complete row of data (all columns)
    # We look at multiple columns together to decide risk

    intensity = row["intensity_level"]
    dry = row["is_dry_season"]
    frp_cat = row["frp_category"]

    # High risk: strong fire in dry season
    if intensity in ["High", "Extreme"] and dry == 1:
        return "High"
    # High risk: extreme fire power even in wet season
    elif frp_cat == "Extreme":
        return "High"
    # Medium risk: medium fires or dry season weak fires
    elif intensity == "Medium" or (dry == 1 and intensity == "Low"):
        return "Medium"
    # Low risk: everything else
    else:
        return "Low"

# axis=1 means apply the function across columns (row by row)
df["risk_level"] = df.apply(calculate_risk, axis=1)

print("\n=== RISK LEVEL (YOUR ML TARGET!) ===")
print(df["risk_level"].value_counts())
print("\nThis is what your ML model will LEARN TO PREDICT!")


# ============================================================
# STEP 7 — Label Encoding (turn words into numbers)
# ============================================================

# ML models only understand NUMBERS — not words like "High"
# We convert every category column into numbers
# This is called Label Encoding

# Create a mapping dictionary: word → number
season_map = {"Winter": 0, "Summer": 1, "Monsoon": 2, "PostMonsoon": 3}
intensity_map = {"Low": 0, "Medium": 1, "High": 2, "Extreme": 3}
frp_map = {"Weak": 0, "Moderate": 1, "Strong": 2, "Extreme": 3}
risk_map = {"Low": 0, "Medium": 1, "High": 2}

# .map() replaces each value using the dictionary
df["season_encoded"] = df["season"].map(season_map)
df["intensity_encoded"] = df["intensity_level"].map(intensity_map)
df["frp_encoded"] = df["frp_category"].map(frp_map)
df["risk_encoded"] = df["risk_level"].map(risk_map)

print("\n=== AFTER LABEL ENCODING ===")
print(df[["season", "season_encoded",
          "intensity_level", "intensity_encoded",
          "risk_level", "risk_encoded"]].head(8))


# ============================================================
# STEP 8 — Correlation Analysis
# ============================================================

# Correlation = how much two columns move together
# +1.0 = perfectly together (when X goes up, Y goes up)
#  0.0 = no relationship at all
# -1.0 = perfectly opposite (when X goes up, Y goes down)

# We check: which features are most related to risk?
# Higher correlation = more useful feature for ML model

numeric_cols = ["brightness", "frp", "month",
                "is_dry_season", "season_encoded",
                "intensity_encoded", "risk_encoded"]

correlation = df[numeric_cols].corr()["risk_encoded"].sort_values(ascending=False)

print("\n=== CORRELATION WITH RISK LEVEL ===")
print(correlation.round(3))
print("\nHigher number = stronger relationship with fire risk")


# ============================================================
# STEP 9 — CHARTS (see your new features!)
# ============================================================

fig, axes = plt.subplots(2, 2, figsize=(14, 10))
fig.suptitle("ClimateGuard AI — Day 3: Feature Engineering", fontsize=14, fontweight="bold")

# Chart 1: Risk level distribution
risk_counts = df["risk_level"].value_counts()
colors = ["green", "orange", "red"]
axes[0,0].bar(risk_counts.index, risk_counts.values,
              color=["red","orange","green"])
axes[0,0].set_title("Risk Level Distribution (Your ML Target)")
axes[0,0].set_xlabel("Risk Level")
axes[0,0].set_ylabel("Number of fires")

# Chart 2: Risk level by season
season_risk = df.groupby(["season", "risk_level"]).size().unstack(fill_value=0)
season_risk.plot(kind="bar", ax=axes[0,1],
                 color=["green", "red", "orange"])
axes[0,1].set_title("Risk Level by Season")
axes[0,1].set_xlabel("Season")
axes[0,1].set_ylabel("Number of fires")
axes[0,1].tick_params(axis='x', rotation=30)

# Chart 3: Brightness vs FRP scatter
axes[1,0].scatter(df["brightness"], df["frp"],
                  alpha=0.05, s=1, c="darkred")
axes[1,0].set_title("Brightness vs Fire Power (FRP)")
axes[1,0].set_xlabel("Brightness (Kelvin)")
axes[1,0].set_ylabel("Fire Power (MW)")
axes[1,0].set_ylim(0, 500)

# Chart 4: Correlation bar chart
corr_values = correlation.drop("risk_encoded")
bar_colors = ["green" if v > 0 else "red" for v in corr_values.values]
axes[1,1].barh(corr_values.index, corr_values.values, color=bar_colors)
axes[1,1].set_title("Feature Correlation with Risk Level")
axes[1,1].set_xlabel("Correlation Score")
axes[1,1].axvline(x=0, color="black", linewidth=0.5)

plt.tight_layout()
plt.show()


# ============================================================
# STEP 10 — Save the feature-engineered dataset
# ============================================================

# Select only the columns we need for ML
# Features (inputs) + Label (output)
ml_columns = [
    "latitude", "longitude",           # location
    "brightness", "frp",               # raw measurements
    "month", "season_encoded",         # time features
    "is_dry_season",                   # dry season flag
    "intensity_encoded", "frp_encoded",# fire features
    "risk_encoded", "risk_level"       # TARGET to predict
]

df_ml = df[ml_columns].dropna()  # dropna removes any rows with missing values

df_ml.to_csv("climategaurd_features.csv", index=False)

print(f"\n✅ ML-ready dataset saved: climategaurd_features.csv")
print(f"   Rows ready for training: {len(df_ml)}")
print(f"   Features (inputs): {len(ml_columns)-2}")
print(f"   Target column: risk_encoded (0=Low, 1=Medium, 2=High)")

print("\n🎉 Day 3 Complete!")
print("   What you built today:")
print("   ✓ Created 'season' feature from month numbers")
print("   ✓ Created 'intensity_level' by binning brightness")
print("   ✓ Created 'is_dry_season' true/false feature")
print("   ✓ Created 'risk_level' — your ML target label!")
print("   ✓ Converted all words to numbers (label encoding)")
print("   ✓ Measured which features matter most (correlation)")
print("   ✓ Saved ML-ready dataset for Week 2!")
print("\n   Tomorrow Day 4: More feature exploration + final data prep!")
