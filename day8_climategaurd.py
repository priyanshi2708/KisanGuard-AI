# ============================================================
#   ClimateGuard AI — Day 8 (BEAUTIFUL UI)
#   Run with: python -m streamlit run day8_climategaurd.py
# ============================================================

import streamlit as st
import pandas as pd
import numpy as np
import pickle
import json
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

st.set_page_config(
    page_title="ClimateGuard AI",
    page_icon="🌿",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ============================================================
# Custom CSS — makes everything look professional
# ============================================================

st.markdown("""
<style>
    /* Background */
    .stApp {
        background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
        color: #ffffff;
    }

    /* Sidebar */
    [data-testid="stSidebar"] {
        background: linear-gradient(180deg, #1a1a2e, #16213e);
        border-right: 1px solid #0f3460;
    }
    [data-testid="stSidebar"] * {
        color: #e0e0e0 !important;
    }

    /* Main content area */
    [data-testid="stMain"] {
        background: transparent;
    }

    /* Slider color */
    .stSlider [data-baseweb="slider"] {
        margin-top: 8px;
    }

    /* Remove default padding */
    .block-container {
        padding-top: 1.5rem;
        padding-bottom: 1rem;
    }

    /* Metric cards */
    [data-testid="stMetric"] {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        padding: 12px;
    }

    /* Selectbox */
    .stSelectbox > div > div {
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.2);
        color: white;
    }
</style>
""", unsafe_allow_html=True)

# ============================================================
# Load model
# ============================================================

@st.cache_resource
def load_model():
    with open("climategaurd_model.pkl", "rb") as f:
        return pickle.load(f)

@st.cache_resource
def load_norm():
    with open("climategaurd_norm.json", "r") as f:
        return json.load(f)

model     = load_model()
norm_vals = load_norm()

# ============================================================
# Helper functions
# ============================================================

def normalize_value(value, col, nv):
    mn = nv[col]["min"]; mx = nv[col]["max"]
    value = max(mn, min(mx, value))
    return (value - mn) / (mx - mn)

def get_season(month):
    if month in [12,1,2]:      return 0
    elif month in [3,4,5]:     return 1
    elif month in [6,7,8,9]:   return 2
    else:                       return 3

def predict_risk(brightness, frp, month, lat, lng):
    season      = get_season(month)
    is_dry      = 1 if season in [1,3] else 0
    doy         = month * 30
    fire_energy = brightness * frp
    features = {
        "brightness_norm":  normalize_value(brightness,  "brightness",  norm_vals),
        "frp_norm":         normalize_value(frp,         "frp",         norm_vals),
        "fire_energy_norm": normalize_value(fire_energy, "fire_energy", norm_vals),
        "day_of_year_norm": normalize_value(doy,         "day_of_year", norm_vals),
        "month":            month,
        "season_encoded":   season,
        "is_dry_season":    is_dry,
        "latitude_norm":    normalize_value(lat,         "latitude",    norm_vals),
        "longitude_norm":   normalize_value(lng,         "longitude",   norm_vals),
    }
    inp  = pd.DataFrame([features])
    pred = model.predict(inp)[0]
    prob = model.predict_proba(inp)[0]
    return pred, prob

MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun",
               "Jul","Aug","Sep","Oct","Nov","Dec"]
SEASON_NAMES = {0:"Winter ❄️", 1:"Summer ☀️",
                2:"Monsoon 🌧️", 3:"Post-Monsoon 🍂"}

# ============================================================
# SIDEBAR
# ============================================================

st.sidebar.markdown("""
<div style='text-align:center; padding: 10px 0 20px;'>
    <div style='font-size:42px;'>🌿</div>
    <div style='font-size:22px; font-weight:700;
                color:#4ecca3; letter-spacing:1px;'>ClimateGuard AI</div>
    <div style='font-size:12px; color:#888; margin-top:4px;'>
        NASA FIRMS + Random Forest ML
    </div>
</div>
""", unsafe_allow_html=True)

st.sidebar.markdown("---")
st.sidebar.markdown("#### 🔥 Fire Measurements")

brightness = st.sidebar.slider("Brightness (Kelvin)", 300.0, 400.0, 325.0, 0.5)
frp        = st.sidebar.slider("Fire Radiative Power (MW)", 3.0, 100.0, 15.0, 0.5)

st.sidebar.markdown("#### 📅 Time")
month = st.sidebar.selectbox("Month",
    options=list(range(1,13)),
    format_func=lambda m: MONTH_NAMES[m-1],
    index=3)

st.sidebar.markdown("#### 📍 Location (India)")
latitude  = st.sidebar.slider("Latitude (°N)",  8.0,  35.0, 22.0, 0.5)
longitude = st.sidebar.slider("Longitude (°E)", 68.0, 97.0, 80.0, 0.5)

st.sidebar.markdown("---")
st.sidebar.markdown("""
<div style='font-size:11px; color:#555; text-align:center; padding-top:8px;'>
    Data: NASA FIRMS MODIS 2024<br>
    Model: Random Forest (93.3% accuracy)<br>
    Training: 41,000+ fire events
</div>
""", unsafe_allow_html=True)

# ============================================================
# RUN PREDICTION
# ============================================================

prediction, probability = predict_risk(brightness, frp, month, latitude, longitude)

RISK_CONFIG = {
    0: {"label":"LOW",    "emoji":"🟢", "color":"#2ecc71",
        "bg":"rgba(46,204,113,0.12)",  "border":"rgba(46,204,113,0.4)",
        "desc":"Minimal fire threat. Normal conditions."},
    1: {"label":"MEDIUM", "emoji":"🟡", "color":"#f39c12",
        "bg":"rgba(243,156,18,0.12)",  "border":"rgba(243,156,18,0.4)",
        "desc":"Moderate risk. Monitor conditions closely."},
    2: {"label":"HIGH",   "emoji":"🔴", "color":"#e74c3c",
        "bg":"rgba(231,76,60,0.12)",   "border":"rgba(231,76,60,0.4)",
        "desc":"Extreme fire risk! Alert authorities immediately."},
}
rc = RISK_CONFIG[prediction]

# ============================================================
# HEADER
# ============================================================

st.markdown("""
<h1 style='color:#4ecca3; font-size:32px; margin-bottom:0;'>
    🌿 ClimateGuard AI
</h1>
<p style='color:#888; margin-top:4px; font-size:14px;'>
    Hyperlocal Climate Fire Risk Predictor — India &nbsp;|&nbsp;
    Powered by NASA FIRMS Satellite Data
</p>
""", unsafe_allow_html=True)

st.markdown("---")

# ============================================================
# MAIN RISK CARD
# ============================================================

season     = get_season(month)
is_dry     = season in [1, 3]
fire_energy = brightness * frp

st.markdown(f"""
<div style='
    background: {rc["bg"]};
    border: 2px solid {rc["border"]};
    border-radius: 20px;
    padding: 32px 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
'>
    <div>
        <div style='font-size:13px; color:#aaa;
                    letter-spacing:3px; text-transform:uppercase;
                    margin-bottom:8px;'>
            PREDICTED FIRE RISK LEVEL
        </div>
        <div style='font-size:64px; font-weight:900;
                    color:{rc["color"]}; letter-spacing:6px;
                    line-height:1; margin-bottom:12px;'>
            {rc["label"]}
        </div>
        <div style='font-size:15px; color:#ccc;'>
            {rc["desc"]}
        </div>
    </div>
    <div style='text-align:right;'>
        <div style='font-size:80px; line-height:1;'>{rc["emoji"]}</div>
        <div style='font-size:13px; color:#888; margin-top:8px;'>
            {MONTH_NAMES[month-1]} · {SEASON_NAMES[season]}
        </div>
        <div style='font-size:13px; color:#888;'>
            {latitude:.1f}°N, {longitude:.1f}°E
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

# ============================================================
# CONFIDENCE CARDS
# ============================================================

col1, col2, col3 = st.columns(3)
classes     = model.classes_
conf_config = [
    {"name":"Low Risk",    "emoji":"🟢", "color":"#2ecc71", "bg":"rgba(46,204,113,0.08)"},
    {"name":"Medium Risk", "emoji":"🟡", "color":"#f39c12", "bg":"rgba(243,156,18,0.08)"},
    {"name":"High Risk",   "emoji":"🔴", "color":"#e74c3c", "bg":"rgba(231,76,60,0.08)"},
]

for i, (cls, prob) in enumerate(zip(classes, probability)):
    cc = conf_config[i]
    with [col1, col2, col3][i]:
        # Bold border if this is the predicted class
        border_width = "3px" if cls == prediction else "1px"
        st.markdown(f"""
        <div style='
            background: {cc["bg"]};
            border: {border_width} solid {cc["color"]};
            border-radius: 16px;
            padding: 20px;
            text-align: center;
        '>
            <div style='font-size:32px;'>{cc["emoji"]}</div>
            <div style='font-size:13px; color:#aaa;
                        margin: 6px 0 4px;'>{cc["name"]}</div>
            <div style='font-size:40px; font-weight:800;
                        color:{cc["color"]};
                        line-height:1;'>{prob*100:.1f}%</div>
            <div style='margin-top:10px; background:rgba(255,255,255,0.05);
                        border-radius:8px; height:8px; overflow:hidden;'>
                <div style='background:{cc["color"]}; height:100%;
                            width:{prob*100:.1f}%; border-radius:8px;'></div>
            </div>
        </div>
        """, unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

# ============================================================
# STATS ROW
# ============================================================

s1, s2, s3, s4 = st.columns(4)

with s1:
    bright_status = "🔴 Extreme" if brightness>355 else "🟡 High" if brightness>335 else "🟢 Normal"
    st.markdown(f"""
    <div style='background:rgba(255,255,255,0.04); border:1px solid
                rgba(255,255,255,0.1); border-radius:12px; padding:16px;
                text-align:center;'>
        <div style='font-size:11px; color:#888; text-transform:uppercase;
                    letter-spacing:2px;'>Brightness</div>
        <div style='font-size:28px; font-weight:700;
                    color:#4ecca3; margin:6px 0;'>{brightness:.0f}K</div>
        <div style='font-size:12px; color:#aaa;'>{bright_status}</div>
    </div>""", unsafe_allow_html=True)

with s2:
    frp_status = "🔴 Extreme" if frp>60 else "🟡 Strong" if frp>25 else "🟢 Moderate"
    st.markdown(f"""
    <div style='background:rgba(255,255,255,0.04); border:1px solid
                rgba(255,255,255,0.1); border-radius:12px; padding:16px;
                text-align:center;'>
        <div style='font-size:11px; color:#888; text-transform:uppercase;
                    letter-spacing:2px;'>Fire Power</div>
        <div style='font-size:28px; font-weight:700;
                    color:#e67e22; margin:6px 0;'>{frp:.0f} MW</div>
        <div style='font-size:12px; color:#aaa;'>{frp_status}</div>
    </div>""", unsafe_allow_html=True)

with s3:
    dry_label = "⚠️ Dry Season" if is_dry else "✅ Wet Season"
    dry_color = "#e74c3c" if is_dry else "#2ecc71"
    st.markdown(f"""
    <div style='background:rgba(255,255,255,0.04); border:1px solid
                rgba(255,255,255,0.1); border-radius:12px; padding:16px;
                text-align:center;'>
        <div style='font-size:11px; color:#888; text-transform:uppercase;
                    letter-spacing:2px;'>Season</div>
        <div style='font-size:22px; font-weight:700;
                    color:{dry_color}; margin:6px 0;'>
                    {SEASON_NAMES[season]}</div>
        <div style='font-size:12px; color:#aaa;'>{dry_label}</div>
    </div>""", unsafe_allow_html=True)

with s4:
    st.markdown(f"""
    <div style='background:rgba(255,255,255,0.04); border:1px solid
                rgba(255,255,255,0.1); border-radius:12px; padding:16px;
                text-align:center;'>
        <div style='font-size:11px; color:#888; text-transform:uppercase;
                    letter-spacing:2px;'>Fire Energy</div>
        <div style='font-size:28px; font-weight:700;
                    color:#9b59b6; margin:6px 0;'>{fire_energy:,.0f}</div>
        <div style='font-size:12px; color:#aaa;'>Brightness × FRP</div>
    </div>""", unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

# ============================================================
# FEATURE IMPORTANCE CHART + RISK GUIDE
# ============================================================

col_left, col_right = st.columns([1, 1])

with col_left:
    st.markdown("""
    <div style='font-size:16px; font-weight:600; color:#4ecca3;
                margin-bottom:12px;'>🧠 How the model decided</div>
    """, unsafe_allow_html=True)

    feature_names = ["fire_energy","frp","day_of_year","month",
                     "is_dry_season","season","brightness","longitude","latitude"]
    importances   = model.feature_importances_

    fig, ax = plt.subplots(figsize=(7, 4))
    fig.patch.set_facecolor("#0f2027")
    ax.set_facecolor("#0f2027")

    sorted_idx = np.argsort(importances)
    colors_fi  = ["#e74c3c" if importances[i]>0.2 else
                  "#f39c12" if importances[i]>0.08 else
                  "#3498db" for i in sorted_idx]

    bars = ax.barh([feature_names[i] for i in sorted_idx],
                   [importances[i] for i in sorted_idx],
                   color=colors_fi, height=0.6)

    ax.set_xlabel("Importance Score", color="#aaa", fontsize=10)
    ax.tick_params(colors="#ccc", labelsize=9)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["bottom"].set_color("#333")
    ax.spines["left"].set_color("#333")
    ax.xaxis.label.set_color("#aaa")

    # Value labels on bars
    for bar, val in zip(bars, [importances[i] for i in sorted_idx]):
        ax.text(val + 0.003, bar.get_y() + bar.get_height()/2,
                f"{val:.3f}", va="center", color="#ccc", fontsize=8)

    plt.tight_layout()
    st.pyplot(fig)
    plt.close()

with col_right:
    st.markdown("""
    <div style='font-size:16px; font-weight:600; color:#4ecca3;
                margin-bottom:12px;'>📖 Risk Level Guide</div>
    """, unsafe_allow_html=True)

    for level, config in RISK_CONFIG.items():
        tips = {
            0: ["Low fire intensity", "Usually monsoon season",
                "Normal farming activities safe", "No action needed"],
            1: ["Moderate fire conditions", "Transition season",
                "Avoid open field burning", "Monitor weather daily"],
            2: ["Extreme fire intensity", "Dry season peak",
                "Alert local fire authority", "Evacuate if near forest"],
        }
        tips_html = "".join([f"<li style='margin:3px 0;'>{t}</li>" for t in tips[level]])
        st.markdown(f"""
        <div style='
            background: {config["bg"]};
            border-left: 4px solid {config["color"]};
            border-radius: 0 10px 10px 0;
            padding: 12px 16px;
            margin-bottom: 10px;
        '>
            <div style='font-weight:700; color:{config["color"]};
                        font-size:15px; margin-bottom:6px;'>
                {config["emoji"]} {config["label"]} RISK
            </div>
            <ul style='margin:0; padding-left:16px;
                       color:#ccc; font-size:12px;'>
                {tips_html}
            </ul>
        </div>
        """, unsafe_allow_html=True)

# ============================================================
# FOOTER
# ============================================================

st.markdown("---")
st.markdown("""
<div style='text-align:center; color:#555; font-size:12px; padding:8px 0;'>
    🌿 ClimateGuard AI &nbsp;|&nbsp;
    Built on NASA FIRMS MODIS Satellite Data &nbsp;|&nbsp;
    Random Forest ML · 93.3% Cross-Validated Accuracy &nbsp;|&nbsp;
    41,000+ Training Examples
</div>
""", unsafe_allow_html=True)