# ============================================================
#   ClimateGuard AI — Day 1
#   Goal: Load real NASA fire data and explore it
#   Author: You!
# ============================================================


# LINE 1 — import pandas
# pandas is a library (a toolbox someone else built for us).
# It makes working with data files very easy.
# "as pd" means we give it a short nickname "pd" so we
# don't have to type "pandas" every time.
import pandas as pd


# LINE 2 — import matplotlib
# matplotlib is another toolbox — it turns numbers into charts.
# "pyplot" is the part that draws the charts.
# We nickname it "plt".
import matplotlib.pyplot as plt


# ============================================================
# STEP 1 — Load the NASA data file
# ============================================================

# LINE 3 — load the CSV file into a "DataFrame"
# A DataFrame is like an Excel table inside Python.
# Rows are locations, columns are: temperature, date, country etc.
# IMPORTANT: Replace the filename below with YOUR downloaded file name.
# Example: if your file is "modis_2024_India.csv" keep it as is.
# Make sure the file is in the SAME folder as this Python file!

df = pd.read_csv("modis_2024_India.csv")

# What just happened?
# pd.read_csv() opened the file and loaded every row into "df"
# "df" is just a variable name — short for DataFrame
# Think of df as your Excel sheet living inside Python now


# ============================================================
# STEP 2 — Look at the data
# ============================================================

# LINE 4 — print the first 10 rows
# .head(10) means "show me the first 10 rows"
# This is how you peek inside your data — like opening the file
print("=== FIRST 10 ROWS OF NASA DATA ===")
print(df.head(10))


# LINE 5 — print how big the dataset is
# .shape gives you (number of rows, number of columns)
# Example output: (50000, 15) means 50,000 fire events, 15 columns
print("\n=== SIZE OF DATASET ===")
print("Rows (fire events):", df.shape[0])
print("Columns (data fields):", df.shape[1])


# LINE 6 — print all column names
# These are the headers of your Excel sheet
# You will see things like: latitude, longitude, brightness,
# acq_date, confidence, country_id etc.
print("\n=== COLUMN NAMES ===")
print(df.columns.tolist())


# LINE 7 — print basic statistics
# .describe() automatically calculates min, max, average
# for every number column — very powerful one line!
print("\n=== BASIC STATISTICS ===")
print(df.describe())


# LINE 8 — check for missing values
# Real data always has some missing entries (blank cells)
# .isnull().sum() counts how many blanks exist per column
# This tells you what you will need to clean in Week 1
print("\n=== MISSING VALUES PER COLUMN ===")
print(df.isnull().sum())


# ============================================================
# STEP 3 — Your very first chart!
# ============================================================

# LINE 9 — count how many fire events happened each month
# "acq_date" is the date column in NASA data (acquisition date)
# We convert it to datetime so Python understands it as a date
df["acq_date"] = pd.to_datetime(df["acq_date"])

# Extract just the month number from each date
df["month"] = df["acq_date"].dt.month

# Count how many fires happened in each month
fires_per_month = df["month"].value_counts().sort_index()

print("\n=== FIRES PER MONTH ===")
print(fires_per_month)


# LINE 10 — draw a bar chart
# figure creates a blank canvas, size (10,5) is width x height inches
plt.figure(figsize=(10, 5))

# bar() draws the chart — x axis is month, y axis is fire count
plt.bar(fires_per_month.index, fires_per_month.values, color="tomato")

# Labels and title — always label your charts!
plt.xlabel("Month (1=January, 12=December)")
plt.ylabel("Number of fire events")
plt.title("NASA FIRMS Fire Events in India by Month")

# xticks shows all 12 months on x axis clearly
plt.xticks(range(1, 13), 
           ["Jan","Feb","Mar","Apr","May","Jun",
            "Jul","Aug","Sep","Oct","Nov","Dec"])

# tight_layout stops labels from being cut off
plt.tight_layout()

# This opens the chart in a popup window — you will see a real bar chart!
plt.show()

print("\n✅ Day 1 complete! You just loaded real NASA satellite data.")
print("   You can see fire patterns across India by month.")
print("   Tomorrow: Week 1 Day 2 — we clean this data and explore deeper.")