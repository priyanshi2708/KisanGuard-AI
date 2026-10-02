# ============================================================
#   ClimateGuard AI — Day 2 (FIXED for numeric confidence)
#   Your NASA data uses numbers (0-100) for confidence
#   not words like "high" — this version handles that correctly
# ============================================================

import pandas as pd
import matplotlib.pyplot as plt

# ============================================================
# STEP 1 — Load the data
# ============================================================

df = pd.read_csv("modis_2024_India.csv")
df["acq_date"] = pd.to_datetime(df["acq_date"])
df["month"] = df["acq_date"].dt.month

print("✅ Data loaded!")
print(f"Total fire events in dataset: {len(df)}")

# ============================================================
# STEP 2 — Understand YOUR confidence column
# ============================================================

# Your data uses numbers 0-100 for confidence
# Higher number = NASA is more confident it is a real fire
# We keep fires where confidence >= 60 (good quality)

print("\n=== CONFIDENCE VALUES IN YOUR DATA ===")
print(df["confidence"].describe())
print(f"\nMin confidence: {df['confidence'].min()}")
print(f"Max confidence: {df['confidence'].max()}")
print(f"Average:        {df['confidence'].mean():.1f}")

# ============================================================
# STEP 3 — Filter by numeric confidence
# ============================================================

# Keep only fires where confidence is 60 or above
# This removes uncertain detections (clouds mistaken for fires etc)
df_high = df[df["confidence"] >= 60]

print(f"\n=== FILTERING RESULTS ===")
print(f"Total fires (all):            {len(df):,}")
print(f"High confidence (>=60):       {len(df_high):,}")
print(f"Removed (low quality <60):    {len(df) - len(df_high):,}")

# ============================================================
# STEP 4 — Find the HOTTEST fire
# ============================================================

hottest_index = df_high["brightness"].idxmax()
hottest_fire = df_high.loc[hottest_index]

print("\n=== HOTTEST FIRE IN INDIA (NASA DATA) ===")
print(f"Date:        {hottest_fire['acq_date'].date()}")
print(f"Latitude:    {hottest_fire['latitude']}")
print(f"Longitude:   {hottest_fire['longitude']}")
print(f"Brightness:  {hottest_fire['brightness']} Kelvin")
print(f"Confidence:  {hottest_fire['confidence']}%")
print(f"FRP (power): {hottest_fire['frp']} MW")

# ============================================================
# STEP 5 — Top 10 hottest fires
# ============================================================

top10 = df_high.nlargest(10, "brightness")
print("\n=== TOP 10 HOTTEST FIRES ===")
print(top10[["acq_date", "latitude", "longitude",
             "brightness", "frp", "confidence"]])

# ============================================================
# STEP 6 — Monthly pattern
# ============================================================

monthly = df_high.groupby("month").size()
print("\n=== HIGH CONFIDENCE FIRES PER MONTH ===")
print(monthly)

peak_month = monthly.idxmax()
month_names = {1:"Jan",2:"Feb",3:"Mar",4:"Apr",5:"May",6:"Jun",
               7:"Jul",8:"Aug",9:"Sep",10:"Oct",11:"Nov",12:"Dec"}
print(f"\n🔥 Peak fire month: {month_names[peak_month]}")
print(f"   Fire events:     {monthly[peak_month]:,}")

# ============================================================
# STEP 7 — Average brightness per month
# ============================================================

avg_brightness = df_high.groupby("month")["brightness"].mean()
print("\n=== AVERAGE FIRE BRIGHTNESS PER MONTH ===")
print(avg_brightness.round(1))

# ============================================================
# STEP 8 — CHARTS
# ============================================================

fig, axes = plt.subplots(1, 3, figsize=(18, 5))
fig.suptitle("ClimateGuard AI — Day 2 Analysis", fontsize=14, fontweight="bold")

# Chart 1: Fires per month
axes[0].bar(monthly.index, monthly.values, color="tomato")
axes[0].set_title("High Confidence Fires per Month")
axes[0].set_xlabel("Month")
axes[0].set_ylabel("Number of fires")
axes[0].set_xticks(range(1, 13))
axes[0].set_xticklabels(["J","F","M","A","M","J","J","A","S","O","N","D"])

# Chart 2: Average brightness per month
axes[1].plot(avg_brightness.index, avg_brightness.values,
             color="orange", marker="o", linewidth=2)
axes[1].set_title("Average Fire Intensity per Month")
axes[1].set_xlabel("Month")
axes[1].set_ylabel("Avg Brightness (Kelvin)")
axes[1].set_xticks(range(1, 13))
axes[1].set_xticklabels(["J","F","M","A","M","J","J","A","S","O","N","D"])

# Chart 3: Scatter map of fire locations
axes[2].scatter(
    df_high["longitude"],
    df_high["latitude"],
    c="red", alpha=0.1, s=0.5
)
axes[2].set_title("Fire Locations — India (Scatter Map)")
axes[2].set_xlabel("Longitude")
axes[2].set_ylabel("Latitude")

plt.tight_layout()
plt.show()

# ============================================================
# STEP 9 — Save clean data for Day 3
# ============================================================

df_high.to_csv("climategaurd_clean.csv", index=False)

print(f"\n✅ Clean data saved: climategaurd_clean.csv")
print(f"   {len(df_high):,} high-quality fire events ready for Day 3!")
print(f"\n🎉 Day 2 Complete!")
print(f"   Run day3_climategaurd.py next!")