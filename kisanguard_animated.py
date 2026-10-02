# ============================================================
#   KisanGuard AI — Complete Bilingual Farmer Dashboard
#   Run: python -m streamlit run kisanguard_animated.py
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
import matplotlib.gridspec as gridspec
from PIL import Image

# Check if Twilio is installed
try:
    from twilio.rest import Client
    twilio_available = True
except ImportError:
    twilio_available = False

# ============================================================
# Page Configuration
# ============================================================
st.set_page_config(
    page_title="KisanGuard AI",
    page_icon="🌾",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ============================================================
# Translations Dictionary (English, Hindi, Gujarati)
# ============================================================
TL = {
    "en": {
        "title": "KisanGuard AI",
        "subtitle": "Hyperlocal fire risk for Indian farmers · NASA satellite data",
        "nav": "Navigation Selection",
        "p_predictor": "🌾 Kisan Risk Predictor",
        "p_photo": "📸 Field Photo Detector",
        "p_crop": "🌱 Crop Advisor Engine",
        "p_whatsapp": "📱 WhatsApp Alerts",
        "p_map": "🗺️ Fire Hotspot Map",
        "p_analytics": "📊 Fire Analytics",
        "p_about": "ℹ️ About KisanGuard",
        
        # Sidebar sliders
        "brightness_lbl": "Brightness (Kelvin)",
        "frp_lbl": "Fire Power (MW)",
        "month_lbl": "Observation Month",
        "lat_lbl": "Latitude (°N)",
        "lon_lbl": "Longitude (°E)",
        "fire_cond": "🔥 Fire Conditions",
        "when_lbl": "📅 When?",
        "loc_lbl": "📍 Your Location",
        "sidebar_sub": "Hyperlocal fire risk · NASA satellite data",
        "sidebar_foot": "Data: NASA FIRMS MODIS India 2024\nModel: Random Forest · 93.3% accuracy\nBuilt for Indian farmers 🌾",
        
        # Risk levels
        "low_lbl": "LOW",
        "med_lbl": "MEDIUM",
        "high_lbl": "HIGH",
        
        # Risk Predictor
        "predicted_risk": "PREDICTED FIRE RISK LEVEL",
        "model_conf": "Model Confidence",
        "how_decided": "🧠 How the model decided",
        "risk_guide": "📖 Risk Level Guide",
        
        # Stats
        "brightness": "BRIGHTNESS",
        "fire_power": "FIRE POWER",
        "season": "SEASON",
        "fire_energy": "FIRE ENERGY",
        "brightness_sub_extreme": "🔴 Extreme",
        "brightness_sub_high": "🟡 High",
        "brightness_sub_normal": "🟢 Normal",
        "frp_sub_extreme": "🔴 Extreme",
        "frp_sub_strong": "🟡 Strong",
        "frp_sub_moderate": "🟢 Moderate",
        "frp_sub_low": "🟢 Low",
        "dry_season_alert": "⚠️ Dry Season",
        "wet_season_alert": "✅ Wet Season",
        "fire_energy_desc": "Brightness × FRP",
        "read_aloud": "🔊 Read Prediction Aloud",
        
        # Map Filters
        "map_style": "Map Style",
        "filter_month": "Filter by Month",
        "filter_risk": "Filter by Risk",
        "all_months": "All months",
        "all_risks": "All risk levels",
        "high_only": "High only",
        "med_high": "Medium + High",
        "map_type_dot": "⚡ Fast Dot Map",
        "map_type_heat": "🌡️ Heat Map",
        "map_showing": "Showing {count:,} fire events | 🟢 Low 🟡 Medium 🔴 High | ⭐ = your location",
        "map_legend_high": "🔴 HIGH RISK",
        "map_legend_med": "🟡 MEDIUM RISK",
        "map_legend_low": "🟢 LOW RISK",
        "map_peak_month": "🔥 PEAK MONTH",
        
        # Photo Detector
        "pd_title": "📸 Computer Vision Field Photo Detector",
        "pd_desc": "Upload a photo of your field. Our lightweight color analysis model will scan it for dry crop residues, straw, smoke, and active fire spots.",
        "pd_upload_lbl": "Choose a field photo...",
        "pd_no_img": "Please upload an image to begin color analysis.",
        "pd_results": "Visual Pattern Analysis Results",
        "pd_dry_biomass": "Dry Biomass (Stubble/Straw)",
        "pd_smoke_haze": "Smoke Haze Signature",
        "pd_flame_intensity": "Active Flame Indicator",
        "pd_normal_veg": "Green Vegetation / Soil",
        "pd_assess": "AI Photo Assessment Result",
        
        # Crop Advisor
        "ca_title": "🌱 Crop Recommendation & Stubble Avoidance Engine",
        "ca_desc": "Assess crop compatibility, calculate potential profits using Minimum Support Prices (MSP), and receive warnings against stubble-burning crops during dry seasons.",
        "ca_state": "Select State",
        "ca_district": "Enter District Name",
        "ca_land": "Land Size (in acres)",
        "ca_season": "Crop Season",
        "ca_crop_select": "Crop you plan to sow",
        "ca_calculate": "Generate Crop Report",
        "ca_report": "🌾 Agricultural Recommendations Report",
        "ca_risk_warning": "⚠️ HIGH FIRE RISK ALERT FOR THIS SEASON",
        "ca_risk_warning_desc": "Your location has a high fire danger in this season. We advise against stubble-producing crops like Paddy (Rice) to avoid fire accidents. Consider safer options below.",
        "ca_safe_season": "✅ SAFE SOWING SEASON",
        "ca_safe_season_desc": "Fire risk is minimal. Standard crops can be grown safely.",
        "ca_msp_val": "Govt MSP Rate",
        "ca_exp_yield": "Average Yield / Acre",
        "ca_est_revenue": "Projected Gross Income",
        "ca_est_cost": "Estimated Sowing Cost",
        "ca_net_profit": "Expected Net Profit",
        "ca_rec_title": "Alternative Low-Fire-Risk Crop Recommendation",
        
        # WhatsApp Alerts
        "wa_title": "📱 KisanGuard Weekly WhatsApp Warning System",
        "wa_sub": "Register your village to receive early satellite-based fire warnings directly to your phone every Monday morning.",
        "wa_name": "Farmer / Coordinator Name",
        "wa_phone": "WhatsApp Number (with +91 country code)",
        "wa_village": "Village / Tehsil Name",
        "wa_subscribe": "Subscribe to Weekly Alerts 🔔",
        "wa_success": "Registration complete! You will receive weekly satellite reports.",
        "wa_sub_title": "Active WhatsApp Subscription Mockup",
        "wa_sim_mode": "🔔 Running in Simulation Mode (Credentials optional)",
        "wa_test_btn": "Send Test Demo Alert 💬",
        "wa_msg_sent": "Simulated WhatsApp message dispatched!",
        "wa_twilio_settings": "⚙️ Advanced Twilio Settings (For real WhatsApp messages)",
        
        # Analytics
        "an_title": "📊 Climate Fire Analytics — India 2024",
        "an_desc": "Deep analysis of 41,000+ NASA satellite fire observations",
        "an_total": "TOTAL FIRE EVENTS",
        "an_peak_b": "PEAK BRIGHTNESS",
        "an_peak_frp": "PEAK FIRE POWER",
        "an_avg_frp": "AVG FIRE POWER",
        "an_monthly_count": "🔥 Monthly Fire Count — Full Year",
        "an_avg_bright": "🌡️ Average Fire Brightness by Month",
        "an_risk_season": "🗂️ Risk Level by Season",
        "an_frp_dist": "⚡ Fire Power Distribution",
    },
    "hi": {
        "title": "किसानगार्ड AI",
        "subtitle": "भारतीय किसानों के लिए सटीक आग का जोखिम · नासा उपग्रह डेटा",
        "nav": "नेविगेशन चयन",
        "p_predictor": "🌾 किसान जोखिम संकेतक",
        "p_photo": "📸 खेत फोटो विश्लेषक",
        "p_crop": "🌱 फसल सलाहकार इंजन",
        "p_whatsapp": "📱 व्हाट्सएप अलर्ट",
        "p_map": "🗺️ आग का नक्शा",
        "p_analytics": "📊 आग का विश्लेषण",
        "p_about": "ℹ️ किसानगार्ड के बारे में",
        
        # Sidebar sliders
        "brightness_lbl": "चमक (केल्विन)",
        "frp_lbl": "आग की शक्ति (FRP)",
        "month_lbl": "अवलोकन का महीना",
        "lat_lbl": "अक्षांश (Latitude °N)",
        "lon_lbl": "रेखांश (Longitude °E)",
        "fire_cond": "🔥 आग की स्थिति",
        "when_lbl": "📅 कब?",
        "loc_lbl": "📍 आपका स्थान",
        "sidebar_sub": "भारतीय किसानों के लिए नासा उपग्रह आग जोखिम",
        "sidebar_foot": "डेटा: नासा फर्म्स मोडिस 2024\nमॉडल: रैंडम फॉरेस्ट · 93.3% सटीकता\nकिसानों के लिए निर्मित 🌾",
        
        # Risk levels
        "low_lbl": "कम",
        "med_lbl": "मध्यम",
        "high_lbl": "उच्च",
        
        # Risk Predictor
        "predicted_risk": "अनुमानित आग का जोखिम स्तर",
        "model_conf": "मॉडल का भरोसा",
        "how_decided": "🧠 मॉडल ने निर्णय कैसे लिया",
        "risk_guide": "📖 जोखिम स्तर गाइड",
        
        # Stats
        "brightness": "चमक",
        "fire_power": "आग की शक्ति",
        "season": "मौसम",
        "fire_energy": "आग की ऊर्जा",
        "brightness_sub_extreme": "🔴 अत्यधिक",
        "brightness_sub_high": "🟡 उच्च",
        "brightness_sub_normal": "🟢 सामान्य",
        "frp_sub_extreme": "🔴 अत्यधिक",
        "frp_sub_strong": "🟡 मजबूत",
        "frp_sub_moderate": "🟢 मध्यम",
        "frp_sub_low": "🟢 कम",
        "dry_season_alert": "⚠️ सूखा मौसम",
        "wet_season_alert": "✅ गीला मौसम",
        "fire_energy_desc": "चमक × शक्ति",
        "read_aloud": "🔊 जोखिम रिपोर्ट ज़ोर से सुनें",
        
        # Map Filters
        "map_style": "नक्शे का स्टाइल",
        "filter_month": "महीने के अनुसार फ़िल्टर करें",
        "filter_risk": "जोखिम के अनुसार फ़िल्टर करें",
        "all_months": "सभी महीने",
        "all_risks": "सभी जोखिम स्तर",
        "high_only": "केवल उच्च",
        "med_high": "मध्यम + उच्च",
        "map_type_dot": "⚡ फ़ास्ट बिंदु नक्शा",
        "map_type_heat": "🌡️ हीट मैप (गर्मी नक्शा)",
        "map_showing": "दिखा रहा है {count:,} आग की घटनाएं | 🟢 कम 🟡 मध्यम 🔴 उच्च | ⭐ = आपका स्थान",
        "map_legend_high": "🔴 उच्च जोखिम",
        "map_legend_med": "🟡 मध्यम जोखिम",
        "map_legend_low": "🟢 कम जोखिम",
        "map_peak_month": "🔥 चरम महीना",
        
        # Photo Detector
        "pd_title": "📸 कंप्यूटर विजन खेत फोटो विश्लेषक",
        "pd_desc": "अपने खेत की फोटो अपलोड करें। हमारा हल्का कलर एनालिसिस मॉडल सूखी फसल अवशेषों, पराली, धुएं और आग के सक्रिय स्थानों को स्कैन करेगा।",
        "pd_upload_lbl": "खेत की फोटो चुनें...",
        "pd_no_img": "रंग विश्लेषण शुरू करने के लिए कृपया एक छवि अपलोड करें।",
        "pd_results": "दृश्य पैटर्न विश्लेषण परिणाम",
        "pd_dry_biomass": "सूखी पराली / बायोमास",
        "pd_smoke_haze": "धुआं और धुंध संकेतक",
        "pd_flame_intensity": "सक्रिय आग की लपटें",
        "pd_normal_veg": "हरी वनस्पति / मिट्टी",
        "pd_assess": "AI फोटो मूल्यांकन परिणाम",
        
        # Crop Advisor
        "ca_title": "🌱 फसल अनुकूलता और पराली नियंत्रण इंजन",
        "ca_desc": "फसल अनुकूलता का आकलन करें, सरकार के न्यूनतम समर्थन मूल्य (MSP) का उपयोग करके लाभ की गणना करें, और सूखे मौसम में पराली वाली फसलों के लिए चेतावनी प्राप्त करें।",
        "ca_state": "राज्य चुनें",
        "ca_district": "जिले का नाम दर्ज करें",
        "ca_land": "भूमि का आकार (एकड़ में)",
        "ca_season": "फसल का मौसम",
        "ca_crop_select": "फसल जिसे आप बोना चाहते हैं",
        "ca_calculate": "फसल रिपोर्ट तैयार करें",
        "ca_report": "🌾 कृषि सलाह रिपोर्ट",
        "ca_risk_warning": "⚠️ इस मौसम के लिए उच्च आग का खतरा",
        "ca_risk_warning_desc": "इस मौसम में आपके स्थान पर आग लगने का खतरा अधिक है। हम धान (चावल) जैसी फसलों को बोने से बचने की सलाह देते हैं जिनके अवशेषों को जलाया जाता है। कृपया नीचे दिए गए सुरक्षित विकल्पों पर विचार करें।",
        "ca_safe_season": "✅ सुरक्षित बुवाई का मौसम",
        "ca_safe_season_desc": "आग का खतरा न्यूनतम है। सामान्य फसलें सुरक्षित रूप से उगाई जा सकती हैं।",
        "ca_msp_val": "सरकारी MSP दर",
        "ca_exp_yield": "औसत उपज / एकड़",
        "ca_est_revenue": "अनुमानित कुल आय",
        "ca_est_cost": "अनुमानित बुवाई लागत",
        "ca_net_profit": "अनुमानित शुद्ध लाभ",
        "ca_rec_title": "वैकल्पिक कम आग जोखिम वाली फसल की सलाह",
        
        # WhatsApp Alerts
        "wa_title": "📱 किसानगार्ड साप्ताहिक व्हाट्सएप चेतावनी प्रणाली",
        "wa_sub": "हर सोमवार सुबह सीधे अपने फोन पर नासा उपग्रह-आधारित शुरुआती आग की चेतावनी प्राप्त करने के लिए अपने गांव को पंजीकृत करें।",
        "wa_name": "किसान / समन्वयक का नाम",
        "wa_phone": "व्हाट्सएप नंबर (+91 देश कोड के साथ)",
        "wa_village": "गांव / तहसील का नाम",
        "wa_subscribe": "साप्ताहिक अलर्ट सब्सक्राइब करें 🔔",
        "wa_success": "पंजीकरण पूरा हुआ! आपको साप्ताहिक उपग्रह रिपोर्ट प्राप्त होगी।",
        "wa_sub_title": "सक्रिय व्हाट्सएप सब्सक्रिप्शन मॉकअप",
        "wa_sim_mode": "🔔 सिमुलेशन मोड में चल रहा है (क्रेडेंशियल वैकल्पिक हैं)",
        "wa_test_btn": "डेमो टेस्ट अलर्ट भेजें 💬",
        "wa_msg_sent": "सिमुलेटेड व्हाट्सएप संदेश भेजा गया!",
        "wa_twilio_settings": "⚙️ उन्नत ट्विलियो सेटिंग्स (असली व्हाट्सएप संदेशों के लिए)",
        
        # Analytics
        "an_title": "📊 जलवायु आग विश्लेषण — भारत 2024",
        "an_desc": "41,000+ नासा उपग्रह आग अवलोकनों का गहरा विश्लेषण",
        "an_total": "कुल आग की घटनाएं",
        "an_peak_b": "अधिकतम चमक तापमान",
        "an_peak_frp": "अधिकतम आग की शक्ति",
        "an_avg_frp": "औसत आग की शक्ति",
        "an_monthly_count": "🔥 मासिक आग की गिनती — पूरा वर्ष",
        "an_avg_bright": "🌡️ महीने के अनुसार औसत आग चमक",
        "an_risk_season": "🗂️ मौसम के अनुसार जोखिम का स्तर",
        "an_frp_dist": "⚡ आग की शक्ति का वितरण",
    },
    "gu": {
        "title": "કિસાનગાર્ડ AI",
        "subtitle": "ખેડૂતો માટે આગનું જોખમ દર્શાવતું મોડેલ · નાસા સેટેલાઇટ ડેટા",
        "nav": "નેવિગેશન પસંદગી",
        "p_predictor": "🌾 કિસાન જોખમ સૂચક",
        "p_photo": "📸 ખેતર ફોટો વિશ્લેષક",
        "p_crop": "🌱 પાક સલાહકાર એન્જિન",
        "p_whatsapp": "📱 વોટ્સએપ એલર્ટ",
        "p_map": "🗺️ આગનો નકશો",
        "p_analytics": "📊 આગનું વિશ્લેષણ",
        "p_about": "ℹ️ કિસાનગાર્ડ વિશે",
        
        # Sidebar sliders
        "brightness_lbl": "દ્રશ્યમાન ગરમી (Kelvin)",
        "frp_lbl": "આગ શક્તિ (MW)",
        "month_lbl": "અવલોકન મહિનો",
        "lat_lbl": "અક્ષાંશ (Latitude °N)",
        "lon_lbl": "રેખાંશ (Longitude °E)",
        "fire_cond": "🔥 આગની સ્થિતિ",
        "when_lbl": "📅 ક્યારે?",
        "loc_lbl": "📍 તમારું સ્થાન",
        "sidebar_sub": "ખેડૂતો માટે નાસા સેટેલાઇટ આગ જોખમ સૂચક",
        "sidebar_foot": "ડેટા: નાસા ફર્મ્સ મોડીસ 2024\nમોડેલ: રેન્ડમ ફોરેસ્ટ · 93.3% ચોકસાઈ\nખેડૂતો માટે બનાવેલ 🌾",
        
        # Risk levels
        "low_lbl": "ઓછું",
        "med_lbl": "મધ્યમ",
        "high_lbl": "વધુ",
        
        # Risk Predictor
        "predicted_risk": "આગનું જોખમ સ્તર",
        "model_conf": "મોડેલનો આત્મવિશ્વાસ",
        "how_decided": "🧠 મોડેલે નિર્ણય કેવી રીતે લીધો",
        "risk_guide": "📖 જોખમ સ્તર માર્ગદર્શિકા",
        
        # Stats
        "brightness": "ચમક",
        "fire_power": "આગની શક્તિ",
        "season": "ઋતુ",
        "fire_energy": "આગની ઉર્જા",
        "brightness_sub_extreme": "🔴 અતિ ભારે",
        "brightness_sub_high": "🟡 ભારે",
        "brightness_sub_normal": "🟢 સામાન્ય",
        "frp_sub_extreme": "🔴 અતિ ભારે",
        "frp_sub_strong": "🟡 મજબૂત",
        "frp_sub_moderate": "🟢 મધ્યમ",
        "frp_sub_low": "🟢 ઓછું",
        "dry_season_alert": "⚠️ સૂકી ઋતુ",
        "wet_season_alert": "✅ વરસાદી ઋતુ",
        "fire_energy_desc": "ચમક × શક્તિ",
        "read_aloud": "🔊 જોખમ અહેવાલ મોટેથી સાંભળો",
        
        # Map Filters
        "map_style": "નકશા શૈલી",
        "filter_month": "મહિના ફિલ્ટર",
        "filter_risk": "જોખમ ફિલ્ટર",
        "all_months": "બધા મહિના",
        "all_risks": "બધા જોખમો",
        "high_only": "માત્ર વધુ",
        "med_high": "મધ્યમ + વધુ",
        "map_type_dot": "⚡ ઝડપી બિંદુ નકશો",
        "map_type_heat": "🌡️ હીટ મેપ (ગરમી નકશો)",
        "map_showing": "બતાવી રહ્યું છે {count:,} આગ અકસ્માત | 🟢 ઓછું 🟡 મધ્યમ 🔴 વધુ | ⭐ = તમારું સ્થાન",
        "map_legend_high": "🔴 વધુ જોખમ",
        "map_legend_med": "🟡 મધ્યમ જોખમ",
        "map_legend_low": "🟢 ઓછું જોખમ",
        "map_peak_month": "🔥 મુખ્ય મહિનો",
        
        # Photo Detector
        "pd_title": "📸 કોમ્પ્યુટર વિઝન ખેતર ફોટો વિશ્લેષક",
        "pd_desc": "તમારા ખેતરનો ફોટો અપલોડ કરો. અમારું હલકું કલર એનાલિસિસ મોડલ કચરો, સૂકી પરાલી, ધુમાડો અને આગની લપટોને શોધી કાઢશે.",
        "pd_upload_lbl": "ખેતરનો ફોટો પસંદ કરો...",
        "pd_no_img": "કલર વિશ્લેષણ શરૂ કરવા માટે કૃપા કરીને ફોટો અપલોડ કરો.",
        "pd_results": "વિઝ્યુઅલ પેટર્ન વિશ્લેષણ પરિણામો",
        "pd_dry_biomass": "સૂકો કચરો / પરાલી",
        "pd_smoke_haze": "ધુમાડો અને ધુમ્મસ",
        "pd_flame_intensity": "સક્રિય આગની લપટો",
        "pd_normal_veg": "લીલી વનસ્પતિ / જમીન",
        "pd_assess": "AI ફોટો જોખમ પરિણામ",
        
        # Crop Advisor
        "ca_title": "🌱 પાક આયોજન અને પરાલી વ્યવસ્થાપન એન્જિન",
        "ca_desc": "પાકની અનુકૂળતા તપાસો, લઘુત્તમ ટેકાના ભાવ (MSP) પરથી નફાની ગણતરી કરો અને જોખમી ઋતુઓમાં પરાલીવાળા પાકો વાવવા સામે ચેતવણી મેળવો.",
        "ca_state": "રાજ્ય પસંદ કરો",
        "ca_district": "જિલ્લાનું નામ લખો",
        "ca_land": "જમીનનું માપ (એકરમાં)",
        "ca_season": "પાકની ઋતુ",
        "ca_crop_select": "કયો પાક વાવવો છે?",
        "ca_calculate": "પાક અહેવાલ બનાવો",
        "ca_report": "🌾 કૃષિ માર્ગદર્શન અહેવાલ",
        "ca_risk_warning": "⚠️ આ ઋતુ માટે આગનું વધુ જોખમ",
        "ca_risk_warning_desc": "આ ઋતુમાં તમારા વિસ્તારમાં આગનું જોખમ ઘણું વધારે છે. તેથી પરાલી છોડતા પાકો (જેમ કે ડાંગર/ચોખા) વાવવાનું ટાળો જેથી આગના અકસ્માતોથી બચી શકાય. નીચેના સુરક્ષિત વિકલ્પો વિચારો.",
        "ca_safe_season": "✅ સુરક્ષિત વાવણીની ઋતુ",
        "ca_safe_season_desc": "આગનું જોખમ નહિવત છે. સામાન્ય પાકો સુરક્ષિત રીતે વાવી શકાય છે.",
        "ca_msp_val": "સરકારી ટેકાના ભાવ (MSP)",
        "ca_exp_yield": "સરેરાશ ઉત્પાદન / એકર",
        "ca_est_revenue": "અંદાજિત કુલ આવક",
        "ca_est_cost": "અંદાજિત વાવણી ખર્ચ",
        "ca_net_profit": "અંદાજિત ચોખ્ખો નફો",
        "ca_rec_title": "વૈકલ્પિક ઓછા જોખમ વાળા પાકની ભલામણ",
        
        # WhatsApp Alerts
        "wa_title": "📱 કિસાનગાર્ડ સાપ્તાહિક વોટ્સએપ ચેતવણી સિસ્ટમ",
        "wa_sub": "દર સોમવારે સવારે તમારા ફોન પર સેટેલાઇટ આધારિત આગની આગોતરી ચેતવણીઓ મેળવવા માટે તમારા ગામની નોંધણી કરો.",
        "wa_name": "ખેડૂત / સંયોજકનું નામ",
        "wa_phone": "વોટ્સએપ નંબર (+91 કોડ સાથે)",
        "wa_village": "ગામ / તાલુકાનું નામ",
        "wa_subscribe": "સાપ્તાહિક એલર્ટ સબ્સ્ક્રાઇબ કરો 🔔",
        "wa_success": "નોંધણી સફળ! તમને દર સોમવારે સાપ્તાહિક સેટેલાઇટ અહેવાલ મળશે.",
        "wa_sub_title": "સક્રિય વોટ્સએપ સબ્સ્ક્રિપ્શન મોકઅપ",
        "wa_sim_mode": "🔔 સિમ્યુલેશન મોડ ચાલુ છે (યુઝર આઈડી વૈકલ્પિક છે)",
        "wa_test_btn": "ટેસ્ટ ડેમો એલર્ટ મોકલો 💬",
        "wa_msg_sent": "સિમ્યુલેટેડ વોટ્સએપ સંદેશ મોકલવામાં આવ્યો!",
        "wa_twilio_settings": "⚙️ એડવાન્સ ટ્વિલિયો સેટિંગ્સ (સાચા વોટ્સએપ મેસેજ મોકલવા માટે)",
        
        # Analytics
        "an_title": "📊 આબોહવા આગ વિશ્લેષણ — ભારત 2024",
        "an_desc": "૪૧,૦૦૦ થી વધુ નાસા સેટેલાઇટ આગ અવલોકનોનું ઊંડાણપૂર્વક વિશ્લેષણ",
        "an_total": "કુલ આગ અકસ્માત",
        "an_peak_b": "મહત્તમ તાપમાન ચમક",
        "an_peak_frp": "મહત્તમ આગ ક્ષમતા",
        "an_avg_frp": "સરેરાશ આગ ક્ષમતા",
        "an_monthly_count": "🔥 માસિક આગ ઘટનાઓ — આખું વર્ષ",
        "an_avg_bright": "🌡️ મહિનો દીઠ સરેરાશ ચમક તાપમાન",
        "an_risk_season": "🗂️ ઋતુ અનુસાર જોખમ સ્તર",
        "an_frp_dist": "⚡ આગ શક્તિનું વિતરણ",
    }
}

# ============================================================
# Theme CSS & Animations
# ============================================================
st.markdown("""
<style>
/* ── Base ── */
.stApp { background: #0a1628; color: #fff; }
[data-testid="stSidebar"] {
    background: linear-gradient(180deg, #0d2137, #0a1628);
    border-right: 1px solid #1a3a5c;
}
[data-testid="stSidebar"] * { color: #d0e8cc !important; }
.block-container { padding-top: 0 !important; }

/* ── Grass animation ── */
@keyframes sway {
  0%,100% { transform: rotate(-4deg); }
  50%      { transform: rotate(4deg); }
}
@keyframes sway2 {
  0%,100% { transform: rotate(3deg); }
  50%      { transform: rotate(-5deg); }
}

/* ── Sun pulse ── */
@keyframes sunPulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(255,220,50,0.3); }
  50%      { box-shadow: 0 0 0 18px rgba(255,220,50,0); }
}

/* ── Smoke rise ── */
@keyframes smokeRise {
  0%   { transform: translateY(0) scale(0.8); opacity:0.7; }
  100% { transform: translateY(-60px) scale(2); opacity:0; }
}

/* ── Rain fall ── */
@keyframes rainFall {
  0%   { transform: translateY(-5px); opacity:0; }
  20%  { opacity:0.6; }
  100% { transform: translateY(90px); opacity:0; }
}

/* ── Cloud drift ── */
@keyframes cloudDrift {
  0%,100% { transform: translateX(0px); }
  50%      { transform: translateX(15px); }
}

/* ── Slide in ── */
@keyframes slideIn {
  from { opacity:0; transform:translateY(10px); }
  to   { opacity:1; transform:translateY(0); }
}

/* ── Runner bounce ── */
@keyframes runnerBounce {
  0%,100% { transform: translateY(0px); }
  50%      { transform: translateY(-8px); }
}

/* ── Farm scene container ── */
.farm-scene {
    border-radius: 20px;
    overflow: hidden;
    margin-bottom: 24px;
    animation: slideIn 0.5s ease;
    border: 1px solid rgba(255,255,255,0.08);
    position: relative;
}

/* ── Sky layers ── */
.sky-low {
    height: 120px;
    background: linear-gradient(180deg, #87CEEB 0%, #d4f5ff 100%);
    position: relative; overflow: hidden;
}
.sky-medium {
    height: 120px;
    background: linear-gradient(180deg, #f5d76e 0%, #f9e4a0 100%);
    position: relative; overflow: hidden;
}
.sky-high {
    height: 120px;
    background: linear-gradient(180deg, #c0392b 0%, #e8835a 100%);
    position: relative; overflow: hidden;
}

/* ── Ground layers ── */
.ground-low    { height: 80px; background: #4caf50; position: relative; overflow: hidden; }
.ground-medium { height: 80px; background: #c9a84c; position: relative; overflow: hidden; }
.ground-high   { height: 80px; background: #8b4513; position: relative; overflow: hidden; }

/* ── Sun ── */
.sun-low {
    position: absolute; width: 52px; height: 52px;
    background: #ffe066; border-radius: 50%;
    top: 25px; left: 60px;
    animation: sunPulse 3s ease-in-out infinite;
}
.sun-medium {
    position: absolute; width: 52px; height: 52px;
    background: #f39c12; border-radius: 50%;
    top: 20px; left: 60px;
    animation: sunPulse 2s ease-in-out infinite;
}
.sun-high {
    position: absolute; width: 52px; height: 52px;
    background: #e74c3c; border-radius: 50%;
    top: 18px; left: 60px;
    animation: sunPulse 1.5s ease-in-out infinite;
}

/* ── Clouds ── */
.cloud {
    position: absolute; border-radius: 25px;
    animation: cloudDrift ease-in-out infinite;
}

/* ── Grass blades ── */
.blade {
    position: absolute; bottom: 0;
    width: 7px; border-radius: 4px 4px 0 0;
    transform-origin: bottom center;
}
.blade-green { background: #2ecc71; }
.blade-yellow { background: #d4ac0d; }
.blade-brown { background: #a0522d; }

/* ── Smoke ── */
.smoke {
    position: absolute;
    border-radius: 50%;
    background: rgba(100,100,100,0.6);
    animation: smokeRise 2.2s ease-out infinite;
}

/* ── Rain ── */
.rain {
    position: absolute; width: 2px;
    background: rgba(100,180,255,0.7);
    border-radius: 1px;
    animation: rainFall linear infinite;
}

/* ── Risk badge ── */
.risk-pill-low    { background:#d5f5e3; color:#1e8449; border-radius:25px; padding:6px 20px; font-weight:600; font-size:14px; display:inline-block; margin-bottom:12px; }
.risk-pill-medium { background:#fef9e7; color:#b7770d; border-radius:25px; padding:6px 20px; font-weight:600; font-size:14px; display:inline-block; margin-bottom:12px; }
.risk-pill-high   { background:#fdedec; color:#c0392b; border-radius:25px; padding:6px 20px; font-weight:600; font-size:14px; display:inline-block; margin-bottom:12px; }

/* ── Risk text ── */
.risk-word-low    { font-size: 72px; font-weight:900; color:#2ecc71; letter-spacing:6px; line-height:1; }
.risk-word-medium { font-size: 72px; font-weight:900; color:#f39c12; letter-spacing:6px; line-height:1; }
.risk-word-high   { font-size: 72px; font-weight:900; color:#e74c3c; letter-spacing:6px; line-height:1; }

/* ── Stat cards ── */
.stat-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px; padding: 16px;
    text-align: center;
}
.stat-val { font-size: 26px; font-weight:700; margin: 6px 0; }
.stat-lab { font-size: 11px; color: #aaa; text-transform: uppercase; letter-spacing: 1px; }

/* ── Sidebar ── */
.sidebar-logo {
    text-align: center; padding: 16px 0 20px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    margin-bottom: 16px;
}

/* ── Confidence bar ── */
.conf-bar-bg {
    background: rgba(255,255,255,0.08);
    border-radius: 8px; height: 10px;
    overflow: hidden; margin-top: 8px;
}
.conf-bar-fill { height: 100%; border-radius: 8px; }

/* ── Scene label ── */
.scene-corner-label {
    position: absolute; bottom: 10px; right: 14px;
    font-size: 12px; opacity: 0.7;
    font-style: italic;
}

/* ── Advice box ── */
.advice-box {
    border-radius: 14px; padding: 16px 20px;
    margin-top: 16px; font-size: 14px;
    border-left: 4px solid;
    animation: slideIn 0.4s ease;
}

/* ── Running farmer ── */
.farmer-running {
    animation: runnerBounce 0.8s ease-in-out infinite !important;
}

/* ── Smart Mobile Frame for WhatsApp Simulator ── */
.mobile-container {
    width: 330px;
    height: 520px;
    background-color: #0d1e2d;
    border: 8px solid #334e68;
    border-radius: 36px;
    margin: 0 auto;
    position: relative;
    overflow: hidden;
    box-shadow: 0 20px 45px rgba(0,0,0,0.6);
    font-family: 'Inter', sans-serif;
}
.mobile-status-bar {
    height: 20px;
    background-color: #075e54;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
    font-size: 10px;
    color: #fff;
    opacity: 0.85;
}
.mobile-header {
    height: 48px;
    background-color: #075e54;
    display: flex;
    align-items: center;
    padding: 0 12px;
    gap: 8px;
}
.mobile-avatar {
    width: 32px;
    height: 32px;
    background-color: #4ecca3;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
}
.mobile-header-info {
    flex: 1;
}
.mobile-contact-name {
    font-weight: 700;
    font-size: 13px;
    color: #fff;
}
.mobile-contact-status {
    font-size: 9px;
    color: #b9ebd6;
}
.mobile-body {
    height: 400px;
    background: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png');
    background-size: cover;
    padding: 12px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}
.mobile-msg-bubble {
    background-color: #dcf8c6;
    color: #333;
    max-width: 85%;
    padding: 10px 12px;
    border-radius: 8px;
    margin-bottom: 8px;
    align-self: flex-start;
    position: relative;
    font-size: 12px;
    line-height: 1.4;
    box-shadow: 0 1px 2px rgba(0,0,0,0.15);
}
.mobile-msg-bubble::before {
    content: '';
    position: absolute;
    top: 0;
    left: -8px;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 10px 10px 0;
    border-color: transparent #dcf8c6 transparent transparent;
}
.mobile-msg-time {
    font-size: 8px;
    color: #888;
    text-align: right;
    margin-top: 4px;
}
.mobile-input-bar {
    height: 52px;
    background-color: #075e54;
    position: absolute;
    bottom: 0;
    width: 100%;
    display: flex;
    align-items: center;
    padding: 0 10px;
    gap: 8px;
}
.mobile-text-input {
    flex: 1;
    background: #fff;
    border-radius: 20px;
    height: 32px;
    border: none;
    padding: 0 12px;
    font-size: 11px;
    color: #555;
}
.mobile-send-circle {
    width: 32px;
    height: 32px;
    background-color: #128c7e;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
}
/* ── ORGANIC FOREST THEME ── */
:root {
    --kisan-primary: #2d5a27;
    --kisan-leaf: #7aba2a;
    --kisan-gold: #cca035;
    --kisan-earth: #3e2618;
    --kisan-cream: #f7f9f6;
    --kisan-dark: #0f1e0f;
}

/* Override Streamlit app background to forest dark */
.stApp {
    background: linear-gradient(160deg, #0c1a0c 0%, #0f2010 60%, #081508 100%) !important;
}

/* Sidebar organic styling */
[data-testid="stSidebar"] {
    background: linear-gradient(180deg, #0c1a0c 0%, #162a15 100%) !important;
    border-right: 1px solid rgba(122, 186, 42, 0.15) !important;
}
[data-testid="stSidebar"] * { color: #d4edcc !important; }

/* Sidebar logo/title */
[data-testid="stSidebar"] h1,
[data-testid="stSidebar"] h2,
[data-testid="stSidebar"] h3 {
    color: #7aba2a !important;
    font-family: 'Outfit', 'Segoe UI', sans-serif !important;
}

/* Organic metric cards */
[data-testid="stMetric"] {
    background: rgba(45, 90, 39, 0.1);
    border: 1px solid rgba(122, 186, 42, 0.2);
    border-radius: 16px;
    padding: 1rem;
}

/* Leaf-green primary buttons */
.stButton > button {
    background: linear-gradient(135deg, #2d5a27, #7aba2a) !important;
    color: #fff !important;
    border: none !important;
    border-radius: 50px !important;
    font-weight: 600 !important;
    padding: 0.5rem 1.5rem !important;
    transition: all 0.3s !important;
    box-shadow: 0 4px 15px rgba(122, 186, 42, 0.25) !important;
}
.stButton > button:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 20px rgba(122, 186, 42, 0.4) !important;
}

/* Section headers organic styling */
h1 { color: #7aba2a !important; font-family: 'Outfit', 'Segoe UI', sans-serif !important; }
h2 { color: #cca035 !important; }
h3 { color: #d4edcc !important; }

/* Organic divider */
hr {
    border-color: rgba(122, 186, 42, 0.15) !important;
}

/* Tab styling — leaf green active */
[data-baseweb="tab-list"] {
    background: rgba(15, 30, 15, 0.8) !important;
    border-radius: 50px !important;
    padding: 4px !important;
    border: 1px solid rgba(122, 186, 42, 0.15) !important;
}
[data-baseweb="tab"][aria-selected="true"] {
    background: linear-gradient(135deg, #2d5a27, #7aba2a) !important;
    border-radius: 50px !important;
    color: #fff !important;
}
[data-baseweb="tab"] {
    color: #8fa08f !important;
}

/* Select boxes organic */
[data-baseweb="select"] > div {
    background: rgba(15, 30, 15, 0.6) !important;
    border: 1px solid rgba(122, 186, 42, 0.2) !important;
    border-radius: 12px !important;
    color: #d4edcc !important;
}

/* Slider organic green */
[data-testid="stSlider"] > div > div > div > div {
    background: #7aba2a !important;
}

/* Input fields */
[data-testid="stTextInput"] > div > div,
[data-testid="stNumberInput"] > div > div {
    background: rgba(15, 30, 15, 0.6) !important;
    border: 1px solid rgba(122, 186, 42, 0.2) !important;
    border-radius: 12px !important;
    color: #d4edcc !important;
}

/* Expander cards */
[data-testid="stExpander"] {
    background: rgba(15, 30, 15, 0.5);
    border: 1px solid rgba(122, 186, 42, 0.15);
    border-radius: 16px;
}

/* Success / info / warning boxes themed */
[data-testid="stAlert"] {
    border-radius: 16px !important;
    border-left-width: 4px !important;
}
</style>
""", unsafe_allow_html=True)

# ============================================================
# Language Selector (Sidebar Top)
# ============================================================
lang_sel = st.sidebar.selectbox(
    "🌐 Language / भाषा / ભાષા", 
    ["English", "हिंदी (Hindi)", "ગુજરાતી (Gujarati)"], 
    index=0
)
lang_code = "en"
if "हिंदी" in lang_sel:
    lang_code = "hi"
elif "ગુજરાતી" in lang_sel:
    lang_code = "gu"

# Shortcuts for easy dictionary lookups
txt = TL[lang_code]

# ============================================================
# Load ML Model and Normalizers
# ============================================================
@st.cache_resource
def load_model():
    with open("climategaurd_model.pkl", "rb") as f:
        return pickle.load(f)

@st.cache_resource
def load_norm():
    with open("climategaurd_norm.json", "r") as f:
        return json.load(f)

@st.cache_data
def load_fire_data():
    df = pd.read_csv("climategaurd_clean.csv")
    df["acq_date"] = pd.to_datetime(df["acq_date"])
    df["month"]    = df["acq_date"].dt.month
    df["day_of_year"] = df["acq_date"].dt.dayofyear

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
# Predictor & Sowing Logic Helpers
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
        "latitude_norm":    normalize_value(lat, "latitude",  norm_vals),
        "longitude_norm":   normalize_value(lng, "longitude", norm_vals),
    }])
    return model.predict(inp)[0], model.predict_proba(inp)[0]

MONTHS  = ["Jan","Feb","Mar","Apr","May","Jun",
           "Jul","Aug","Sep","Oct","Nov","Dec"]
SEASONS = {0:"Winter ❄️",1:"Summer ☀️",2:"Monsoon 🌧️",3:"Post-Monsoon 🍂"}

# ============================================================
# Farmer SVG Components
# ============================================================
def get_farmer_low():
    return """<svg width="100" height="140" viewBox="0 0 100 140" style="position:absolute;bottom:8px;right:20px;">
        <circle cx="50" cy="30" r="16" fill="#d4a574"/>
        <path d="M34 20 Q34 10 50 8 Q66 10 66 20" fill="#8b6f47"/>
        <rect x="40" y="46" width="20" height="28" rx="3" fill="#52b788"/>
        <line x1="40" y1="52" x2="28" y2="68" stroke="#d4a574" stroke-width="5" stroke-linecap="round"/>
        <line x1="60" y1="52" x2="72" y2="68" stroke="#d4a574" stroke-width="5" stroke-linecap="round"/>
        <rect x="42" y="74" width="7" height="30" fill="#8b6f47"/>
        <rect x="51" y="74" width="7" height="30" fill="#8b6f47"/>
        <ellipse cx="46" cy="107" rx="5" ry="4" fill="#5a4a3a"/>
        <ellipse cx="55" cy="107" rx="5" ry="4" fill="#5a4a3a"/>
        <line x1="28" y1="68" x2="20" y2="90" stroke="#6b5344" stroke-width="3" stroke-linecap="round"/>
        <rect x="18" y="88" width="6" height="12" rx="1" fill="#8b7355"/>
        <path d="M44 36 Q50 40 56 36" stroke="#5a3a2a" stroke-width="1.5" fill="none"/>
        <circle cx="45" cy="28" r="2" fill="#3a2a1a"/>
        <circle cx="55" cy="28" r="2" fill="#3a2a1a"/>
    </svg>"""

def get_farmer_medium():
    return """<svg width="100" height="140" viewBox="0 0 100 140" style="position:absolute;bottom:8px;right:20px;">
        <circle cx="50" cy="35" r="16" fill="#d4a574"/>
        <path d="M34 25 Q34 15 50 13 Q66 15 66 25" fill="#8b6f47"/>
        <rect x="40" y="51" width="20" height="28" rx="3" fill="#e67e22"/>
        <line x1="40" y1="57" x2="25" y2="38" stroke="#d4a574" stroke-width="5" stroke-linecap="round"/>
        <line x1="60" y1="57" x2="75" y2="50" stroke="#d4a574" stroke-width="5" stroke-linecap="round"/>
        <circle cx="25" cy="35" r="6" fill="#d4a574"/>
        <rect x="42" y="79" width="7" height="30" fill="#8b6f47"/>
        <rect x="51" y="79" width="7" height="30" fill="#8b6f47"/>
        <ellipse cx="46" cy="112" rx="5" ry="4" fill="#5a4a3a"/>
        <ellipse cx="55" cy="112" rx="5" ry="4" fill="#5a4a3a"/>
        <path d="M44 41 Q50 38 56 41" stroke="#5a3a2a" stroke-width="1.5" fill="none"/>
        <circle cx="45" cy="32" r="2" fill="#3a2a1a"/>
        <circle cx="55" cy="32" r="2" fill="#3a2a1a"/>
    </svg>"""

def get_farmer_high():
    return """<svg width="100" height="140" viewBox="0 0 100 140" style="position:absolute;bottom:8px;right:20px;" class="farmer-running">
        <circle cx="48" cy="40" r="16" fill="#d4a574"/>
        <path d="M32 30 Q30 20 48 18 Q60 19 66 32" fill="#8b6f47"/>
        <rect x="38" y="56" width="20" height="26" rx="3" fill="#e74c3c" transform="rotate(-15 48 69)"/>
        <line x1="38" y1="62" x2="18" y2="55" stroke="#d4a574" stroke-width="5" stroke-linecap="round"/>
        <line x1="58" y1="62" x2="72" y2="75" stroke="#d4a574" stroke-width="5" stroke-linecap="round"/>
        <line x1="44" y1="82" x2="40" y2="115" stroke="#8b6f47" stroke-width="7" stroke-linecap="round"/>
        <ellipse cx="40" cy="118" rx="5" ry="4" fill="#5a4a3a"/>
        <line x1="52" y1="82" x2="56" y2="105" stroke="#8b6f47" stroke-width="7" stroke-linecap="round"/>
        <ellipse cx="56" cy="108" rx="5" ry="4" fill="#5a4a3a"/>
        <path d="M43 46 Q48 50 53 46" stroke="#5a3a2a" stroke-width="2" fill="none"/>
        <circle cx="44" cy="37" r="2.5" fill="#3a2a1a"/>
        <circle cx="54" cy="37" r="2.5" fill="#3a2a1a"/>
    </svg>"""

# ============================================================
# Animated Farm Scene HTML Builder
# ============================================================
def build_farm_scene(risk_level, season_num, month_name):
    # LOW RISK
    if risk_level == 0:
        blades_html = ""
        for i in range(38):
            left  = i * 2.7 + np.random.uniform(-0.5, 0.5)
            h     = 22 + np.random.uniform(0, 22)
            delay = round(np.random.uniform(0, 2.5), 2)
            dur   = round(1.6 + np.random.uniform(0, 1.4), 2)
            anim  = "sway" if i % 2 == 0 else "sway2"
            blades_html += f"""
            <div class='blade blade-green' style='
                left:{left}%;height:{h}px;
                animation:{anim} {dur}s {delay}s ease-in-out infinite;'></div>"""
        
        rain_html = ""
        for i in range(20):
            left  = np.random.uniform(0, 100)
            h     = round(8 + np.random.uniform(0, 10))
            delay = round(np.random.uniform(0, 2), 2)
            dur   = round(0.6 + np.random.uniform(0, 0.5), 2)
            rain_html += f"""
            <div class='rain' style='
                left:{left}%;height:{h}px;top:-10px;
                animation-duration:{dur}s;
                animation-delay:{delay}s;'></div>"""

        badge_text = "🟢 " + txt["low_lbl"] + " RISK"
        scene = f"""
        <div class='farm-scene'>
          <div class='sky-low'>
            <div class='sun-low'></div>
            <div class='cloud' style='width:80px;height:24px;background:rgba(255,255,255,0.85);
                top:22px;left:180px;animation-duration:7s;'></div>
            <div class='cloud' style='width:55px;height:18px;background:rgba(255,255,255,0.7);
                top:35px;left:380px;animation-duration:9s;animation-delay:2s;'></div>
            <div style='position:absolute;top:14px;right:18px;'>
                <span class='risk-pill-low'>{badge_text}</span>
            </div>
            <div class='scene-corner-label' style='color:#1a5276;bottom:8px;right:14px;'>
                {month_name} · {SEASONS[season_num]}</div>
          </div>
          <div class='ground-low'>
            {blades_html}{rain_html}
            {get_farmer_low()}
          </div>
        </div>"""

    # MEDIUM RISK
    elif risk_level == 1:
        blades_html = ""
        for i in range(22):
            left  = i * 4.5 + np.random.uniform(-1, 1)
            h     = 14 + np.random.uniform(0, 14)
            delay = round(np.random.uniform(0, 2), 2)
            dur   = round(2 + np.random.uniform(0, 1), 2)
            anim  = "sway" if i % 2 == 0 else "sway2"
            blades_html += f"""
            <div class='blade blade-yellow' style='
                left:{left}%;height:{h}px;
                animation:{anim} {dur}s {delay}s ease-in-out infinite;'></div>"""

        badge_text = "🟡 " + txt["med_lbl"] + " RISK"
        scene = f"""
        <div class='farm-scene'>
          <div class='sky-medium'>
            <div class='sun-medium'></div>
            <div class='cloud' style='width:65px;height:20px;
                background:rgba(220,190,100,0.6);
                top:28px;left:220px;animation-duration:10s;'></div>
            <div style='position:absolute;top:14px;right:18px;'>
                <span class='risk-pill-medium'>{badge_text}</span>
            </div>
            <div class='scene-corner-label' style='color:#7d6608;'>
                {month_name} · {SEASONS[season_num]}</div>
          </div>
          <div class='ground-medium'>
            {blades_html}
            {get_farmer_medium()}
            <svg width='100%' height='80' style='position:absolute;top:0;left:0;'
                 xmlns='http://www.w3.org/2000/svg'>
              <line x1='80' y1='15' x2='110' y2='55' stroke='#8b6914' stroke-width='1.5' opacity='0.5'/>
              <line x1='200' y1='8' x2='175' y2='50' stroke='#8b6914' stroke-width='1' opacity='0.45'/>
              <line x1='340' y1='20' x2='365' y2='60' stroke='#8b6914' stroke-width='1.5' opacity='0.5'/>
            </svg>
          </div>
        </div>"""

    # HIGH RISK
    else:
        smoke_html = ""
        positions = [240, 280, 320, 370, 410]
        for i, pos in enumerate(positions):
            sz    = round(14 + np.random.uniform(0, 14))
            delay = round(i * 0.45, 2)
            smoke_html += f"""
            <div class='smoke' style='
                width:{sz}px;height:{sz}px;
                left:{pos}px;top:{20 + i*4}px;
                animation-delay:{delay}s;'></div>"""

        blades_html = ""
        for i in range(10):
            left  = i * 10 + np.random.uniform(-2, 2)
            h     = 8 + np.random.uniform(0, 10)
            delay = round(np.random.uniform(0, 3), 2)
            blades_html += f"""
            <div class='blade blade-brown' style='
                left:{left}%;height:{h}px;
                animation:sway 3s {delay}s ease-in-out infinite;'></div>"""

        badge_text = "🔴 " + txt["high_lbl"] + " RISK"
        scene = f"""
        <div class='farm-scene'>
          <div class='sky-high'>
            <div class='sun-high'></div>
            {smoke_html}
            <div style='position:absolute;top:14px;right:18px;'>
                <span class='risk-pill-high'>{badge_text}</span>
            </div>
            <div class='scene-corner-label' style='color:#fadbd8;'>
                {month_name} · {SEASONS[season_num]}</div>
          </div>
          <div class='ground-high'>
            {blades_html}
            {get_farmer_high()}
            <svg width='100%' height='80' style='position:absolute;top:0;left:0;'
                 xmlns='http://www.w3.org/2000/svg'>
              <path d='M50 20 Q75 5 100 20 Q125 35 150 20' stroke='#5d3317' stroke-width='2' fill='none' opacity='0.7'/>
              <rect x='270' y='15' width='35' height='50' rx='3' fill='#e74c3c' opacity='0.25'/>
              <polygon points='287,15 262,65 312,65' fill='#e74c3c' opacity='0.2'/>
            </svg>
          </div>
        </div>"""

    return scene

# ============================================================
# Actionable Advice Mapping (Bilingual)
# ============================================================
def get_advice(risk_level, lang_c):
    if lang_c == "hi":
        if risk_level == 0:
            return {
                "color": "#2ecc71", "bg": "rgba(46,204,113,0.1)", "border": "#2ecc71", "icon": "✅",
                "title": "आपका खेत सुरक्षित है",
                "tips": [
                    "सामान्य कृषि गतिविधियां जारी रखना पूरी तरह सुरक्षित है।",
                    "अगली बुवाई के लिए खेत तैयार करने का अच्छा समय है।",
                    "खेतों में सामान्य सिंचाई बनाए रखें; नमी आग के जोखिम को और कम करती है।",
                    "कटी हुई फसलों को सूखे और सुरक्षित शेड में रखें।"
                ]
            }
        elif risk_level == 1:
            return {
                "color": "#f39c12", "bg": "rgba(243,156,18,0.1)", "border": "#f39c12", "icon": "⚠️",
                "title": "इस मौसम में सावधानी बरतें",
                "tips": [
                    "खेत में फसल अवशेष या पराली जलाने से पूरी तरह बचें।",
                    "अपने खेत के पास सिंचाई या पानी के स्रोतों को तैयार रखें।",
                    "खेत के काम शुरू करने से पहले हर सुबह मौसम का पूर्वानुमान अवश्य देखें।",
                    "सूखे की स्थिति के बारे में अपने ग्राम पंचायत को सूचित रखें।"
                ]
            }
        else:
            return {
                "color": "#e74c3c", "bg": "rgba(231,76,60,0.1)", "border": "#e74c3c", "icon": "🚨",
                "title": "खतरा! तत्काल सुरक्षा कदम उठाएं",
                "tips": [
                    "आग दिखाई देने पर तुरंत नजदीकी दमकल केंद्र (101) या आपातकालीन नंबर पर कॉल करें।",
                    "आज खेत या उसके आस-पास बिल्कुल भी आग न जलाएं।",
                    "सूखे भूसे और मवेशियों को सुरक्षित स्थानों पर तुरंत स्थानांतरित करें।",
                    "पड़ोसी किसानों को सचेत करें; सूखे के दिनों में आग बहुत तेजी से फैलती है।"
                ]
            }
    elif lang_c == "gu":
        if risk_level == 0:
            return {
                "color": "#2ecc71", "bg": "rgba(46,204,113,0.1)", "border": "#2ecc71", "icon": "✅",
                "title": "તમારું ખેતર સુરક્ષિત છે",
                "tips": [
                    "ખેતીકામ અને સામાન્ય પ્રવૃત્તિઓ ચાલુ રાખવી સંપૂર્ણ સલામત છે.",
                    "નવી વાવણી માટે ખેતર તૈયાર કરવા માટે ઉત્તમ સમય છે.",
                    "પાકને જરૂર મુજબ પાણી આપો, જમીનમાં ભેજ આગના જોખમને ઘટાડે છે.",
                    "લણેલા પાકને સુરક્ષિત અને સૂકી જગ્યાએ સંગ્રહિત કરો."
                ]
            }
        elif risk_level == 1:
            return {
                "color": "#f39c12", "bg": "rgba(243,156,18,0.1)", "border": "#f39c12", "icon": "⚠️",
                "title": "આ ઋતુમાં સાવચેતી રાખો",
                "tips": [
                    "ખેતરમાં કચરો અથવા પાકના ડૂંડા (પરાલી) સળગાવવાનું ટાળો.",
                    "ખેતર નજીક પાણી અને પંપ મશીનરી તૈયાર રાખો.",
                    "ખેતરમાં કામ શરૂ કરતા પહેલા રોજ સવારે હવામાનની માહિતી મેળવો.",
                    "સ્થાનિક ગ્રામ પંચાયતને સૂકા હવામાન વિશે જાણ કરો."
                ]
            }
        else:
            return {
                "color": "#e74c3c", "bg": "rgba(231,76,60,0.1)", "border": "#e74c3c", "icon": "🚨",
                "title": "જોખમ! તાત્કાલિક સાવચેતીનાં પગલાં લો",
                "tips": [
                    "જો આગ દેખાય તો તરત જ ફાયર સ્ટેશન અથવા ગામ સમિતિને ફોન કરો.",
                    "આજે ખેતર કે તેની નજીક બિલકુલ આગ સળગાવશો નહીં.",
                    "પશુઓ અને કિંમતી ઘાસચારાને સૂકા ઝોનથી દૂર ખસેડો.",
                    "પડોશી ખેડૂતોને સાવધ કરો; પવનથી આગ ખૂબ જ ઝડપથી ફેલાય છે."
                ]
            }
    else: # English (default)
        if risk_level == 0:
            return {
                "color": "#2ecc71", "bg": "rgba(46,204,113,0.1)", "border": "#2ecc71", "icon": "✅",
                "title": "Your farm is safe",
                "tips": [
                    "Normal farming activities are safe to continue.",
                    "Good time to prepare fields for next sowing season.",
                    "Water your crops — moisture reduces fire risk further.",
                    "Store harvested crops in dry, covered storage sheds."
                ]
            }
        elif risk_level == 1:
            return {
                "color": "#f39c12", "bg": "rgba(243,156,18,0.1)", "border": "#f39c12", "icon": "⚠️",
                "title": "Be careful this season",
                "tips": [
                    "Avoid burning stubble or dry residues on your fields.",
                    "Keep water source and pumping setups accessible near your farm.",
                    "Check weather forecast every morning before fieldwork.",
                    "Inform your village safety committee of dry regional conditions."
                ]
            }
        else:
            return {
                "color": "#e74c3c", "bg": "rgba(231,76,60,0.1)", "border": "#e74c3c", "icon": "🚨",
                "title": "Danger! Immediate action needed",
                "tips": [
                    "Call your local fire station immediately if active fire is visible.",
                    "Do NOT light any fire on or near your field today.",
                    "Move livestock and fodder away from dry field areas now.",
                    "Alert your neighbors — fires spread extremely fast in dry wind."
                ]
            }

# ============================================================
# SIDEBAR NAVIGATION
# ============================================================
st.sidebar.markdown(f"""
<div class='sidebar-logo'>
    <div style='font-size:44px;'>🌾</div>
    <div style='font-size:22px;font-weight:700;color:#7dcea0;
                letter-spacing:1px;margin-top:4px;'>{txt["title"]}</div>
    <div style='font-size:11px;color:#5d8a6e;margin-top:4px;'>
        {txt["sidebar_sub"]}</div>
</div>
""", unsafe_allow_html=True)

page = st.sidebar.radio(
    txt["nav"], [
        txt["p_predictor"],
        txt["p_photo"],
        txt["p_crop"],
        txt["p_whatsapp"],
        txt["p_map"],
        txt["p_analytics"],
        txt["p_about"]
    ], 
    label_visibility="collapsed"
)

# Sliders that apply universally to Risk calculations (Shared in Sidebar)
st.sidebar.markdown("---")
st.sidebar.markdown(f"#### {txt['fire_cond']}")
brightness = st.sidebar.slider(txt["brightness_lbl"], 300.0, 400.0, 325.0, 0.5)
frp        = st.sidebar.slider(txt["frp_lbl"], 3.0, 100.0, 15.0, 0.5)

st.sidebar.markdown(f"#### {txt['when_lbl']}")
month = st.sidebar.selectbox(txt["month_lbl"],
    list(range(1,13)), format_func=lambda m: MONTHS[m-1], index=3)

st.sidebar.markdown(f"#### {txt['loc_lbl']}")
latitude  = st.sidebar.slider(txt["lat_lbl"],  8.0,  35.0, 22.0, 0.5)
longitude = st.sidebar.slider(txt["lon_lbl"], 68.0, 97.0, 80.0, 0.5)

st.sidebar.markdown("---")
st.sidebar.markdown(f"""
<div style='font-size:11px;color:#3d6b50;text-align:center;white-space:pre-line;'>
    {txt["sidebar_foot"]}
</div>""", unsafe_allow_html=True)

# Run default RF model prediction
pred, prob  = predict_risk(brightness, frp, month, latitude, longitude)
season      = get_season_num(month)
is_dry      = season in [1, 3]
fire_energy = brightness * frp
advice      = get_advice(pred, lang_code)

RISK_WORDS  = {0: txt["low_lbl"],    1: txt["med_lbl"],   2: txt["high_lbl"]}
RISK_COLORS = {0: "#2ecc71", 1: "#f39c12", 2: "#e74c3c"}
RISK_EMOJI  = {0: "🟢",     1: "🟡",       2: "🔴"}

# ============================================================
# APP TITLE HEADER
# ============================================================
st.markdown(f"""
<div style='padding: 20px 0 10px;'>
    <span style='font-size:36px;'>🌾</span>
    <span style='font-size:30px;font-weight:700;color:#7dcea0;
                 margin-left:10px;vertical-align:middle;'>{txt["title"]}</span>
    <span style='font-size:13px;color:#5d8a6e;margin-left:12px;
                 vertical-align:middle;'>
        {txt["subtitle"]}
    </span>
</div>
""", unsafe_allow_html=True)
st.markdown("---")

# ============================================================
# PAGE 1: RISK PREDICTOR
# ============================================================
if page == txt["p_predictor"]:
    # Animated SVG Scene
    farm_html = build_farm_scene(pred, season, MONTHS[month-1])
    st.markdown(farm_html, unsafe_allow_html=True)

    col_risk, col_conf = st.columns([1, 1])

    with col_risk:
        risk_class = ["risk-word-low","risk-word-medium","risk-word-high"][pred]
        st.markdown(f"""
        <div style='padding: 8px 0;'>
            <div style='font-size:13px;color:#aaa;letter-spacing:3px;
                        text-transform:uppercase;margin-bottom:8px;'>
                {txt["predicted_risk"]}</div>
            <div class='{risk_class}'>{RISK_EMOJI[pred]} {RISK_WORDS[pred]}</div>
            <div style='font-size:14px;color:#ccc;margin-top:12px;'>
                {MONTHS[month-1]} · {SEASONS[season]} · {latitude:.1f}°N {longitude:.1f}°E
            </div>
        </div>
        """, unsafe_allow_html=True)

        # Voice Readout Button Integration
        # Formulate voice statement depending on selected language
        risk_word_speech = RISK_WORDS[pred]
        if lang_code == "hi":
            speech_stmt = f"किसानगार्ड अलर्ट। आपके खेत में आग का खतरा {risk_word_speech} है। कृपया सावधानी बरतें।"
        elif lang_code == "gu":
            speech_stmt = f"કિસાનગાર્ડ ચેતવણી. તમારા ખેતરમાં આગનું જોખમ {risk_word_speech} છે. સાવચેતી રાખો."
        else:
            speech_stmt = f"KisanGuard Alert. The predicted fire risk level for your location is {risk_word_speech}. Keep safe."
        
        speech_lang_map = {"en": "en-IN", "hi": "hi-IN", "gu": "gu-IN"}
        
        html_voice = f"""
        <div style="margin-top: 10px;">
            <button id="voice-btn" style="
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 20px;
                font-weight: 700;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
                box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
                transition: transform 0.2s;
            " onclick="speakPrediction()">
                🔊 {txt["read_aloud"]}
            </button>
        </div>
        <script>
            function speakPrediction() {{
                if ('speechSynthesis' in window) {{
                    window.speechSynthesis.cancel();
                    var utterance = new SpeechSynthesisUtterance("{speech_stmt}");
                    utterance.lang = "{speech_lang_map[lang_code]}";
                    utterance.pitch = 1.0;
                    utterance.rate = 0.9;
                    window.speechSynthesis.speak(utterance);
                }} else {{
                    alert("Speech synthesis not supported in this browser.");
                }}
            }}
        </script>
        """
        st.components.v1.html(html_voice, height=52)

    with col_conf:
        st.markdown(f"<div style='font-size:13px;color:#aaa;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;'>{txt['model_conf']}</div>", unsafe_allow_html=True)
        conf_labels = [txt["low_lbl"] + " Risk", txt["med_lbl"] + " Risk", txt["high_lbl"] + " Risk"]
        conf_colors = ["#2ecc71","#f39c12","#e74c3c"]
        for i, (cls, p) in enumerate(zip(model.classes_, prob)):
            bw = "2px" if cls == pred else "1px"
            st.markdown(f"""
            <div style='margin-bottom:10px;background:rgba(255,255,255,0.04);
                        border:{bw} solid {conf_colors[i]}44;
                        border-radius:10px;padding:10px 14px;'>
                <div style='display:flex;justify-content:space-between;
                            font-size:13px;margin-bottom:6px;'>
                    <span style='color:#ccc;'>{conf_labels[i]}</span>
                    <span style='color:{conf_colors[i]};font-weight:600;'>
                        {p*100:.1f}%</span>
                </div>
                <div class='conf-bar-bg'>
                    <div class='conf-bar-fill' style='
                        width:{p*100:.1f}%;
                        background:{conf_colors[i]};'></div>
                </div>
            </div>""", unsafe_allow_html=True)

    # Actionable Advice Tips
    tips_html = "".join([
        f"<li style='margin:6px 0;font-size:14px;'>{t}</li>"
        for t in advice["tips"]
    ])
    st.markdown(f"""
    <div class='advice-box' style='
        background:{advice["bg"]};
        border-left-color:{advice["border"]};
        color:#ddd;'>
        <div style='font-size:16px;font-weight:600;
                    color:{advice["color"]};margin-bottom:10px;'>
            {advice["icon"]} {advice["title"]}
        </div>
        <ul style='margin:0;padding-left:18px;color:#ccc;'>
            {tips_html}
        </ul>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # 4 Stats Cards Below
    s1,s2,s3,s4 = st.columns(4)
    b_stat = (txt["brightness_sub_extreme"] if brightness>355 
              else txt["brightness_sub_high"] if brightness>335 
              else txt["brightness_sub_normal"])
    f_stat = (txt["frp_sub_extreme"] if frp>60 
              else txt["frp_sub_strong"] if frp>25 
              else txt["frp_sub_moderate"])
    s_stat = (txt["dry_season_alert"] if is_dry else txt["wet_season_alert"])
    
    stats = [
        (txt["brightness"],  f"{brightness:.0f}K",    RISK_COLORS[pred], b_stat),
        (txt["fire_power"],  f"{frp:.0f} MW",          "#e67e22",        f_stat),
        (txt["season"],      SEASONS[season],           "#e74c3c" if is_dry else "#2ecc71", s_stat),
        (txt["fire_energy"], f"{fire_energy:,.0f}",     "#9b59b6",        txt["fire_energy_desc"]),
    ]
    for col,(lbl,val,color,sub) in zip([s1,s2,s3,s4],stats):
        with col:
            st.markdown(f"""
            <div class='stat-card'>
                <div class='stat-lab'>{lbl}</div>
                <div class='stat-val' style='color:{color};'>{val}</div>
                <div style='font-size:12px;color:#888;'>{sub}</div>
            </div>""", unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # Feature Importance Plot
    st.markdown(f"<div style='font-size:15px;font-weight:600;color:#7dcea0;margin-bottom:10px;'>{txt['how_decided']}</div>", unsafe_allow_html=True)
    fn  = ["fire_energy","frp","day_of_year","month","is_dry_season",
           "season","brightness","longitude","latitude"]
    imp = model.feature_importances_
    fig,ax = plt.subplots(figsize=(10, 3.2))
    fig.patch.set_facecolor("#0a1628"); ax.set_facecolor("#0a1628")
    si = np.argsort(imp)
    fc = ["#e74c3c" if imp[i]>0.2 else "#f39c12" if imp[i]>0.08 else "#3498db" for i in si]
    bars = ax.barh([fn[i] for i in si],[imp[i] for i in si],color=fc,height=0.55)
    ax.set_xlabel("Importance Score",color="#aaa",fontsize=10)
    ax.tick_params(colors="#aaa",labelsize=9)
    for sp in ["top","right"]: ax.spines[sp].set_visible(False)
    for sp in ["bottom","left"]: ax.spines[sp].set_color("#2a4a3a")
    for bar,val in zip(bars,[imp[i] for i in si]):
        ax.text(val+0.003,bar.get_y()+bar.get_height()/2,
                f"{val:.3f}",va="center",color="#aaa",fontsize=8)
    plt.tight_layout()
    st.pyplot(fig)
    plt.close()

# ============================================================
# PAGE 2: FIELD PHOTO DETECTOR
# ============================================================
elif page == txt["p_photo"]:
    st.markdown(f"### {txt['pd_title']}")
    st.write(txt["pd_desc"])
    
    uploaded_file = st.file_uploader(txt["pd_upload_lbl"], type=["jpg", "jpeg", "png"])
    
    if uploaded_file is not None:
        col_img, col_results = st.columns([1, 1])
        
        with col_img:
            image = Image.open(uploaded_file)
            st.image(image, caption="Uploaded Field Photo", use_container_width=True)
            
        with col_results:
            st.markdown(f"#### {txt['pd_results']}")
            
            # Lightweight pixel-level CV analysis logic
            img_rgb = image.convert("RGB")
            # Downsample for lightning-fast analysis
            img_rgb.thumbnail((250, 250))
            img_arr = np.array(img_rgb)
            
            # Normalize shape info
            h_img, w_img, c_img = img_arr.shape
            total_pixels = h_img * w_img
            
            # Extract color masks
            # Red channels dominant with moderate brightness -> Flame
            is_flame = (img_arr[:,:,0] > 175) & (img_arr[:,:,1] > 70) & (img_arr[:,:,1] < 185) & (img_arr[:,:,2] < 70)
            
            # Low saturation, medium brightness close channels -> Smoke (Haze)
            diff_rg = np.abs(img_arr[:,:,0].astype(int) - img_arr[:,:,1].astype(int))
            diff_gb = np.abs(img_arr[:,:,1].astype(int) - img_arr[:,:,2].astype(int))
            is_smoke = (img_arr[:,:,0] > 115) & (img_arr[:,:,0] < 225) & (diff_rg < 15) & (diff_gb < 15)
            
            # Straw/dry crop residue: Gold, yellowish brown
            is_dry = (img_arr[:,:,0] > 120) & (img_arr[:,:,0] < 215) & (img_arr[:,:,1] > 95) & (img_arr[:,:,1] < 180) & (img_arr[:,:,2] < 110) & (img_arr[:,:,0] - img_arr[:,:,1] > 12) & (img_arr[:,:,1] - img_arr[:,:,2] > 15)
            
            # Pixels classified
            flame_count = np.sum(is_flame)
            smoke_count = np.sum(is_smoke)
            dry_count = np.sum(is_dry)
            
            flame_pct = (flame_count / total_pixels) * 100.0
            smoke_pct = (smoke_count / total_pixels) * 100.0
            dry_pct = (dry_count / total_pixels) * 100.0
            green_pct = max(0.0, 100.0 - (flame_pct + smoke_pct + dry_pct))
            
            # Output matching progress bars
            st.markdown(f"🌾 **{txt['pd_dry_biomass']}:** {dry_pct:.1f}%")
            st.progress(float(min(1.0, dry_pct/100.0)))
            
            st.markdown(f"💨 **{txt['pd_smoke_haze']}:** {smoke_pct:.1f}%")
            st.progress(float(min(1.0, smoke_pct/100.0)))
            
            st.markdown(f"🔥 **{txt['pd_flame_intensity']}:** {flame_pct:.1f}%")
            st.progress(float(min(1.0, flame_pct/100.0)))
            
            st.markdown(f"🍀 **{txt['pd_normal_veg']}:** {green_pct:.1f}%")
            st.progress(float(min(1.0, green_pct/100.0)))
            
            st.markdown("---")
            st.markdown(f"#### {txt['pd_assess']}")
            
            # Decision Tree logic on CV indicators
            if flame_pct > 0.4:
                card_bg = "rgba(231,76,60,0.12)"
                card_border = "#e74c3c"
                card_text = "#e74c3c"
                if lang_code == "hi":
                    card_title = "🚨 सक्रिय आग का खतरा!"
                    card_desc = "आपके खेत की फोटो में आग की लपटें पाई गई हैं। तत्काल सुरक्षा कार्रवाई करें और वन विभाग को सूचित करें।"
                elif lang_code == "gu":
                    card_title = "🚨 સક્રિય આગ જોખમ!"
                    card_desc = "તમારા ખેતરના ફોટામાં સક્રિય આગ દેખાઈ રહી છે. તાત્કાલિક સાવચેતીનાં પગલાં લો અને બચાવ કામગીરી શરૂ કરો."
                else:
                    card_title = "🚨 ACTIVE FIRE DETECTED!"
                    card_desc = "High-intensity thermal anomalies match active crop fires. Alert authorities and evacuate immediately."
            elif smoke_pct > 6.0:
                card_bg = "rgba(230,126,34,0.12)"
                card_border = "#e67e22"
                card_text = "#e67e22"
                if lang_code == "hi":
                    card_title = "⚠️ धुआं / धुंध का पता चला"
                    card_desc = "खेत में सुलगती हुई आग या भारी धुआं देखा गया है। पराली जलाने से हवा दूषित हो रही है और आग का जोखिम बढ़ गया है।"
                elif lang_code == "gu":
                    card_title = "⚠️ ધુમાડો / ધુમ્મસ જોવા મળ્યું"
                    card_desc = "ફોટામાં ધુમાડો જોવા મળી રહ્યો છે. પવનની ઝડપના લીધે તે ગંભીર આગ પકડી શકે છે. ચેતતા રહો."
                else:
                    card_title = "⚠️ SMOKE HAZE DETECTED"
                    card_desc = "High concentration of grey smoke pixels suggests localized burning or active smoldering."
            elif dry_pct > 25.0:
                card_bg = "rgba(243,156,18,0.12)"
                card_border = "#f39c12"
                card_text = "#f39c12"
                if lang_code == "hi":
                    card_title = "🌾 सूखी पराली की उच्च मात्रा"
                    card_desc = "खेत में भारी मात्रा में सूखा अवशेष पाया गया है। यदि गर्मी या शुष्क हवा तेज होती है, तो यह अत्यधिक संवेदनशील हो सकती है।"
                elif lang_code == "gu":
                    card_title = "🌾 સૂકી પરાલીનું જોખમ"
                    card_desc = "ખેતરમાં સૂકા કચરાનું પ્રમાણ વધુ છે. સૂકા પવન અને ઊંચા તાપમાનમાં આ પરાલી ઝડપથી આગ પકડી શકે છે."
                else:
                    card_title = "🌾 DRY RESIDUE THREAT"
                    card_desc = "High biomass of dry stubble/straw. The field is highly combustible under elevated temperatures."
            else:
                card_bg = "rgba(46,204,113,0.12)"
                card_border = "#2ecc71"
                card_text = "#2ecc71"
                if lang_code == "hi":
                    card_title = "✅ खेत सुरक्षित है"
                    card_desc = "खेत में प्रचुर मात्रा में हरी वनस्पति या आर्द्र मिट्टी देखी गई है। कोई तत्काल खतरा मौजूद नहीं है।"
                elif lang_code == "gu":
                    card_title = "✅ ખેતર સુરક્ષિત છે"
                    card_desc = "ખેતરમાં લીલી વનસ્પતિ અથવા પૂરતો ભેજ જોવા મળ્યો છે. આગ લાગવાનું જોખમ નહિવત છે."
                else:
                    card_title = "✅ VEGETATION STABLE"
                    card_desc = "Field visual analysis contains high green cover and low combustibility indicators."
            
            st.markdown(f"""
            <div style='background:{card_bg}; border:2px solid {card_border};
                        border-radius:12px; padding:16px; color:{card_text};'>
                <div style='font-size:16px; font-weight:800; margin-bottom:8px;'>{card_title}</div>
                <div style='font-size:13px; color:#fff;'>{card_desc}</div>
            </div>""", unsafe_allow_html=True)
            
    else:
        st.info(txt["pd_no_img"])

# ============================================================
# PAGE 3: CROP ADVISOR
# ============================================================
elif page == txt["p_crop"]:
    st.markdown(f"### {txt['ca_title']}")
    st.write(txt["ca_desc"])
    
    col_inputs, col_recs = st.columns([1, 1.2])
    
    with col_inputs:
        state_sel = st.selectbox(
            txt["ca_state"], 
            ["Punjab", "Haryana", "Uttar Pradesh", "Rajasthan", "Gujarat", "Madhya Pradesh", "Maharashtra", "Bihar", "Andhra Pradesh", "Tamil Nadu", "Karnataka"]
        )
        district_sel = st.text_input(txt["ca_district"], value="Ludhiana")
        land_size = st.slider(txt["ca_land"], 1.0, 50.0, 5.0, 0.5)
        crop_season = st.selectbox(txt["ca_season"], ["Kharif (June-Oct)", "Rabi (Nov-Mar)", "Zaid (Apr-Jun)"])
        
        # Sowing crop choices
        crop_dict = {
            "Kharif (June-Oct)": ["Paddy (Rice)", "Cotton", "Sugarcane", "Soybean", "Maize", "Moong Dal"],
            "Rabi (Nov-Mar)": ["Wheat", "Mustard", "Gram (Chana)", "Barley"],
            "Zaid (Apr-Jun)": ["Moong Dal", "Cucumber", "Watermelon"]
        }
        chosen_crop = st.selectbox(txt["ca_crop_select"], crop_dict[crop_season])
        calc_btn = st.button(txt["ca_calculate"])
        
    with col_recs:
        # Season risk indicator logic based on state + selected season
        s_num = 0 if "Rabi" in crop_season else 1 if "Zaid" in crop_season else 2
        
        # Check overall state threat profile
        high_fire_states = ["Punjab", "Haryana", "Uttar Pradesh", "Bihar", "Madhya Pradesh"]
        is_risk_zone = state_sel in high_fire_states and (s_num == 0 or s_num == 1) # Rabi stubble burning / Zaid peaks
        
        # MSP & crop economics databases
        msp_rates = {
            "Paddy (Rice)": 2183, "Wheat": 2275, "Cotton": 6620, "Sugarcane": 340, 
            "Soybean": 4600, "Maize": 2090, "Moong Dal": 8558, "Mustard": 5650,
            "Gram (Chana)": 5440, "Barley": 1735, "Cucumber": 1200, "Watermelon": 1000
        }
        # Yields in quintals/acre
        crop_yields = {
            "Paddy (Rice)": 22, "Wheat": 19, "Cotton": 8, "Sugarcane": 320,
            "Soybean": 10, "Maize": 18, "Moong Dal": 5, "Mustard": 8,
            "Gram (Chana)": 7, "Barley": 16, "Cucumber": 60, "Watermelon": 80
        }
        # Sowing and operational costs per acre
        crop_costs = {
            "Paddy (Rice)": 16000, "Wheat": 14000, "Cotton": 20000, "Sugarcane": 42000,
            "Soybean": 12000, "Maize": 11000, "Moong Dal": 9000, "Mustard": 10000,
            "Gram (Chana)": 11000, "Barley": 9000, "Cucumber": 15000, "Watermelon": 18000
        }

        # Calculate crop economics
        rate = msp_rates.get(chosen_crop, 2000)
        yield_ac = crop_yields.get(chosen_crop, 10)
        cost_ac = crop_costs.get(chosen_crop, 10000)
        
        gross_rev = yield_ac * rate * land_size
        total_cost = cost_ac * land_size
        net_profit = gross_rev - total_cost

        st.markdown(f"#### {txt['ca_report']}")
        
        # Display Sowing Risk Alerts
        if is_risk_zone and chosen_crop in ["Paddy (Rice)", "Wheat"]:
            st.markdown(f"""
            <div style='background:rgba(231,76,60,0.12); border:1px solid #e74c3c;
                        border-radius:12px; padding:16px; margin-bottom:16px;'>
                <div style='color:#e74c3c; font-weight:800; font-size:15px; margin-bottom:6px;'>
                    {txt["ca_risk_warning"]}</div>
                <div style='font-size:13px; color:#fff;'>{txt["ca_risk_warning_desc"]}</div>
            </div>""", unsafe_allow_html=True)
        else:
            st.markdown(f"""
            <div style='background:rgba(46,204,113,0.12); border:1px solid #2ecc71;
                        border-radius:12px; padding:16px; margin-bottom:16px;'>
                <div style='color:#2ecc71; font-weight:800; font-size:15px; margin-bottom:6px;'>
                    {txt["ca_safe_season"]}</div>
                <div style='font-size:13px; color:#fff;'>{txt["ca_safe_season_desc"]}</div>
            </div>""", unsafe_allow_html=True)
            
        # Display Economic Cards
        c1, c2 = st.columns(2)
        with c1:
            st.markdown(f"""
            <div class='stat-card' style='margin-bottom:10px;'>
                <div class='stat-lab'>{txt["ca_msp_val"]} ({chosen_crop})</div>
                <div class='stat-val' style='color:#7dcea0;'>₹{rate}/q</div>
            </div>
            <div class='stat-card'>
                <div class='stat-lab'>{txt["ca_est_revenue"]}</div>
                <div class='stat-val' style='color:#3498db;'>₹{gross_rev:,.0f}</div>
            </div>""", unsafe_allow_html=True)
        with c2:
            st.markdown(f"""
            <div class='stat-card' style='margin-bottom:10px;'>
                <div class='stat-lab'>{txt["ca_exp_yield"]}</div>
                <div class='stat-val' style='color:#e67e22;'>{yield_ac} q/acre</div>
            </div>
            <div class='stat-card'>
                <div class='stat-lab'>{txt["ca_net_profit"]}</div>
                <div class='stat-val' style='color:#2ecc71;'>₹{net_profit:,.0f}</div>
            </div>""", unsafe_allow_html=True)
            
        # Sowing Recommendations & Alternatives
        if is_risk_zone and chosen_crop in ["Paddy (Rice)", "Wheat"]:
            alternative = "Moong Dal" if crop_season == "Kharif (June-Oct)" else "Mustard"
            alt_rate = msp_rates[alternative]
            alt_yield = crop_yields[alternative]
            alt_cost = crop_costs[alternative]
            
            alt_profit = (alt_yield * alt_rate * land_size) - (alt_cost * land_size)
            
            st.markdown("---")
            st.markdown(f"💡 **{txt['ca_rec_title']}**")
            
            if lang_code == "hi":
                rec_desc = f"इस समय {chosen_crop} की बजाय **{alternative}** उगाने पर विचार करें। इसमें पराली का मलबा बिल्कुल शून्य होता है, सिंचाई की आवश्यकता 50% कम होती है, और यह {land_size} एकड़ भूमि पर लगभग **₹{alt_profit:,.0f}** का शुद्ध मुनाफा देती है, साथ ही फसल सुरक्षा 100% बढ़ जाती है।"
            elif lang_code == "gu":
                rec_desc = f"આ ઋતુમાં {chosen_crop} ની સરખામણીએ **{alternative}** વાવવાની સલાહ આપવામાં આવે છે. તેમાં પરાલી કચરો શૂન્ય રહે છે, પાણીની જરૂરિયાત ખૂબ ઓછી છે અને તે તમારી {land_size} એકર જમીન પર અંદાજે **₹{alt_profit:,.0f}** નો નફો આપશે, જે આગનું જોખમ 90% ટાળે છે."
            else:
                rec_desc = f"Instead of sowing {chosen_crop}, consider planting **{alternative}**. It produces zero flammable residue, requires 50% less irrigation water, nitrifies soil quality, and provides a net profit of **₹{alt_profit:,.0f}** on your {land_size} acres while keeping fire risk down to a minimum."
            st.write(rec_desc)

# ============================================================
# PAGE 4: WHATSAPP ALERTS
# ============================================================
elif page == txt["p_whatsapp"]:
    st.markdown(f"### {txt['wa_title']}")
    st.write(txt["wa_sub"])
    
    col_form, col_phone = st.columns([1.1, 1])
    
    with col_form:
        name_input = st.text_input(txt["wa_name"], value="Ram Singh")
        phone_input = st.text_input(txt["wa_phone"], value="+91 98765 43210")
        village_input = st.text_input(txt["wa_village"], value="Rampur")
        
        # Twilio API credentials toggle
        st.markdown("---")
        with st.expander(txt["wa_twilio_settings"]):
            st.markdown("""<div style='font-size:12px;color:#aaa;'>
            You can utilize your Twilio Trial credentials to receive a real WhatsApp notification on your phone.
            Make sure to join the Twilio Sandbox (send `join <sandbox-code>` to +1 415 523 8886) beforehand.
            </div>""", unsafe_allow_html=True)
            twilio_sid = st.text_input("Twilio Account SID")
            twilio_token = st.text_input("Twilio Auth Token", type="password")
            twilio_from = st.text_input("Twilio WhatsApp From Number", placeholder="whatsapp:+14155238886")
            twilio_to = st.text_input("Twilio WhatsApp To Number", placeholder="whatsapp:+919876543210")
            
        sub_btn = st.button(txt["wa_subscribe"])
        test_alert = st.button(txt["wa_test_btn"])
        
        if sub_btn:
            st.success(txt["wa_success"])
            
    with col_phone:
        st.markdown(f"#### {txt['wa_sub_title']}")
        st.write(txt["wa_sim_mode"])
        
        # Format simulated message content
        risk_word_translated = RISK_WORDS[pred]
        if lang_code == "hi":
            wa_text = f"🔴 *किसानगार्ड अलर्ट*<br><br>स्थान: <b>{village_input}</b><br>जोखिम स्तर: <b>{risk_word_translated}</b> 🚨<br><br><b>साप्यहिक सलाह:</b> शुष्क मौसम के कारण इस सप्ताह आग का खतरा अत्यधिक है। खेतों में फसल अवशेष या सूखी पराली जलाने से पूरी तरह बचें। सुरक्षित सीमा पर पानी का छिड़काव करें। आपातकालीन दमकल नंबर तैयार रखें।"
        elif lang_code == "gu":
            wa_text = f"🔴 *કિસાનગાર્ડ ચેતવણી*<br><br>સ્થળ: <b>{village_input}</b><br>જોખમ સ્તર: <b>{risk_word_translated}</b> 🚨<br><br><b>આગ સલાહ:</b> સૂકા પવન અને ગરમ તાપમાનના લીધે આગનું જોખમ વધુ છે. ખેતરમાં કચરો અથવા પરાલી સળગાવશો નહિ. આગ લાગે તો સ્થાનિક પાણી પંપ સેટ તૈયાર રાખવા."
        else:
            wa_text = f"🔴 *KisanGuard Alert*<br><br>Location: <b>{village_input}</b><br>Fire Risk: <b>{risk_word_translated}</b> 🚨<br><br><b>Weekly Advisory:</b> High fire index predicted in your geolocated crop zone. Avoid residue or stubble burning. Keep perimeter water lines ready. Alert neighborhood cooperatives."
            
        current_time_str = "10:17 AM"
        
        # Smartphone CSS Interface Mockup
        phone_html = f"""
        <div class="mobile-container">
            <div class="mobile-status-bar">
                <span>KisanGuard Sim</span>
                <span>LTE</span>
                <span>94% 🔋</span>
            </div>
            <div class="mobile-header">
                <div class="mobile-avatar">🌾</div>
                <div class="mobile-header-info">
                    <div class="mobile-contact-name">KisanGuard Alerts</div>
                    <div class="mobile-contact-status">online</div>
                </div>
            </div>
            <div class="mobile-body">
                <div class="mobile-msg-bubble">
                    {wa_text}
                    <div class="mobile-msg-time">{current_time_str} ✔️✔️</div>
                </div>
            </div>
            <div class="mobile-input-bar">
                <div class="mobile-text-input">Type a message...</div>
                <div class="mobile-send-circle">➔</div>
            </div>
        </div>
        """
        st.markdown(phone_html, unsafe_allow_html=True)
        
        if test_alert:
            # Twilio active sending execution
            sent_real = False
            if twilio_sid and twilio_token and twilio_from and twilio_to:
                if twilio_available:
                    try:
                        client = Client(twilio_sid, twilio_token)
                        # Remove HTML breaks for SMS text
                        plain_text = wa_text.replace("<br>", "\n").replace("<b>", "").replace("</b>", "").replace("*", "")
                        message = client.messages.create(
                            body=plain_text,
                            from_=twilio_from,
                            to=twilio_to
                        )
                        st.success(f"Twilio message dispatched successfully! SID: {message.sid}")
                        sent_real = True
                    except Exception as e:
                        st.error(f"Twilio sending failed: {str(e)}")
                else:
                    st.error("Twilio python package is missing on the host environment.")
            
            if not sent_real:
                st.success(txt["wa_msg_sent"])

# ============================================================
# PAGE 5: FIRE MAP
# ============================================================
elif page == txt["p_map"]:
    st.markdown(f"### 🗺️ {txt['p_map']}")
    
    mc1, mc2, mc3 = st.columns(3)
    with mc1:
        map_type = st.selectbox(txt["map_style"], [txt["map_type_dot"], txt["map_type_heat"]])
    with mc2:
        month_filter = st.selectbox(txt["filter_month"], [txt["all_months"]]+[f"{MONTHS[i]} ({i+1})" for i in range(12)])
    with mc3:
        risk_filter = st.selectbox(txt["filter_risk"], [txt["all_risks"], txt["high_only"], txt["med_high"]])

    map_df = fire_df.copy()
    if month_filter != txt["all_months"]:
        m_num = int(month_filter.split("(")[1].replace(")",""))
        map_df = map_df[map_df["month"] == m_num]
    if risk_filter == txt["high_only"]:
        map_df = map_df[map_df["risk_label"]=="High"]
    elif risk_filter == txt["med_high"]:
        map_df = map_df[map_df["risk_label"].isin(["Medium","High"])]

    # Cap to sample points for fast display on Folium
    if len(map_df) > 1500:
        map_df = map_df.groupby("risk_label", group_keys=False).apply(
            lambda x: x.sample(min(len(x), int(1500*len(x)/len(map_df))), random_state=42))

    st.markdown(f"<div style='font-size:12px; color:#888; margin-bottom:8px;'>{txt['map_showing'].format(count=len(map_df))}</div>", unsafe_allow_html=True)

    india_map = folium.Map(location=[22.5,82.0], zoom_start=5,
                           tiles="CartoDB dark_matter", prefer_canvas=True)

    if map_type == txt["map_type_dot"]:
        callback = """
        function(row) {
            var marker = L.circleMarker(new L.LatLng(row[0], row[1]),
                {radius:row[3], color:row[2], fillColor:row[2],
                 fillOpacity:0.7, weight:1});
            marker.bindTooltip(row[4]);
            return marker;
        }"""
        FastMarkerCluster(
            data=map_df[["latitude","longitude","risk_color","dot_size","risk_label"]].values.tolist(),
            callback=callback, disableClusteringAtZoom=7
        ).add_to(india_map)
    else:
        HeatMap(map_df[["latitude","longitude","frp"]].values.tolist(),
                min_opacity=0.3, radius=14, blur=10,
                gradient={0.2:"blue",0.45:"lime",0.65:"yellow",1.0:"red"}
        ).add_to(india_map)

    # Star indicating selected farmer coordinates
    folium.Marker(
        location=[latitude, longitude],
        popup=folium.Popup(
            f"<b>⭐ Your Location</b><br><b>Prediction:</b> {RISK_WORDS[pred]}<br>"
            f"<b>Confidence:</b> {max(prob)*100:.0f}%", max_width=180),
        icon=folium.Icon(color="purple", icon="star", prefix="fa"),
        tooltip=f"⭐ {RISK_WORDS[pred]} risk"
    ).add_to(india_map)

    st_folium(india_map, width=None, height=520, use_container_width=True, returned_objects=[])

    st.markdown("---")
    t1,t2,t3,t4 = st.columns(4)
    rc_counts = fire_df["risk_label"].value_counts()
    peak_m    = fire_df["month"].value_counts().idxmax()
    for col,(lbl,key,color) in zip([t1,t2,t3],[
        (txt["map_legend_high"], "High",   "#e74c3c"),
        (txt["map_legend_med"],  "Medium", "#f39c12"),
        (txt["map_legend_low"],   "Low",    "#2ecc71"),
    ]):
        with col:
            st.markdown(f"""
            <div style='background:rgba(255,255,255,0.04); border:1px solid {color};
                        border-radius:12px; padding:16px; text-align:center;'>
                <div style='font-size:11px; color:#888;'>{lbl}</div>
                <div style='font-size:32px; font-weight:700; color:{color};'>
                    {rc_counts.get(key,0):,}</div>
            </div>""", unsafe_allow_html=True)
    with t4:
        st.markdown(f"""
        <div style='background:rgba(255,255,255,0.04); border:1px solid #9b59b6;
                    border-radius:12px; padding:16px; text-align:center;'>
            <div style='font-size:11px; color:#888;'>{txt["map_peak_month"]}</div>
            <div style='font-size:32px; font-weight:700; color:#9b59b6;'>
                {MONTHS[peak_m-1]}</div>
        </div>""", unsafe_allow_html=True)

# ============================================================
# PAGE 6: ANALYTICS
# ============================================================
elif page == txt["p_analytics"]:
    st.markdown(f"### {txt['an_title']}")
    st.write(txt["an_desc"])

    # Top stats row
    a1,a2,a3,a4 = st.columns(4)
    total = len(fire_df)
    peak_b = fire_df["brightness"].max()
    peak_frp = fire_df["frp"].max()
    avg_frp = fire_df["frp"].mean()
    for col,(lbl,val,color,sub) in zip([a1,a2,a3,a4],[
        (txt["an_total"], f"{total:,}", "#4ecca3", "NASA MODIS detections"),
        (txt["an_peak_b"],   f"{peak_b:.0f}K", "#e74c3c", "Hottest fire recorded"),
        (txt["an_peak_frp"],   f"{peak_frp:.0f}MW","#e67e22","Maximum FRP detected"),
        (txt["an_avg_frp"],    f"{avg_frp:.1f}MW", "#9b59b6","Mean FRP across all fires"),
    ]):
        with col:
            st.markdown(f"""
            <div style='background:rgba(255,255,255,0.04);
                        border:1px solid {color}44;
                        border-top: 3px solid {color};
                        border-radius:12px; padding:18px; text-align:center;'>
                <div style='font-size:10px; color:#888; text-transform:uppercase;
                            letter-spacing:2px; margin-bottom:8px;'>{lbl}</div>
                <div style='font-size:30px; font-weight:800; color:{color};'>{val}</div>
                <div style='font-size:11px; color:#666; margin-top:4px;'>{sub}</div>
            </div>""", unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # Charts line up
    ch1, ch2 = st.columns(2)

    with ch1:
        st.markdown(f"<div style='font-size:15px; font-weight:600; color:#4ecca3; margin-bottom:8px;'>{txt['an_monthly_count']}</div>", unsafe_allow_html=True)
        monthly = fire_df.groupby("month").size()
        fig,ax = plt.subplots(figsize=(7,3.5))
        fig.patch.set_facecolor("#0a1628"); ax.set_facecolor("#0a1628")
        bar_colors = ["#e74c3c" if monthly[m]==monthly.max()
                      else "#f39c12" if monthly[m]>monthly.quantile(0.66)
                      else "#3498db" for m in monthly.index]
        ax.bar(monthly.index, monthly.values, color=bar_colors, alpha=0.85)
        ax.set_xticks(range(1,13))
        ax.set_xticklabels(["J","F","M","A","M","J","J","A","S","O","N","D"],color="#ccc")
        ax.set_ylabel("Fire Events", color="#aaa", fontsize=10)
        ax.tick_params(colors="#ccc", labelsize=9)
        for sp in ["top","right"]: ax.spines[sp].set_visible(False)
        for sp in ["bottom","left"]: ax.spines[sp].set_color("#333")
        
        peak_idx = monthly.idxmax()
        ax.annotate(f"PEAK\n{monthly[peak_idx]:,}",
                    xy=(peak_idx, monthly[peak_idx]),
                    xytext=(peak_idx+1, monthly[peak_idx]*0.95),
                    color="#e74c3c", fontsize=8, fontweight="bold",
                    arrowprops=dict(arrowstyle="->", color="#e74c3c"))
        plt.tight_layout(); st.pyplot(fig); plt.close()

    with ch2:
        st.markdown(f"<div style='font-size:15px; font-weight:600; color:#4ecca3; margin-bottom:8px;'>{txt['an_avg_bright']}</div>", unsafe_allow_html=True)
        avg_bright = fire_df.groupby("month")["brightness"].mean()
        fig,ax = plt.subplots(figsize=(7,3.5))
        fig.patch.set_facecolor("#0a1628"); ax.set_facecolor("#0a1628")
        ax.plot(avg_bright.index, avg_bright.values, color="#f39c12",
                linewidth=2.5, marker="o", markersize=6)
        ax.fill_between(avg_bright.index, avg_bright.values,
                        avg_bright.min(), alpha=0.15, color="#f39c12")
        ax.set_xticks(range(1,13))
        ax.set_xticklabels(["J","F","M","A","M","J","J","A","S","O","N","D"],color="#ccc")
        ax.set_ylabel("Avg Brightness (K)", color="#aaa", fontsize=10)
        ax.tick_params(colors="#ccc", labelsize=9)
        for sp in ["top","right"]: ax.spines[sp].set_visible(False)
        for sp in ["bottom","left"]: ax.spines[sp].set_color("#333")
        plt.tight_layout(); st.pyplot(fig); plt.close()

    ch3, ch4 = st.columns(2)

    with ch3:
        st.markdown(f"<div style='font-size:15px; font-weight:600; color:#4ecca3; margin-bottom:8px;'>{txt['an_risk_season']}</div>", unsafe_allow_html=True)
        season_risk = fire_df.groupby(["season","risk_label"]).size().unstack(fill_value=0)
        fig,ax = plt.subplots(figsize=(7,3.5))
        fig.patch.set_facecolor("#0a1628"); ax.set_facecolor("#0a1628")
        seasons_order = ["Winter","Summer","Monsoon","Post-Monsoon"]
        colors_risk = {"High":"#e74c3c","Medium":"#f39c12","Low":"#2ecc71"}
        bottom = np.zeros(len(seasons_order))
        for risk_lbl, color in colors_risk.items():
            if risk_lbl in season_risk.columns:
                vals = [season_risk.loc[s,risk_lbl] if s in season_risk.index else 0
                        for s in seasons_order]
                ax.bar(seasons_order, vals, bottom=bottom,
                       color=color, alpha=0.85, label=risk_lbl)
                bottom += np.array(vals)
        ax.legend(loc="upper right", fontsize=9,
                  facecolor="#1a1a2e", labelcolor="white")
        ax.set_ylabel("Fire Events", color="#aaa", fontsize=10)
        ax.tick_params(colors="#ccc", labelsize=9)
        ax.set_xticklabels(seasons_order, color="#ccc", fontsize=9)
        for sp in ["top","right"]: ax.spines[sp].set_visible(False)
        for sp in ["bottom","left"]: ax.spines[sp].set_color("#333")
        plt.tight_layout(); st.pyplot(fig); plt.close()

    with ch4:
        st.markdown(f"<div style='font-size:15px; font-weight:600; color:#4ecca3; margin-bottom:8px;'>{txt['an_frp_dist']}</div>", unsafe_allow_html=True)
        fig,ax = plt.subplots(figsize=(7,3.5))
        fig.patch.set_facecolor("#0a1628"); ax.set_facecolor("#0a1628")
        ax.hist(fire_df["frp"], bins=60, color="#9b59b6", alpha=0.8, edgecolor="none")
        ax.axvline(fire_df["frp"].mean(), color="#f39c12", linewidth=2,
                   linestyle="--", label=f"Mean: {fire_df['frp'].mean():.1f}MW")
        ax.axvline(fire_df["frp"].quantile(0.9), color="#e74c3c", linewidth=2,
                   linestyle="--", label=f"90th pct: {fire_df['frp'].quantile(0.9):.1f}MW")
        ax.legend(fontsize=9, facecolor="#1a1a2e", labelcolor="white")
        ax.set_xlabel("Fire Radiative Power (MW)", color="#aaa", fontsize=10)
        ax.set_ylabel("Number of fires", color="#aaa", fontsize=10)
        ax.tick_params(colors="#ccc", labelsize=9)
        for sp in ["top","right"]: ax.spines[sp].set_visible(False)
        for sp in ["bottom","left"]: ax.spines[sp].set_color("#333")
        plt.tight_layout(); st.pyplot(fig); plt.close()

# ============================================================
# PAGE 7: ABOUT PROJECT
# ============================================================
elif page == txt["p_about"]:
    st.markdown(f"### ℹ️ {txt['p_about']}")
    
    col_about, col_tech = st.columns(2)

    with col_about:
        st.markdown("""
        <div style='background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1);
                    border-radius:16px; padding:24px; margin-bottom:16px;'>
            <div style='font-size:16px; font-weight:600; color:#4ecca3; margin-bottom:12px;'>
                🎯 What is KisanGuard AI?</div>
            <div style='color:#ccc; font-size:14px; line-height:1.7;'>
                KisanGuard AI is a full-stack machine learning web application built for Indian farmers. It uses real NASA FIRMS MODIS satellite fire data to predict hyperlocal climate fire risk for any location in India. The name "Kisan" means farmer in Hindi — this product was built specifically for India's 100 million farmers who have no early warning system for fire risk.
            </div>
        </div>

        <div style='background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1);
                    border-radius:16px; padding:24px; margin-bottom:16px;'>
            <div style='font-size:16px; font-weight:600; color:#4ecca3; margin-bottom:12px;'>
                📡 Data Source</div>
            <div style='color:#ccc; font-size:14px; line-height:1.7;'>
                <b style='color:#f39c12;'>NASA FIRMS MODIS</b> — Fire Information for
                Resource Management System. The MODIS sensor orbits Earth at 705km
                altitude and detects active fires using thermal infrared imaging.
                This project uses 74,000+ real fire detections from India in 2024.
            </div>
        </div>

        <div style='background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1);
                    border-radius:16px; padding:24px;'>
            <div style='font-size:16px; font-weight:600; color:#4ecca3; margin-bottom:12px;'>
                🌍 Real World Impact</div>
            <div style='color:#ccc; font-size:14px; line-height:1.7;'>
                India loses 3.7 million hectares to fire annually. Early warning
                systems like KisanGuard AI can alert farmers, forest departments
                and emergency services before conditions escalate — potentially
                saving crops, wildlife and human lives.
            </div>
        </div>""", unsafe_allow_html=True)

    with col_tech:
        st.markdown("""
        <div style='background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1);
                    border-radius:16px; padding:24px; margin-bottom:16px;'>
            <div style='font-size:16px; font-weight:600; color:#4ecca3; margin-bottom:12px;'>
                🔬 ML Pipeline</div>
            <div style='color:#ccc; font-size:13px; line-height:2;'>
                📥 <b>Data:</b> 74,000 NASA FIRMS MODIS fire events<br>
                🧹 <b>Cleaning:</b> IQR outlier removal, duplicate filtering<br>
                ⚙️ <b>Features:</b> 9 engineered features incl. fire energy<br>
                🌲 <b>Model:</b> Random Forest (100 estimators)<br>
                🎯 <b>Tuning:</b> GridSearchCV — 81 combinations tested<br>
                ✅ <b>Accuracy:</b> 93.3% cross-validated (5-fold)<br>
                🚀 <b>Deployment:</b> Streamlit Cloud (live URL)
            </div>
        </div>

        <div style='background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1);
                    border-radius:16px; padding:24px; margin-bottom:16px;'>
            <div style='font-size:16px; font-weight:600; color:#4ecca3; margin-bottom:12px;'>
                🛠️ Tech Stack</div>
            <div style='color:#ccc; font-size:13px; line-height:2;'>
                🐍 <b>Python 3.10</b> — core language<br>
                🐼 <b>pandas + numpy</b> — data processing<br>
                🌲 <b>scikit-learn</b> — Random Forest ML<br>
                🌐 <b>Streamlit</b> — web app framework<br>
                🗺️ <b>Folium</b> — interactive maps<br>
                📊 <b>matplotlib</b> — data visualisation
            </div>
        </div>

        <div style='background:rgba(78,204,163,0.1); border:1px solid #4ecca3;
                    border-radius:16px; padding:24px;'>
            <div style='font-size:16px; font-weight:600; color:#4ecca3; margin-bottom:12px;'>
                📄 Resume Bullet Points</div>
            <div style='color:#ccc; font-size:12px; line-height:2;'>
                • Built end-to-end ML pipeline on 74K+ NASA satellite fire events<br>
                • Engineered 9 features including composite fire energy metric<br>
                • Trained Random Forest achieving 93.3% cross-validated accuracy<br>
                • Deployed interactive web app with real-time risk prediction<br>
                • Integrated Folium maps displaying 41K+ geolocated fire events
            </div>
        </div>""", unsafe_allow_html=True)

# Footer
st.markdown("---")
st.markdown(f"""
<div style='text-align:center; color:#3d6b50; font-size:12px; padding:8px 0;'>
    🌾 KisanGuard AI &nbsp;|&nbsp; NASA FIRMS MODIS Satellite Data &nbsp;|&nbsp;
    Random Forest ML · 93.3% Accuracy &nbsp;|&nbsp; 41,000+ Training Fire Events
</div>""", unsafe_allow_html=True)