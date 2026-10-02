# ============================================================
#   ClimateGuard AI — Day 9 (FAST MAP VERSION)
#   Fix: Use FastMarkerCluster instead of individual CircleMarkers
#   Map now loads in 2-3 seconds instead of 30+
#   Run: python -m streamlit run day9_climategaurd.py
# ============================================================

import streamlit as st
import pandas as pd
import numpy as np
import pickle
import json
import folium
from folium.plugins import HeatMap, FastMarkerCluster
from streamlit_folium import st_folium
import matplotlib.pyplot as plt

st.set_page_config(
    page_title="ClimateGuard AI",
    page_icon="🌿",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.markdown("""
<style>
    .stApp { background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); }
    [data-testid="stSidebar"] {
        background: linear-gradient(180deg, #1a1a2e, #16213e);
        border-right: 1px solid #0f3460;
    }
    [data-testid="stSidebar"] * { color: #e0e0e0 !important; }
    .block-container { padding-top: 1.5rem; }
</style>
""", unsafe_allow_html=True)

# ============================================================
# Load everything — cached so only runs ONCE
# ============================================================

@st.cache_resource
def load_model():
    with open("climategaurd_model.pkl", "rb") as f:
        return pickle.load(f)

@st.cache_resource
def load_norm():
    with open("climategaurd_norm.json", "r") as f:
        return json.load(f)

@st.cache_data   # cached — fire data never changes
def load_fire_data():
    df = pd.read_csv("climategaurd_clean.csv")
    df["acq_date"] = pd.to_datetime(df["acq_date"])
    df["month"]    = df["acq_date"].dt.month

    def remove_outliers(d, col):
        Q1 = d[col].quantile(0.25); Q3 = d[col].quantile(0.75)
        IQR = Q3 - Q1
        return d[(d[col] >= Q1-1.5*IQR) & (d[col] <= Q3+1.5*IQR)]

    df = remove_outliers(df, "brightness")
    df = remove_outliers(df, "frp")

    b66 = df["brightness"].quantile(0.66)
    b33 = df["brightness"].quantile(0.33)
    f66 = df["frp"].quantile(0.66)

    def get_risk(row):
        if row["brightness"] >= b66 and row["frp"] >= f66:
            return "High",   "#e74c3c", 6
        elif row["brightness"] >= b33 or row["frp"] >= f66:
            return "Medium", "#f39c12", 4
        else:
            return "Low",    "#2ecc71", 3

    info = df.apply(get_risk, axis=1)
    df["risk_label"] = info.apply(lambda x: x[0])
    df["risk_color"] = info.apply(lambda x: x[1])
    df["dot_size"]   = info.apply(lambda x: x[2])

    season_map = {**{m:"Winter" for m in [12,1,2]},
                  **{m:"Summer" for m in [3,4,5]},
                  **{m:"Monsoon" for m in [6,7,8,9]},
                  **{m:"Post-Monsoon" for m in [10,11]}}
    df["season"] = df["month"].map(season_map)
    return df

model     = load_model()
norm_vals = load_norm()
fire_df   = load_fire_data()

# ============================================================
# Helpers
# ============================================================

def normalize_value(value, col, nv):
    mn = nv[col]["min"]; mx = nv[col]["max"]
    return (max(mn, min(mx, value)) - mn) / (mx - mn)

def get_season_num(month):
    if month in [12,1,2]: return 0
    elif month in [3,4,5]: return 1
    elif month in [6,7,8,9]: return 2
    else: return 3

def predict_risk(brightness, frp, month, lat, lng):
    season = get_season_num(month)
    is_dry = 1 if season in [1,3] else 0
    fe     = brightness * frp
    inp = pd.DataFrame([{
        "brightness_norm":  normalize_value(brightness, "brightness",  norm_vals),
        "frp_norm":         normalize_value(frp,        "frp",         norm_vals),
        "fire_energy_norm": normalize_value(fe,         "fire_energy", norm_vals),
        "day_of_year_norm": normalize_value(month*30,   "day_of_year", norm_vals),
        "month": month, "season_encoded": season, "is_dry_season": is_dry,
        "latitude_norm":    normalize_value(lat,        "latitude",    norm_vals),
        "longitude_norm":   normalize_value(lng,        "longitude",   norm_vals),
    }])
    return model.predict(inp)[0], model.predict_proba(inp)[0]

MONTHS  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
SEASONS = {0:"Winter ❄️",1:"Summer ☀️",2:"Monsoon 🌧️",3:"Post-Monsoon 🍂"}
RC = {
    0:{"label":"LOW",    "emoji":"🟢","color":"#2ecc71",
       "bg":"rgba(46,204,113,0.12)","border":"rgba(46,204,113,0.4)",
       "desc":"Minimal fire threat. Normal conditions."},
    1:{"label":"MEDIUM", "emoji":"🟡","color":"#f39c12",
       "bg":"rgba(243,156,18,0.12)","border":"rgba(243,156,18,0.4)",
       "desc":"Moderate risk. Monitor conditions closely."},
    2:{"label":"HIGH",   "emoji":"🔴","color":"#e74c3c",
       "bg":"rgba(231,76,60,0.12)","border":"rgba(231,76,60,0.4)",
       "desc":"Extreme fire risk! Alert authorities immediately."},
}

# ============================================================
# SIDEBAR
# ============================================================

st.sidebar.markdown("""
<div style='text-align:center; padding:10px 0 20px;'>
    <div style='font-size:42px;'>🌿</div>
    <div style='font-size:22px; font-weight:700; color:#4ecca3;'>ClimateGuard AI</div>
    <div style='font-size:12px; color:#888;'>NASA FIRMS + Random Forest ML</div>
</div>
""", unsafe_allow_html=True)
st.sidebar.markdown("---")

page = st.sidebar.radio("Navigation",
    ["🔴 Risk Predictor","🗺️ Fire Map"], label_visibility="collapsed")

st.sidebar.markdown("---")
st.sidebar.markdown("#### 🔥 Fire Measurements")
brightness = st.sidebar.slider("Brightness (Kelvin)", 300.0, 400.0, 325.0, 0.5)
frp        = st.sidebar.slider("Fire Radiative Power (MW)", 3.0, 100.0, 15.0, 0.5)
st.sidebar.markdown("#### 📅 Time")
month = st.sidebar.selectbox("Month", list(range(1,13)),
        format_func=lambda m: MONTHS[m-1], index=3)
st.sidebar.markdown("#### 📍 Location (India)")
latitude  = st.sidebar.slider("Latitude (°N)",  8.0,  35.0, 22.0, 0.5)
longitude = st.sidebar.slider("Longitude (°E)", 68.0, 97.0, 80.0, 0.5)
st.sidebar.markdown("---")
st.sidebar.markdown("""
<div style='font-size:11px; color:#555; text-align:center;'>
    Data: NASA FIRMS MODIS 2024<br>
    Model: Random Forest · 93.3% accuracy<br>
    Training: 41,000+ fire events
</div>""", unsafe_allow_html=True)

# ============================================================
# Prediction
# ============================================================

pred, prob   = predict_risk(brightness, frp, month, latitude, longitude)
rc           = RC[pred]
season       = get_season_num(month)
is_dry       = season in [1,3]
fire_energy  = brightness * frp

# ============================================================
# HEADER
# ============================================================

st.markdown("""
<h1 style='color:#4ecca3; font-size:32px; margin-bottom:0;'>🌿 ClimateGuard AI</h1>
<p style='color:#888; margin-top:4px; font-size:14px;'>
    Hyperlocal Climate Fire Risk Predictor — India &nbsp;|&nbsp;
    Powered by NASA FIRMS Satellite Data
</p>""", unsafe_allow_html=True)
st.markdown("---")

# ============================================================
# PAGE 1 — RISK PREDICTOR
# ============================================================

if page == "🔴 Risk Predictor":

    st.markdown(f"""
    <div style='background:{rc["bg"]}; border:2px solid {rc["border"]};
                border-radius:20px; padding:32px 40px;
                display:flex; align-items:center;
                justify-content:space-between; margin-bottom:24px;'>
        <div>
            <div style='font-size:13px; color:#aaa; letter-spacing:3px;
                        text-transform:uppercase; margin-bottom:8px;'>
                PREDICTED FIRE RISK LEVEL</div>
            <div style='font-size:64px; font-weight:900; color:{rc["color"]};
                        letter-spacing:6px; line-height:1; margin-bottom:12px;'>
                {rc["label"]}</div>
            <div style='font-size:15px; color:#ccc;'>{rc["desc"]}</div>
        </div>
        <div style='text-align:right;'>
            <div style='font-size:80px; line-height:1;'>{rc["emoji"]}</div>
            <div style='font-size:13px; color:#888; margin-top:8px;'>
                {MONTHS[month-1]} · {SEASONS[season]}</div>
            <div style='font-size:13px; color:#888;'>
                {latitude:.1f}°N, {longitude:.1f}°E</div>
        </div>
    </div>""", unsafe_allow_html=True)

    c1,c2,c3 = st.columns(3)
    cc_list = [
        {"name":"Low Risk",    "emoji":"🟢","color":"#2ecc71","bg":"rgba(46,204,113,0.08)"},
        {"name":"Medium Risk", "emoji":"🟡","color":"#f39c12","bg":"rgba(243,156,18,0.08)"},
        {"name":"High Risk",   "emoji":"🔴","color":"#e74c3c","bg":"rgba(231,76,60,0.08)"},
    ]
    for i,(cls,p) in enumerate(zip(model.classes_, prob)):
        cc = cc_list[i]; bw = "3px" if cls==pred else "1px"
        with [c1,c2,c3][i]:
            st.markdown(f"""
            <div style='background:{cc["bg"]}; border:{bw} solid {cc["color"]};
                        border-radius:16px; padding:20px; text-align:center;'>
                <div style='font-size:32px;'>{cc["emoji"]}</div>
                <div style='font-size:13px; color:#aaa; margin:6px 0 4px;'>{cc["name"]}</div>
                <div style='font-size:40px; font-weight:800;
                            color:{cc["color"]}; line-height:1;'>{p*100:.1f}%</div>
                <div style='margin-top:10px; background:rgba(255,255,255,0.05);
                            border-radius:8px; height:8px; overflow:hidden;'>
                    <div style='background:{cc["color"]}; height:100%;
                                width:{p*100:.1f}%; border-radius:8px;'></div>
                </div>
            </div>""", unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)
    s1,s2,s3,s4 = st.columns(4)
    stats = [
        ("BRIGHTNESS", f"{brightness:.0f}K","#4ecca3",
         "🔴 Extreme" if brightness>355 else "🟡 High" if brightness>335 else "🟢 Normal"),
        ("FIRE POWER",  f"{frp:.0f} MW",   "#e67e22",
         "🔴 Extreme" if frp>60 else "🟡 Strong" if frp>25 else "🟢 Moderate"),
        ("SEASON", SEASONS[season], "#e74c3c" if is_dry else "#2ecc71",
         "⚠️ Dry Season" if is_dry else "✅ Wet Season"),
        ("FIRE ENERGY", f"{fire_energy:,.0f}","#9b59b6","Brightness × FRP"),
    ]
    for col,(lbl,val,color,sub) in zip([s1,s2,s3,s4],stats):
        with col:
            st.markdown(f"""
            <div style='background:rgba(255,255,255,0.04);
                        border:1px solid rgba(255,255,255,0.1);
                        border-radius:12px; padding:16px; text-align:center;'>
                <div style='font-size:11px; color:#888; text-transform:uppercase;
                            letter-spacing:2px;'>{lbl}</div>
                <div style='font-size:26px; font-weight:700;
                            color:{color}; margin:6px 0;'>{val}</div>
                <div style='font-size:12px; color:#aaa;'>{sub}</div>
            </div>""", unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)
    cl, cr = st.columns(2)
    with cl:
        st.markdown("<div style='font-size:16px; font-weight:600; color:#4ecca3; margin-bottom:12px;'>🧠 How the model decided</div>", unsafe_allow_html=True)
        fn  = ["fire_energy","frp","day_of_year","month","is_dry_season","season","brightness","longitude","latitude"]
        imp = model.feature_importances_
        fig,ax = plt.subplots(figsize=(7,4))
        fig.patch.set_facecolor("#0f2027"); ax.set_facecolor("#0f2027")
        si = np.argsort(imp)
        fc = ["#e74c3c" if imp[i]>0.2 else "#f39c12" if imp[i]>0.08 else "#3498db" for i in si]
        bars = ax.barh([fn[i] for i in si],[imp[i] for i in si],color=fc,height=0.6)
        ax.set_xlabel("Importance",color="#aaa",fontsize=10)
        ax.tick_params(colors="#ccc",labelsize=9)
        for sp in ["top","right"]: ax.spines[sp].set_visible(False)
        for sp in ["bottom","left"]: ax.spines[sp].set_color("#333")
        for bar,val in zip(bars,[imp[i] for i in si]):
            ax.text(val+0.003,bar.get_y()+bar.get_height()/2,
                    f"{val:.3f}",va="center",color="#ccc",fontsize=8)
        plt.tight_layout(); st.pyplot(fig); plt.close()

    with cr:
        st.markdown("<div style='font-size:16px; font-weight:600; color:#4ecca3; margin-bottom:12px;'>📖 Risk Level Guide</div>", unsafe_allow_html=True)
        tips = {
            0:["Low fire intensity","Usually monsoon season","Normal farming safe","No action needed"],
            1:["Moderate fire conditions","Transition season","Avoid open burning","Monitor weather daily"],
            2:["Extreme fire intensity","Dry season peak","Alert fire authority","Evacuate if near forest"],
        }
        for level,config in RC.items():
            th = "".join([f"<li style='margin:3px 0;'>{t}</li>" for t in tips[level]])
            st.markdown(f"""
            <div style='background:{config["bg"]}; border-left:4px solid {config["color"]};
                        border-radius:0 10px 10px 0; padding:12px 16px; margin-bottom:10px;'>
                <div style='font-weight:700; color:{config["color"]}; font-size:15px; margin-bottom:6px;'>
                    {config["emoji"]} {config["label"]} RISK</div>
                <ul style='margin:0; padding-left:16px; color:#ccc; font-size:12px;'>{th}</ul>
            </div>""", unsafe_allow_html=True)

# ============================================================
# PAGE 2 — FIRE MAP (FAST VERSION)
# ============================================================

elif page == "🗺️ Fire Map":

    st.markdown("""
    <div style='font-size:20px; font-weight:600; color:#4ecca3; margin-bottom:4px;'>
        🗺️ NASA Fire Events — India Interactive Map</div>
    <div style='font-size:13px; color:#888; margin-bottom:16px;'>
        Every dot = one real fire detected by NASA satellite.
        Color = risk level. Zoom in to explore regions.
    </div>""", unsafe_allow_html=True)

    mc1,mc2,mc3 = st.columns(3)
    with mc1:
        map_type = st.selectbox("Map Style",
            ["⚡ Fast Dot Map","🌡️ Heat Map","📅 Monthly View"])
    with mc2:
        month_filter = st.selectbox("Filter by Month",
            ["All months"]+[f"{MONTHS[i]} ({i+1})" for i in range(12)])
    with mc3:
        risk_filter = st.selectbox("Filter by Risk",
            ["All risk levels","High only","Medium + High"])

    # Apply filters
    map_df = fire_df.copy()
    if month_filter != "All months":
        m_num = int(month_filter.split("(")[1].replace(")",""))
        map_df = map_df[map_df["month"] == m_num]
    if risk_filter == "High only":
        map_df = map_df[map_df["risk_label"]=="High"]
    elif risk_filter == "Medium + High":
        map_df = map_df[map_df["risk_label"].isin(["Medium","High"])]

    # Smart sampling — keep enough for visual density but stay fast
    max_dots = 1500
    if len(map_df) > max_dots:
        # Stratified sample — keep proportional High/Medium/Low
        map_df = map_df.groupby("risk_label", group_keys=False).apply(
            lambda x: x.sample(min(len(x), int(max_dots * len(x)/len(map_df))),
                               random_state=42)
        )

    st.markdown(f"""
    <div style='font-size:12px; color:#888; margin-bottom:8px;'>
        Showing <b style='color:#4ecca3;'>{len(map_df):,}</b> fire events &nbsp;|&nbsp;
        🟢 Low &nbsp;🟡 Medium &nbsp;🔴 High &nbsp;|&nbsp;
        ⭐ = your selected location
    </div>""", unsafe_allow_html=True)

    # Build map
    india_map = folium.Map(
        location=[22.5, 82.0],
        zoom_start=5,
        tiles="CartoDB dark_matter",
        prefer_canvas=True   # ← KEY: uses HTML canvas instead of SVG
    )                        #   Much faster for many markers

    if map_type == "⚡ Fast Dot Map":
        # FastMarkerCluster = renders thousands of dots instantly
        # Uses canvas rendering — 10x faster than CircleMarker loop

        # Build callback that colors each dot by risk
        # We pass data as [lat, lng, color, size, label]
        callback = """
        function(row) {
            var color = row[2];
            var size  = row[3];
            var label = row[4];
            var marker = L.circleMarker(
                new L.LatLng(row[0], row[1]),
                {
                    radius: size,
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.7,
                    weight: 1
                }
            );
            marker.bindTooltip(label);
            return marker;
        }
        """
        dot_data = map_df[["latitude","longitude","risk_color",
                            "dot_size","risk_label"]].values.tolist()

        FastMarkerCluster(
            data=dot_data,
            callback=callback,
            disableClusteringAtZoom=7   # show individual dots when zoomed in
        ).add_to(india_map)

    elif map_type == "🌡️ Heat Map":
        heat_data = map_df[["latitude","longitude","frp"]].values.tolist()
        HeatMap(heat_data, min_opacity=0.3, radius=14, blur=10,
                gradient={0.2:"blue",0.45:"lime",0.65:"yellow",1.0:"red"}
        ).add_to(india_map)

    elif map_type == "📅 Monthly View":
        # Show each month as a separate colored layer
        month_colors = {
            1:"#3498db",2:"#2980b9",3:"#e67e22",4:"#e74c3c",
            5:"#c0392b",6:"#27ae60",7:"#1abc9c",8:"#16a085",
            9:"#2ecc71",10:"#f39c12",11:"#d35400",12:"#8e44ad"
        }
        sample_monthly = map_df.sample(min(1000, len(map_df)), random_state=42)
        for _,row in sample_monthly.iterrows():
            folium.CircleMarker(
                location=[row["latitude"],row["longitude"]],
                radius=3,
                color=month_colors.get(row["month"],"#888"),
                fill=True,
                fill_color=month_colors.get(row["month"],"#888"),
                fill_opacity=0.6,
                tooltip=f"{MONTHS[row['month']-1]} · {row['risk_label']}"
            ).add_to(india_map)

    # Your selected location — always shown
    folium.Marker(
        location=[latitude, longitude],
        popup=folium.Popup(
            f"<div style='font-family:Arial; width:180px;'>"
            f"<b>⭐ Your Location</b><br>"
            f"<b>Prediction:</b> {rc['label']} risk<br>"
            f"<b>Confidence:</b> {max(prob)*100:.0f}%<br>"
            f"<b>Month:</b> {MONTHS[month-1]}<br>"
            f"<b>Brightness:</b> {brightness}K · FRP: {frp}MW"
            f"</div>", max_width=200),
        icon=folium.Icon(color="purple", icon="star", prefix="fa"),
        tooltip=f"⭐ Your location — {rc['label']} risk"
    ).add_to(india_map)

    # Render map — use_container_width makes it fill the screen
    st_folium(india_map, width=None, height=520,
              use_container_width=True,
              returned_objects=[])   # don't return click data = faster

    # Stats below map
    st.markdown("---")
    t1,t2,t3,t4 = st.columns(4)
    rc_counts = fire_df["risk_label"].value_counts()
    peak_m    = fire_df["month"].value_counts().idxmax()
    for col,(lbl,key,color) in zip([t1,t2,t3],[
        ("🔴 HIGH RISK FIRES",  "High",   "#e74c3c"),
        ("🟡 MEDIUM RISK FIRES","Medium", "#f39c12"),
        ("🟢 LOW RISK FIRES",   "Low",    "#2ecc71"),
    ]):
        with col:
            st.markdown(f"""
            <div style='background:rgba(255,255,255,0.04);
                        border:1px solid {color}; border-radius:12px;
                        padding:16px; text-align:center;'>
                <div style='font-size:11px; color:#888;'>{lbl}</div>
                <div style='font-size:32px; font-weight:700; color:{color};'>
                    {rc_counts.get(key,0):,}</div>
            </div>""", unsafe_allow_html=True)
    with t4:
        st.markdown(f"""
        <div style='background:rgba(255,255,255,0.04);
                    border:1px solid #9b59b6; border-radius:12px;
                    padding:16px; text-align:center;'>
            <div style='font-size:11px; color:#888;'>🔥 PEAK FIRE MONTH</div>
            <div style='font-size:32px; font-weight:700; color:#9b59b6;'>
                {MONTHS[peak_m-1]}</div>
        </div>""", unsafe_allow_html=True)

# Footer
st.markdown("---")
st.markdown("""
<div style='text-align:center; color:#555; font-size:12px; padding:8px 0;'>
    🌿 ClimateGuard AI &nbsp;|&nbsp; NASA FIRMS MODIS Satellite Data &nbsp;|&nbsp;
    Random Forest ML · 93.3% Accuracy &nbsp;|&nbsp; 41,000+ Training Fire Events
</div>""", unsafe_allow_html=True)