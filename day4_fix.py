# ============================================================
#   Day 4 FIX — Just saves the file and shows corrected charts
#   Run this once after day4_climategaurd.py crashed
# ============================================================

import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("climategaurd_features.csv")

FEATURES = [
    "brightness_norm", "frp_norm", "month",
    "season_encoded", "is_dry_season",
    "intensity_encoded", "frp_encoded",
    "latitude_norm", "longitude_norm"
]

# --- Remove outliers (same as day4) ---
def remove_outliers(df, column):
    Q1 = df[column].quantile(0.25)
    Q3 = df[column].quantile(0.75)
    IQR = Q3 - Q1
    return df[(df[column] >= Q1 - 1.5*IQR) & (df[column] <= Q3 + 1.5*IQR)]

df = df.drop_duplicates()
df = remove_outliers(df, "brightness")
df = remove_outliers(df, "frp")

# --- Normalize ---
for col in ["brightness", "frp", "latitude", "longitude"]:
    mn, mx = df[col].min(), df[col].max()
    df[col + "_norm"] = (df[col] - mn) / (mx - mn)

TARGET = "risk_encoded"
X = df[FEATURES]
y = df[TARGET]

# --- Save final ML-ready file ---
df_final = X.copy()
df_final["risk_encoded"] = y
df_final["risk_level"] = y.map({0:"Low", 1:"Medium", 2:"High"})
df_final.to_csv("climategaurd_ml_ready.csv", index=False)
print(f"✅ Saved: climategaurd_ml_ready.csv  ({len(df_final):,} rows)")

# --- Fixed pie chart ---
risk_counts = y.value_counts().sort_index()

# Only include risk levels that actually EXIST in the data
existing_labels = []
existing_colors = []
color_map = {0: "#2ecc71", 1: "#f39c12", 2: "#e74c3c"}
label_map = {0: "Low Risk", 1: "Medium Risk", 2: "High Risk"}

for code in risk_counts.index:
    existing_labels.append(label_map[code])
    existing_colors.append(color_map[code])

fig, axes = plt.subplots(1, 2, figsize=(12, 5))
fig.suptitle("ClimateGuard AI — Day 4 Final Check", fontsize=13, fontweight="bold")

# Pie chart — fixed
axes[0].pie(
    risk_counts.values,
    labels=existing_labels,
    colors=existing_colors,
    autopct="%1.1f%%",
    startangle=90
)
axes[0].set_title("Risk Level Balance in Dataset")

# Feature correlation bar chart
corr = X.corrwith(y).abs().sort_values(ascending=True)
short = ["lng","lat","frp_cat","intensity","dry","season","month","frp","bright"]
axes[1].barh(short, corr.values, color="#3498db")
axes[1].set_title("Feature Correlation with Risk")
axes[1].set_xlabel("Correlation Score")

plt.tight_layout()
plt.show()

print("\n🎉 Day 4 fully complete!")
print("   Now run: python day5_climategaurd.py")